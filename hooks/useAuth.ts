import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { getSessionCookie, setSessionCookie, clearSessionCookie } from '@/utils/authStorage';
import { isValidUsername } from '@/utils/availableUsers';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    const storedUsername = await getSessionCookie();
    setUsername(storedUsername);
    setIsAuthenticated(storedUsername !== null);
    setIsLoading(false);
  };

  const login = async (username: string) => {
    if (!username.trim()) return;
    
    // Check if username is in the allowed list
    if (!isValidUsername(username)) {
      setError('Invalid username. Please try again.');
      return;
    }
    
    setError(null);
    await setSessionCookie(username);
    setUsername(username);
    setIsAuthenticated(true);
    router.replace('/(tabs)');
  };

  const logout = async () => {
    await clearSessionCookie();
    setUsername(null);
    setIsAuthenticated(false);
    router.replace('/login');
  };

  return { isAuthenticated, isLoading, username, login, logout, checkAuth, error };
}