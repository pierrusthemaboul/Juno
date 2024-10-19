import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="vue1" options={{ headerShown: false }} />
      <Stack.Screen name="vue2" options={{ headerShown: false }} />
      <Stack.Screen name="vue2ab" options={{ headerShown: false }} />
    </Stack>
  );
}