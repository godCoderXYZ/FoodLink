import React, { useEffect, useState, useRef } from 'react';

import { View, TouchableOpacity, Text, Image, Alert, StyleSheet, Platform } from 'react-native';

import { useRouter, Stack, Href } from 'expo-router'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { CameraView, Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
// import { Camera } from 'three';

// type VQAResponse = {
//   answer: string | undefined;
//   confidence: number;
// };


export default function CameraScreen() {

  const [camPerm, setCamPerm] = useState<boolean>();
  const [mediaPerm, setMediaPerm] = useState<boolean>();
  const [camPermAlertShown, setCamPermAlertShown] = useState(false);

  const [facing, setFacing] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  // const router = useRouter();
  // const navigation = useNavigation<NativeStackNavigationProp<any>>();

  function toggleCameraFacing() {
    // setFacing(current );
    console.log(!facing);
    setFacing(!facing)
  }

  // useEffect(() => {

  //   (async () => {
  //     setCamPerm((await Camera.requestCameraPermissionsAsync()).status === "granted");
  //   })();

  // }, [])
  
  // useEffect(() => {

  //   if (!camPerm && !camPermAlertShown && camPerm !== undefined){
  //     Alert.alert('Enable Camera Permission', 'Please enable camera permissions in settings', [
  //       {
  //         text: 'Cancel',
  //         style: 'cancel',
  //       },
  //       {text: 'OK'},
  //     ]);
  //     setCamPermAlertShown(true);
  //   }

  // }, [camPerm, camPermAlertShown])

  // if (camPerm === undefined){
  //   return <Text>{"\n\n\n\n\n\n\n\n"}          Requesting Permissions...</Text>;
  // } else if (!camPerm){
  //   return <Text>{"\n\n\n\n\n\n\n\n"} No Cam Perm...</Text>;
  // }

  console.log("camera permissions checked and all good.")

  return (
    <>
      <Stack.Screen options={{ title: 'Cam' }} />

      <CameraView style={styles.container} facing='front' ref={cameraRef}>

        {/* <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
          <ThemedText style={styles.text}>Flip</ThemedText>
        </TouchableOpacity> */}

        <View style={styles.spacer}/>

        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity style={styles.captureButton}>
            <ThemedView style={styles.captureButtonView}>
              <ThemedView style={styles.captureButtonViewInner}/>
            </ThemedView>
          </TouchableOpacity>

          
        </ThemedView>

        <View style={styles.blackBottom}/>
      </CameraView>

      {/* {
        facing && (


          <CameraView style={styles.container} facing='front' ref={cameraRef}>

            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <ThemedText style={styles.text}>Flip</ThemedText>
            </TouchableOpacity>

            <View style={styles.spacer}/>

            <ThemedView style={styles.buttonContainer}>
              <TouchableOpacity style={styles.captureButton}>
                <ThemedView style={styles.captureButtonView}>
                  <ThemedView style={styles.captureButtonViewInner}/>
                </ThemedView>
              </TouchableOpacity>

              
            </ThemedView>

            <View style={styles.blackBottom}/>
          </CameraView>


        )
      }

      {
        !facing && (


          <CameraView style={styles.container} facing='back' ref={cameraRef}>

            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <ThemedText style={styles.text}>Flip</ThemedText>
            </TouchableOpacity>

            <View style={styles.spacer}/>

            <ThemedView style={styles.buttonContainer}>
              <TouchableOpacity style={styles.captureButton}>
                <ThemedView style={styles.captureButtonView}>
                  <ThemedView style={styles.captureButtonViewInner}/>
                </ThemedView>
              </TouchableOpacity>

              
            </ThemedView>

            <View style={styles.blackBottom}/>
          </CameraView>


        )
      } */}
      
    </>
  )
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    width: '100%',
  },
  spacer:{
    flex: 1,
  },
  blackBottom:{
    backgroundColor: 'black',
    height: 96,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'black',
  },
  button: {
    flex: 1,
    alignSelf: 'flex-start',
  },
  captureButton: {
    paddingTop: 10,
    paddingBottom: 10,
    flex: 1,
  },
  flipButton: {
    marginLeft: 20,
    marginTop: 15,
  },
  captureButtonView: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',

    alignSelf: 'center',
  },
  captureButtonViewInner: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: 'transparent',

    marginTop: 5,
    marginBottom: 5,

    borderWidth: 2,
    borderColor: 'black',

    alignSelf: 'center',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
});