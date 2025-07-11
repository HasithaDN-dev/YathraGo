import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// Hide splash screen immediately when app starts
SplashScreen.hideAsync();

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to welcome screen immediately
    router.replace('./welcome');
  }, [router]);

  return null;
}
