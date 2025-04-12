import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_COOKIE_KEY = 'session_cookie';

export const setSessionCookie = async (username: string): Promise<void> => {
  try {
    // Store the entered username
    await AsyncStorage.setItem(SESSION_COOKIE_KEY, username);
  } catch (error) {
    console.error('Failed to set session cookie:', error);
  }
};

export const getSessionCookie = async (): Promise<string | null> => {
  try {
    const cookie = await AsyncStorage.getItem(SESSION_COOKIE_KEY);
    return cookie;
  } catch (error) {
    console.error('Failed to get session cookie:', error);
    return null;
  }
};

export const clearSessionCookie = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_COOKIE_KEY);
  } catch (error) {
    console.error('Failed to clear session cookie:', error);
  }
};