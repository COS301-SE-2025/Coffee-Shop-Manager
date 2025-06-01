import { StatusBar } from 'expo-status-bar';
import LandingScreen from './landing';

export default function Index() {
  return (
    <>
      <StatusBar style="dark" />
      <LandingScreen />
    </>
  );
}