import { StatusBar } from 'expo-status-bar';
import LoginScreen from './login';

export default function Index() {
  return (
    <>
      <StatusBar style="dark" />
      <LoginScreen />
    </>
  );
}