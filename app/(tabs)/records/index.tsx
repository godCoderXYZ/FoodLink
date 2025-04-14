import React, { useEffect, useState, useRef } from 'react';

import { Stack, Href, router, useLocalSearchParams } from 'expo-router';

import { ActivityIndicator, ScrollView, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';

// import { HelloWave } from '@/components/HelloWave';
// import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

import { Buffer } from 'buffer';
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

async function getBlobLike(downloadResultUri:any = undefined, imageUri:string = ""){

  console.log("A");

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

  console.log("B");
  console.log(blobLike);

  return blobLike;
}

async function getVisualAnswer(blobLike:any, question:string = "What is the photo a photo of?") {
  try {

    const {answer, score} = await hf.visualQuestionAnswering({
      model: 'dandelin/vilt-b32-finetuned-vqa',
      inputs: {
        question: question,
        image: blobLike,
      }
    });

    console.log(`Answer: "${answer}" (Confidence: ${score.toFixed(2)})`);

    return { answer: answer, confidence: score };

  } catch (error) {
    console.error("Error during VQA:", error);
    return { answer: "Error processing request", confidence: 0 };
  }
}

const classifyImage = async (imageUri: string="", downloadResult: any=undefined) => {


  try {

    if (!downloadResult){
      // 1. Download the image to local storage
      downloadResult = (await FileSystem.downloadAsync(
        imageUri,
        FileSystem.cacheDirectory + 'temp.jpg'
      )).uri;

    }

    // // 2. Read the image as base64 string
    // const base64 = await FileSystem.readAsStringAsync(downloadResult, {
    //   encoding: FileSystem.EncodingType.Base64,
    // });
    

    // 3. Create the proper data object
    const data = {
      uri: downloadResult,
      name: 'image.jpg',
      type: 'image/jpeg',
    };

    // const response = await fetch(imageUri);
    // const arrayBuffer = await response.arrayBuffer();
    // const buffer = Buffer.from(arrayBuffer);

    const result = await hf.imageClassification({
      // data: blobLike,
      // data: await (await fetch(imageUri)).blob(),
      // data: imageUri,
      data: data,
      model: "Kaludi/food-category-classification-v2.0",
      // model: "google/vit-base-patch16-224",
    });

    return result;

  } catch (e) {
    console.error(e);

    return null;
  }
};

const getMeasure = async (foodType: string) => {

  const result = (await hf.fillMask({
    model: 'bert-base-uncased',
    inputs: 'I ate two [MASK] of ' + foodType + ".",
  }))[0].token_str as string | null

  return result;

}



export default function RecordsHomeScreen() {

  const firstRunRef = useRef(true);

  const [response, setResponse] = useState<ResponseDictionary>({
    // "isFood":false,
    // "weight":'0',
    // "foodData": [
    //   {
    //     foodType: "",
    //     foodTypeWeight: "",
    //   },
    //   {
    //     foodType: "",
    //     foodTypeWeight: "",
    //   },
    // ]

  });

  const { photoUri } = useLocalSearchParams() as {photoUri?: string};

  const CameraPath : Href = '/records/camera';

  const initialURL = 'https://placecats.com/millie_neo/300/200';

  // const fetchAnswer = async (downloadedResult:any=undefined, question:string="What is the photo a photo of?", imageUri:string="") => {
  //   const blobLike = await getBlobLike(downloadedResult, imageUri);
  //   return (await getVisualAnswer(blobLike, question));
  // };

  // const FoodList = ({ items }: { items: FoodItem[] }) => {
  //   return (
  //     <ThemedView style={styles.container}>
  //       {items.map((item, index) => (
  //         <ThemedView key={index} style={styles.item}>
  //           <ThemedText>Type: {item.foodType || 'Not specified'}</ThemedText>
  //           <ThemedText>Weight: {item.foodTypeWeight || 'Not specified'}</ThemedText>
  //         </ThemedView>
  //       ))}
  //     </ThemedView>
  //   );
  // };

  const updateResponse = async(downloadedResult:any=undefined, imageUri:string="") => {

    const newResponse: ResponseDictionary = {};

    const blobLike = await getBlobLike(downloadedResult, imageUri);


    const classificationLabels = await classifyImage(imageUri, downloadedResult) as (Array<{[key: string]: any}> | null);

    console.log("LOGGING:")
    console.log(classificationLabels);

    const parsedClassificationLabels = [];

    // console.log(classificationLabels);
    // console.log(JSON.stringify(classificationLabels));

    let foodQuantityString = "";

    if (classificationLabels){
      console.log("CHECK 1")
      for (let i = 0; i < classificationLabels.length; i++){
        console.log("CHECK 2")
        if (classificationLabels[i].score >= 0.7){
          console.log("CHECK 3")
          const label = classificationLabels[i].label;

          parsedClassificationLabels.push(label);

          const measure = await getMeasure(label) as string;

          const quantity = (await getVisualAnswer(blobLike, "How many " + measure + " of " + label + " in the image?")).answer;

          const cappedMeasure = measure.charAt(0).toUpperCase() + measure.slice(1);

          const str = cappedMeasure + " of " + label + ": " + quantity;

          foodQuantityString += str + "\n";

        }
      }
    }

    newResponse["classification_labels"] = JSON.stringify(parsedClassificationLabels);

    newResponse["food_quantity"] = foodQuantityString;

    console.log(newResponse);

    setResponse(newResponse);
    

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
      updateResponse(undefined, initialURL);
    }
  }, [photoUri]);


  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    PoppinsBold: Poppins_700Bold,
  });


  return (
    <ScrollView>

      <ThemedView style={styles.screen}>
      
        <>
          <Stack.Screen options={{ title: 'Records' }} />
        </>


        <ThemedText type="title" style={styles.header}>
          FoodLink
        </ThemedText>

        <ThemedText type="title" style={styles.title}>
          Photos
        </ThemedText>

        {photoUri ? (
          <ThemedView>
            <Image
              source={{ uri: photoUri }}
              style={styles.image}
              resizeMode="contain"
            />
          </ThemedView>
        ) :

        (
          <ThemedView>
            <Image
              source={{ uri: initialURL }}
              style={styles.image}
              resizeMode="contain"
            />
          </ThemedView>
        )
      
        }

        {
          fontsLoaded ?
          (

            <ThemedView style={styles.aiInfo}>

              <ThemedText type="subtitle" style={styles.aiInfoSubheading}>

                {"classification_labels" in response ? "AI Detected Information" : "Loading Information..."}

              </ThemedText>
                
              <ThemedText style={styles.aiInfoBody}>
                
                {
                  
                  // 'Weight:' + response.weight + "\n\n" + 'Food Data:\n' + <FoodList items={response.foodData as FoodItem[]} />

                  // 'Weight:' + response.weight + "\n\n" + 'Food Data:\n' + JSON.stringify(response.foodData)

                  '\n\bFood Items:\b\n' + ("classification_labels" in response ? response["classification_labels"] : "Loading Information...") +
                  
                  '\n\n' +

                  (("classification_labels" in response && response["food_quantity"] != false && response["food_quantity"] != 'false') ? response["food_quantity"] : "")
                  
                }

              </ThemedText>

            </ThemedView>

          ) :

          (

            <ActivityIndicator/>

          )
        }
        



        <TouchableOpacity style={styles.button} onPress={() => router.push(CameraPath)}>
          
          {/* <ThemedText style={styles.buttonText}><IconSymbol size={40} name="house.fill" color='black' />  <ThemedText style={styles.innerButtonText}>Take Photo</ThemedText></ThemedText> */}
          <IconSymbol style={styles.buttonIcon} size={40} name="camera.fill" color="black" />
          <ThemedText style={styles.innerButtonText}>
            Take Photo
          </ThemedText>

        </TouchableOpacity>


        

      </ThemedView>

    </ScrollView>
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
    backgroundColor: '#97B3BE',
    // padding: 15,
    borderRadius: 18,
    alignItems: 'center',
    margin: 10,
    width: 240,
    height: 70,
    marginHorizontal: 'auto',
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 40,
    height: 80,
  },
  buttonIcon: {
    position: 'absolute',
    left: 20,
  },
  innerButtonText: {
    fontSize: 30,
    top: 25,
    left: 70,
    position: 'absolute',
    lineHeight: 30,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: 'black',
    marginLeft: 15,
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
  header: {
    padding: 15,
    fontWeight: 500,
  },
  title: {
    paddingTop: 15,
    paddingBottom: 15,
    textAlign: 'center',

  },
  aiInfo: {
    backgroundColor: '#CAF0FF',
    margin: 30,
    padding: 20,
    borderRadius: 10,
  },
  screen: {
    paddingBottom: 150,
  },
  aiInfoSubheading: {
    fontFamily: 'PoppinsBold',
  },
  aiInfoBody: {
    fontFamily: 'Poppins',
    // fontWeight: 500,
  },
  // buttonContainer: {
  //   flex: 1,
  //   // justifyContent: 'center', // Vertical centering
  //   alignItems: 'center',    // Horizontal centering
  // }


});
