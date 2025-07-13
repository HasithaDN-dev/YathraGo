import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const authToken = await AsyncStorage.getItem('authToken');
        setIsAuthenticated(!!authToken);
      } catch (error) {
        console.error('Error checking auth state:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  return { isAuthenticated, isLoading };
}
