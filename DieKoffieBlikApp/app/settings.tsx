import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  Pressable, 
  ScrollView, 
  Switch, 
  TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CoffeeBackground from '../assets/coffee-background';

export default function AccountSettingsScreen() {
  const router = useRouter();

  const [name, setName] = useState('Phillip');
  const [email, setEmail] = useState('phillip@example.com');
  const [password, setPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <CoffeeBackground>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Navbar */}
        <View style={styles.navbar}>
          <Pressable onPress={() => router.back()} style={styles.navButton}>
            <Ionicons name="arrow-back" size={24} color="#78350f" />
          </Pressable>
          <Text style={styles.navTitle}>Account Settings</Text>
          <View style={{ width: 24 }} /> {/* Spacer for alignment */}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Ionicons name="person-circle" size={80} color="#78350f" />
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
          </View>

          {/* Editable Fields */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceText}>Enable Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#d1d5db", true: "#fbbf24" }}
                thumbColor={notificationsEnabled ? "#78350f" : "#f4f3f4"}
              />
            </View>

            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceText}>Dark Mode</Text>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: "#d1d5db", true: "#fbbf24" }}
                thumbColor={darkModeEnabled ? "#78350f" : "#f4f3f4"}
              />
            </View>
          </View>

          {/* Save Button */}
          <Pressable style={styles.saveButton} android_ripple={{ color: '#ffffff30' }}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>

          {/* Logout */}
          <Pressable style={styles.logoutButton} android_ripple={{ color: '#78350f20' }}>
            <Ionicons name="log-out-outline" size={20} color="#b91c1c" />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#78350f',
    marginTop: 8,
  },
  profileEmail: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#b45309',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 14,
    color: '#78350f',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  preferenceText: {
    fontSize: 14,
    color: '#78350f',
  },
  saveButton: {
    backgroundColor: '#78350f',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
