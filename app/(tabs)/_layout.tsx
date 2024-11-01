import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="vue1" />
      <Stack.Screen name="vue2a" />
      <Stack.Screen name="vue2b" />
      <Stack.Screen name="vue3" />
      <Stack.Screen name="vue4" />
      <Stack.Screen name="vue5" />
    </Stack>
  );
}