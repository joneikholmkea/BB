import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { GameEngine} from 'react-native-game-engine'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function GameComponent(){
  const [running, setRunning] = useState(true)
  const insets = useSafeAreaInsets()
  const {width, height} =  Dimensions.get('window')
  
  const ball = {
    position:{
      x: width / 2 - 25,
      y: height / 2
    },
    size: 50,
    velocity:{
      x: 0.1,
      y: 0.1
    },
    renderer: (props)=>{
      const {position, size} = props
      return(
        <View
        style={{
          backgroundColor: 'red',
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: size,
          height: size,
          borderRadius: size / 2
        }}
        >
        </View>
      )
    }
  }

  const bat = {
    position:{
      x: width / 2 - 25,
      y: height
    },
    size: 100,
    renderer: (props)=>{
      const {position, size} = props
      return(
        <View
        style={{
          backgroundColor: 'green',
          position: 'absolute',
          left: position.x,
          top: height - 20,
          width: size,
          height: size/5,
          borderRadius: size / 2
        }}
        >
        </View>
      )
    }
  }


  function update(entities, { time }){
      const ballEntity = entities.ball

      ballEntity.position.x += ballEntity.velocity.x * time.delta
      ballEntity.position.y += ballEntity.velocity.y * time.delta
    // højre side
      if(ballEntity.position.x + ballEntity.size > width){
        ballEntity.velocity.x = -1 * Math.abs(ballEntity.velocity.x)
      }
      // venstre side
      if(ballEntity.position.x < 0){
        ballEntity.velocity.x = Math.abs(ballEntity.velocity.x)
      }
      // bund
      if(ballEntity.position.y + ballEntity.size > height){
        ballEntity.velocity.y = -1 * Math.abs(ballEntity.velocity.y)
      }
       // top
       if(ballEntity.position.y < 0){
        ballEntity.velocity.y = Math.abs(ballEntity.velocity.y)
      }

      return entities
  }

  return (
    <View style={[{flex:1}, {paddingBottom:insets.bottom}]}>
      <GameEngine
        running={running}
        entities={{ball, bat}}
        systems={[update]}
        style={{flex:1, backgroundColor:'white'}}
      />
    </View>
  )

}

export default function App() {
  return (
    <SafeAreaProvider>
      <GameComponent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
