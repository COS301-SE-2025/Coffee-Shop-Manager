import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar } from 'react-native';
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#78350f" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Coffee</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff7ed" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>R{item.price}</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={24} color="#fff7ed" />
            </TouchableOpacity>
          </View>
        )}
      />
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
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    color: '#fffbeb',
    fontWeight: 'bold',
  },
  list: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
  addButton: {
    backgroundColor: '#b45309',
    padding: 12,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
