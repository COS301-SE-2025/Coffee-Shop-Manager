import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from "react-native";
import LoginScreen from '../screens/LoginScreen';
import { router } from 'expo-router';

export default function Page() {
  const handleLogin = (email: string, password: string, rememberMe: boolean) => {
    console.log('Login attempt:', { email, rememberMe });
    Alert.alert(
      'Login Successful',
      `Welcome back!\nEmail: ${email}\nRemember me: ${rememberMe ? 'Yes' : 'No'}`
    );
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
    Alert.alert('Forgot Password', 'Password reset functionality would go here');
  };

  const handleRegister = () => {
    console.log('Register attempt');
    router.push('/registerRoute');
  };

  return (
    <>
      <StatusBar style="dark" />
      <LoginScreen
        onLogin={handleLogin}
        onForgotPassword={handleForgotPassword}
        onCreateAccount={handleRegister}
      />
    </>
  );
}
