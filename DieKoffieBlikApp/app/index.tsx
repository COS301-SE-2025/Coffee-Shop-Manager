import { StatusBar } from 'expo-status-bar';
import LandingScreen from './landing';
import 'react-native-url-polyfill/auto';

export default function Index() {
  return (
    <>
      <StatusBar style="dark" />
      <LandingScreen />
    </>
  );
}