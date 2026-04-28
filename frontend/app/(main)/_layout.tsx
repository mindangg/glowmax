import { Stack } from 'expo-router';

// Main app group (post-onboarding): scan animation, results, paywall.
// Background B (#0A0C0E glassy dark gradient) is the baseline; each
// screen wraps its own ChromaticGlassBackground component.
export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#0A0C0E' },
      }}
    />
  );
}
