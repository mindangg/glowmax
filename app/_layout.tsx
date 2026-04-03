import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ensureAnonymousAuth, supabase } from '../lib/supabase';
import { initRevenueCat } from '../lib/revenueCat';

// Required on iOS to complete the OAuth session when the app is foregrounded.
WebBrowser.maybeCompleteAuthSession();

// Keep splash visible until fonts are ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SpaceMono-Bold': require('../assets/fonts/SpaceMono-Bold.ttf'),
  });

  // Hide splash once fonts resolve (loaded or error)
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Initialize backend + monetization on first mount
  useEffect(() => {
    ensureAnonymousAuth();  // Anonymous Supabase session — silent fail if unconfigured
    initRevenueCat();       // No-op mock in Expo Go; real SDK needs EAS build
  }, []);

  // Handle OAuth deep-link redirect (e.g. glowmax://auth/callback?code=...)
  // Exchanges the one-time code for a Supabase session after social sign-in.
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url.includes('auth/callback')) {
        supabase.auth.exchangeCodeForSession(url);
      }
    });
    return () => subscription.remove();
  }, []);

  // Hold render until fonts are resolved so SpaceMono is always available
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
