import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ensureAnonymousAuth } from '../lib/auth';
import { initRevenueCat } from '../lib/revenueCat';

// Required on iOS: đóng auth browser session khi app foreground lại sau OAuth
// (expo-auth-session dùng WebBrowser internally — cần call này để cleanup session)
WebBrowser.maybeCompleteAuthSession();

// Giữ splash screen cho đến khi fonts load xong
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SpaceMono-Bold':    require('../assets/fonts/SpaceMono-Bold.ttf'),
  });

  // Ẩn splash khi fonts resolve (loaded hoặc error)
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Khởi tạo backend auth + monetization khi app mount lần đầu
  useEffect(() => {
    ensureAnonymousAuth(); // Tạo anonymous JWT nếu chưa có — silent fail nếu backend offline
    initRevenueCat();      // No-op mock trong Expo Go; real SDK cần EAS build
  }, []);

  // Block render cho đến khi fonts sẵn sàng (tránh layout flash với fallback font)
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />
    </SafeAreaProvider>
  );
}
