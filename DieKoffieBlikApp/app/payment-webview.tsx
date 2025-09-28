// app/payment-webview.tsx
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Text } from "react-native";
import { WebView } from "react-native-webview";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://api.diekoffieblik.co.za";

export default function PaymentWebViewScreen() {
  const router = useRouter();
  const { url, orderId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const handleNavigationStateChange = async (navState: any) => {
    console.log("WebView navigating to:", navState.url);

    // Check for successful return from PayFast
    if (navState.url.includes("payfast_return=success") && orderId) {
      console.log("PayFast payment successful! Order ID:", orderId);

      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        if (!accessToken) {
          console.error("No access token found");
          return;
        }

        // Call the API to mark order as paid - similar to web version
        const response = await fetch(`${API_BASE_URL}/order/pay/${orderId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        const result = await response.json();
        console.log("Payment update result:", result);

        if (response.ok && result.success) {
          // Payment successfully marked as paid
          // Navigate to success screen or home with success message
          router.replace({
            pathname: "/home",
            params: { paymentStatus: "success" },
          });
        }
      } catch (error) {
        console.error("Error updating payment status:", error);
        router.replace({
          pathname: "/home",
          params: { paymentStatus: "error" },
        });
      }
    }

    // Check for cancelled payment
    if (navState.url.includes("payfast_return=cancelled")) {
      console.log("PayFast payment cancelled");
      router.replace({
        pathname: "/home",
        params: { paymentStatus: "cancelled" },
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#78350f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#78350f" />
          <Text style={styles.loadingText}>Loading payment gateway...</Text>
        </View>
      )}

      <WebView
        source={{ uri: decodeURIComponent(url as string) }}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#78350f",
  },
  placeholder: {
    width: 40,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    zIndex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#78350f",
  },
});
