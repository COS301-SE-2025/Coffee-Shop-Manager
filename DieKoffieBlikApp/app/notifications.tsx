import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  Pressable, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CoffeeBackground from '../assets/coffee-background';

export default function NotificationsScreen() {
  const router = useRouter();

  // Example notifications
  const notifications = {
    today: [
      { id: 1, icon: 'cafe', message: 'Your Cappuccino order is ready for pickup!', time: '5 min ago' },
      { id: 2, icon: 'heart', message: 'Vanilla Latte added to your favorites.', time: '2 hrs ago' },
    ],
    week: [
      { id: 3, icon: 'pricetag', message: '20% off on Iced Americano this weekend!', time: '2 days ago' },
      { id: 4, icon: 'time', message: 'You ordered 3 Double Espressos last week!', time: '3 days ago' },
    ],
    earlier: [
      { id: 5, icon: 'gift', message: 'You earned 50 loyalty points.', time: '1 week ago' },
    ]
  };

  const renderNotifications = (title: string, data: typeof notifications.today) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.map(item => (
        <View key={item.id} style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon as any} size={22} color="#78350f" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CoffeeBackground>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Navbar */}
        <View style={styles.navbar}>
          <Pressable onPress={() => router.back()} style={styles.navButton}>
            <Ionicons name="arrow-back" size={24} color="#78350f" />
          </Pressable>
          <Text style={styles.navTitle}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderNotifications('Today', notifications.today)}
          {renderNotifications('This Week', notifications.week)}
          {renderNotifications('Earlier', notifications.earlier)}
        </ScrollView>
      </CoffeeBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#78350f',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
