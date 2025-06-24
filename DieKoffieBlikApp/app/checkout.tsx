import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Mocked cart data (in a real app, you’d pass this via route params or use a global state like context)
const cartData: Record<string, number> = {
  '1': 2,
  '3': 1,
  '4': 1,
};


const menuItems = [
  { id: '1', name: 'Americano', price: 30 },
  { id: '2', name: 'Cappuccino', price: 35 },
  { id: '3', name: 'Latte', price: 32 },
  { id: '4', name: 'Mocha', price: 38 },
  { id: '5', name: 'Espresso', price: 28 },
];

export default function CheckoutScreen() {
  const router = useRouter();

  const selectedItems = menuItems.filter((item) => cartData[item.id]);
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * cartData[item.id],
    0
  );

  const placeOrder = () => {
    Alert.alert('Order Placed!', 'Your coffee is being prepared ☕️', [
      {
        text: 'OK',
        onPress: () => router.push('/'),
        
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#78350f" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff7ed" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={selectedItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>
              {cartData[item.id]}x {item.name}
            </Text>
            <Text style={styles.itemPrice}>
              R{(item.price * cartData[item.id]).toFixed(2)}
            </Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Total: R{subtotal.toFixed(2)}</Text>
        <TouchableOpacity style={styles.orderButton} onPress={placeOrder}>
          <Text style={styles.orderButtonText}>Place Order</Text>
          <Ionicons name="cafe" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  header: {
    backgroundColor: '#78350f',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    color: '#fffbeb',
    fontWeight: 'bold',
  },
  list: {
    padding: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#facc15',
  },
  itemName: {
    fontSize: 16,
    color: '#78350f',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 16,
    color: '#b45309',
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 20,
    backgroundColor: '#fff7ed',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 12,
  },
  orderButton: {
    flexDirection: 'row',
    backgroundColor: '#78350f',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    gap: 8,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
