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

type FoodItem = {
  foodType: string | undefined;
  foodTypeWeight: string | undefined;
};

type ResponseDictionary = {
  [key: string]: (string | boolean | Array<FoodItem> | undefined);
};


async function getVisualAnswer(downloadResultUri:any = undefined, imageUri:string = "", question:string = "What is the photo a photo of?") {
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
        question: question,
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

  const [response, setResponse] = useState<ResponseDictionary>({
    "isFood":false,
    "weight":'0',
    "foodData": [
      {
        foodType: "",
        foodTypeWeight: "",
      },
      {
        foodType: "",
        foodTypeWeight: "",
      },
    ]

  });

  const { photoUri } = useLocalSearchParams() as {photoUri?: string};

  const CameraPath : Href = '/records/camera';

  const initialURL = 'https://placecats.com/millie_neo/300/200';

  const fetchAnswer = async (downloadedResult:any=undefined, question:string="What is the photo a photo of?", imageUri:string="") => {
    return (await getVisualAnswer(downloadedResult, imageUri, question));
  };

  const FoodList = ({ items }: { items: FoodItem[] }) => {
    return (
      <ThemedView style={styles.container}>
        {items.map((item, index) => (
          <ThemedView key={index} style={styles.item}>
            <ThemedText>Type: {item.foodType || 'Not specified'}</ThemedText>
            <ThemedText>Weight: {item.foodTypeWeight || 'Not specified'}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
    );
  };

  const updateResponse = async(downloadedResult:any=undefined, imageUri:string="") => {

    const responseCopy = {...response};

    const isFoodPhoto = await fetchAnswer(downloadedResult, "Is there food in the photo?", imageUri);

    if (isFoodPhoto.answer === "Yes" || isFoodPhoto.answer === "yes"){

      responseCopy.isFood = true;
      console.log("is Food set to true");

      const weight = fetchAnswer(downloadedResult, "What is the weight of the food in the photo, in kilograms?", imageUri);
      
      const foodType1 = await fetchAnswer(downloadedResult, "What type of food is in the photo?", imageUri);

      const foodTypeWeight1 = fetchAnswer(downloadedResult, "How many kilograms of " + foodType1 + " are in the photo?", imageUri);

      const hasMoreFoodType = await fetchAnswer(downloadedResult, "Are there more food types in the photo, besides " + foodType1, imageUri);

      responseCopy.weight = (await weight).answer + 'kg';

      const foodData:Array<FoodItem> = [];

      const foodItem1: FoodItem = {
        foodType: (foodType1).answer,
        foodTypeWeight: (await foodTypeWeight1).answer + 'kg',
      }

      foodData.push(foodItem1)

      if (hasMoreFoodType.answer === "Yes" || hasMoreFoodType.answer === "yes"){

        const foodType2 = await fetchAnswer(downloadedResult, "What type of food is in the photo, besides " + foodType1 + "?", imageUri);

        const foodTypeWeight2 = fetchAnswer(downloadedResult, "How many kilograms of " + foodType2 + " are in the photo?", imageUri);

        const foodItem2: FoodItem = {
          foodType: (foodType2).answer,
          foodTypeWeight: (await foodTypeWeight2).answer + 'kg',
        }
        
        foodData.push(foodItem2)

      }

      responseCopy.foodData = foodData;


    } else {
      responseCopy.isFood = false;
    }

    setResponse(responseCopy);

    console.log("updated");
    console.log(response.isFood);
    console.log(response);
    

  };
  

  useEffect(() => {
    console.log("photoURI Updated:");
    console.log(photoUri);
    if (photoUri != undefined && typeof photoUri === 'string' && photoUri != 'undefined') {
      console.log("Received photo:", photoUri);

      // fetchAnswer(photoUri, "What is the total weight of all the food, in kilograms?", "");

      updateResponse(photoUri);


      // router.setParams({ photoUri: undefined });
    } else {
      fetchAnswer(undefined, undefined, initialURL);
    }
  }, [photoUri]);



  return (
    <ThemedView>
      
    <>
      <Stack.Screen options={{ title: 'Records' }} />
    </>


      <ThemedText>
        {response.isFood && (
          
          // 'Weight:' + response.weight + "\n\n" + 'Food Data:\n' + <FoodList items={response.foodData as FoodItem[]} />
          'Weight:' + response.weight + "\n\n" + 'Food Data:\n' + JSON.stringify(response.foodData)
          
        )}
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
  container: {
    padding: 10,
  },
  item: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },

});
