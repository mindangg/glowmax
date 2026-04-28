import { Stack } from 'expo-router';

// Onboarding group: no header, fade transition between screens.
// Background A (#1A1A1A dark grain) is the baseline; each screen
// wraps its own GrainBackground or ChromaticGlassBackground component.
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#1A1A1A' },
      }}
    />
  );
}
