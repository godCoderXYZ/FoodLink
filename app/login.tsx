import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { login, error } = useAuth();
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    if (username.trim()) {
      login(username);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Welcome to FoodLink</ThemedText>
      
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Username</ThemedText>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
        {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
      </ThemedView>
      
      <TouchableOpacity
        style={[
          styles.loginButton,
          !username.trim() ? styles.loginButtonDisabled : null
        ]}
        onPress={handleLogin}
        disabled={!username.trim()}
      >
        <ThemedText style={styles.loginButtonText}>Login</ThemedText>
      </TouchableOpacity>
      
      <ThemedView style={styles.helpContainer}>
        <ThemedText style={styles.helpText}>Available users:</ThemedText>
        <ThemedText style={styles.helpText}>• restaurant manager</ThemedText>
        <ThemedText style={styles.helpText}>• General Manager</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#dd3333',
    marginTop: 8,
  },
  loginButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#93c5d5',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});