import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

/**
 * Development utility to reset app state
 * Use this during development to test new user flows
 */
export const resetAppState = async () => {
  try {
    await AsyncStorage.clear();
    Alert.alert(
      'App Reset', 
      'App state has been cleared. The app will restart as a new user.',
      [{ text: 'OK' }]
    );
    return true;
  } catch (error) {
    console.error('Error clearing app state:', error);
    Alert.alert('Error', 'Failed to reset app state');
    return false;
  }
};

/**
 * Get current app state for debugging
 */
export const getAppState = async () => {
  try {
    const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
    const isRegistered = await AsyncStorage.getItem('isRegistered');
    const authToken = await AsyncStorage.getItem('authToken');
    const userProfile = await AsyncStorage.getItem('userProfile');
    
    const state = {
      hasSeenOnboarding: hasSeenOnboarding || 'null',
      isRegistered: isRegistered || 'null',
      authToken: authToken ? 'exists' : 'null',
      userProfile: userProfile ? 'exists' : 'null'
    };
    
    console.log('Current App State:', state);
    return state;
  } catch (error) {
    console.error('Error getting app state:', error);
    return null;
  }
};
