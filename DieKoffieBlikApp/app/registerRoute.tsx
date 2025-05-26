import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RegisterScreen from '../screens/RegisterScreen';

export default function Register() {
  return (
    <>
      <StatusBar style="dark" />
      <RegisterScreen />
    </>
  );
}