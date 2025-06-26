import { Stack } from 'expo-router';
import 'react-native-url-polyfill/auto';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}