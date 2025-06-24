import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const menuItems = [
  { id: '1', name: 'Americano', price: 30 },
  { id: '2', name: 'Cappuccino', price: 35 },
  { id: '3', name: 'Latte', price: 32 },
  { id: '4', name: 'Mocha', price: 38 },
  { id: '5', name: 'Espresso', price: 28 },
];

export default function OrderScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const addToCart = (id: string) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const getSubtotal = () => {
    return menuItems.reduce((sum, item) => {
      const quantity = cart[item.id] || 0;
      return sum + item.price * quantity;
    }, 0);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#78350f" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff7ed" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Coffee</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
      </View>

      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const quantity = cart[item.id] || 0;
          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>R{item.price.toFixed(2)}</Text>
              </View>

              <View style={styles.quantityContainer}>
                {quantity > 0 && (
                  <Text style={styles.quantityText}>x{quantity}</Text>
                )}
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addToCart(item.id)}
                >
                  <Ionicons name="add" size={20} color="#fff7ed" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Subtotal Section */}
      {getSubtotal() > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalText}>
            Subtotal: R{getSubtotal().toFixed(2)}
          </Text>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => router.push('/checkout')}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
            <Ionicons name="cart" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#78350f',
  },
  itemPrice: {
    fontSize: 14,
    color: '#b45309',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityText: {
    fontSize: 16,
    color: '#b45309',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#b45309',
    padding: 10,
    borderRadius: 50,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff7ed',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 16,
    color: '#78350f',
    fontWeight: '600',
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: '#78350f',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    gap: 6,
  },
  checkoutText: {
    color: '#fff',
    fontWeight: '600',
  },
});
