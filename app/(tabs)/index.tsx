import { Image, StyleSheet, Platform, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuth';


export default function HomeScreen() {
  const { logout, username } = useAuth();
  

  return (
    <ThemedView style={styles.container}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        }>

        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Welcome to FoodLink!</ThemedText>
          <HelloWave />
        </ThemedView>
        
        <ThemedView style={styles.userContainer}>
          <ThemedText type="subtitle">Hello, {username || 'User'}!</ThemedText>
        </ThemedView>
        
        {/* <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Response:</ThemedText>
          <ThemedText>
            Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
            Press{' '}
            <ThemedText type="defaultSemiBold">
              {Platform.select({
                ios: 'cmd + d',
                android: 'cmd + m',
                web: 'F12'
              })}
            </ThemedText>{' '}
            to open developer tools.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          <ThemedText>
            Tap the Explore tab to learn more about what's included in this starter app.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
          <ThemedText>
            When you're ready, run{' '}
            <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
            <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
            <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
            <ThemedText type="defaultSemiBold">app-example</ThemedText>.
          </ThemedText>
        </ThemedView> */}

        <ThemedView style={styles.spacer}></ThemedView>
        
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
        </TouchableOpacity>
      </ParallaxScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userContainer: {
    marginVertical: 16,
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
  logoutButton: {
    backgroundColor: '#dd3333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 300,
    alignSelf: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  }
});
