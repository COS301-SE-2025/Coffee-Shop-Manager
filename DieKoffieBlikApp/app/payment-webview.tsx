// app/payment-webview.tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PaymentWebView() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: decodeURIComponent(url) }}
        startInLoadingState
        renderLoading={() => <ActivityIndicator size="large" color="#78350f" style={{ marginTop: 20 }} />}
        onShouldStartLoadWithRequest={(request) => {
          if (request.url.includes('payment-result/success') || request.url.includes('payment-result/failed')) {
            router.push('/home');
            return false; // Stop WebView from loading the final page
          }
          return true;
        }}
      />
    </View>
  );
}
