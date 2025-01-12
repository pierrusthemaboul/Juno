import { Slot } from 'expo-router';

export default function AuthLayout() {
  // Utiliser Slot au lieu de Stack pour éviter le header
  return <Slot />;
}