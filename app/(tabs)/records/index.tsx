import React, { useEffect, useState, useRef } from 'react';

import { Stack, Href, router, useLocalSearchParams } from 'expo-router';

import { TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';

// import { HelloWave } from '@/components/HelloWave';
// import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import * as FileSystem from 'expo-file-system';

import Constants from 'expo-constants';

const apiKeyHuggingFace = Constants.expoConfig?.extra?.API_KEY_HUGGING_FACE;

// require('dotenv').config();
// const apiKeyHuggingFace = process.env.API_KEY_HUGGING_FACE;

// Hugging Face API
import { InferenceClient } from '@huggingface/inference';
const hf = new InferenceClient(apiKeyHuggingFace);


type VQAResponse = {
  answer: string | undefined;
  confidence: number;
};

async function getVisualAnswer(downloadResultUri:any = undefined, imageUri:string = "") {
  try {
    if (downloadResultUri == undefined){
      // 1. Download image
      downloadResultUri = (await FileSystem.downloadAsync(
        imageUri,
        FileSystem.cacheDirectory + 'temp.jpg'
      )).uri;
    }

    // 2. Read as base64
    const base64 = await FileSystem.readAsStringAsync(downloadResultUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 3. Create a fake Blob object that satisfies HF's requirements
    const blobLike = {
      arrayBuffer: async () => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      },
      size: base64.length,
      type: 'image/jpeg',
    };


    const {answer, score} = await hf.visualQuestionAnswering({
      model: 'dandelin/vilt-b32-finetuned-vqa',
      inputs: {
        question: 'What is this?',
        image: blobLike
      }
    });

    console.log(`Answer: "${answer}" (Confidence: ${score.toFixed(2)})`);

    return { answer: answer, confidence: score };

  } catch (error) {
    console.error("Error during VQA:", error);
    return { answer: "Error processing request", confidence: 0 };
  }
}



export default function RecordsHomeScreen() {

  const firstRunRef = useRef(true);

  const [response, setResponse] = useState<VQAResponse | null>(null);

  const { photoUri } = useLocalSearchParams() as {photoUri?: string};

  const CameraPath : Href = '/records/camera';

  const initialURL = 'https://placecats.com/millie_neo/300/200';

  const fetchAnswer = async (downloadedResult:any, imageUri:string) => {
    setResponse(await getVisualAnswer(downloadedResult, imageUri));
  };
  

  useEffect(() => {
    console.log("photoURI Updated:");
    console.log(photoUri);
    if (photoUri != undefined && typeof photoUri === 'string' && photoUri != 'undefined') {
      console.log("Received photo:", photoUri);

      fetchAnswer(photoUri, "");

      // router.setParams({ photoUri: undefined });
    } else {
      fetchAnswer(undefined, initialURL);
    }
  }, [photoUri]);



  return (
    <ThemedView>
      
    <>
      <Stack.Screen options={{ title: 'Records' }} />
    </>


      <ThemedText>
        {response && ('Answer:' + response.answer + "\n")}
        {response && ('Score:' + Math.floor(response.confidence * 1000)/10 + "%\n\n")}
      </ThemedText>

      {photoUri ? (
        <ThemedView>
          <Image
            source={{ uri: photoUri }}
            style={styles.image}
            resizeMode="contain"
          />
          <ThemedText>
            {photoUri}
          </ThemedText>
        </ThemedView>
      ) :

      (
        <ThemedView>
          <Image
            source={{ uri: initialURL }}
            style={styles.image}
            resizeMode="contain"
          />
          <ThemedText>
            {initialURL}
          </ThemedText>
        </ThemedView>
      )
    
      }

      <TouchableOpacity style={styles.button} onPress={() => router.push(CameraPath)}>
        <ThemedText>Take Photo</ThemedText>
      </TouchableOpacity>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  button: {
    backgroundColor: '#841584',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 10,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },

});
