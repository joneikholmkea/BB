import { StatusBar } from 'expo-status-bar';
import { use, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { GameEngine} from 'react-native-game-engine'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DeviceMotion } from 'expo-sensors';

function GameComponent(){
  const [running, setRunning] = useState(true)
  const [motionData, setMotionData] = useState(null)
  const [isMotionAvailable, setIsMotionAvailable] = useState(false)
  const insets = useSafeAreaInsets()
  const {width, height} =  Dimensions.get('window')
  
  useEffect(()=>{
    async function subscribe() {
      const available = await DeviceMotion.isAvailableAsync()
      setIsMotionAvailable(available) // dette tager noget tid...
      if(available){
        DeviceMotion.setUpdateInterval(20) // 20 millisekunder imellem updates
        DeviceMotion.addListener(deviceMotionData =>{
          setMotionData(deviceMotionData)
          //console.log(deviceMotionData)
        })
      }else{
        console.log("ikke adgang til sensor")
      }
    }
    subscribe()
    return ()=>{
      DeviceMotion.removeAllListeners()
    }
  },[])


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
          top: height - 36,
          width: size,
          height: size/5,
          borderRadius: size / 2
        }}
        >
        </View>
      )
    }
  }
// Opgave: få bolden til at bounce på bat, ellers falde ned og spillet stopper.


  function update(entities, { time }){
      const ballEntity = entities.ball
      const batEntity = entities.bat

      let extra = 0
      if(motionData){
        extra = 5.0 * motionData.rotation.beta / 1.5
      }
      if(isNaN(extra)){ extra = 0}

      ballEntity.position.x += ballEntity.velocity.x * time.delta * (1 + extra)
      ballEntity.position.y += ballEntity.velocity.y * time.delta * (1 + extra)
    // højre side
      if(ballEntity.position.x + ballEntity.size > width){
        ballEntity.velocity.x = -1 * Math.abs(ballEntity.velocity.x)
      }
      // venstre side
      if(ballEntity.position.x < 0){
        ballEntity.velocity.x = Math.abs(ballEntity.velocity.x)
      }
       // top
       if(ballEntity.position.y < 0){
        ballEntity.velocity.y = Math.abs(ballEntity.velocity.y)
      }

      // bund
      if(ballEntity.position.y + ballEntity.size > height){
        ballEntity.velocity.y = -1 * Math.abs(ballEntity.velocity.y)
      }

      // flyt bat
      let newPos = 100
      if(isMotionAvailable && motionData){
        newPos = 250 * motionData.rotation.gamma + 150  // gamma giver -1 ... +1
      }
      if(!isNaN(newPos)){
        batEntity.position.x = newPos
      }

      return entities  // få bat til at fungere, så bolden falder igennem hvis ikke man rammer
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
