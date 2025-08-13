import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NotificationService from '../services/NotificationService';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#78350f" />
      <LinearGradient
        colors={['#78350f', '#b45309']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo and Title Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="cafe" size={64} color="#fffbeb" />
            </View>
            <Text style={styles.title}>DieKoffieBlik</Text>
            <Text style={styles.subtitle}>Your daily cup of happiness</Text>
          </View>

          {/* Feature Section */}
          <View style={styles.featureSection}>
            <Feature icon="timer-outline" label="Quick Order" />
            <Feature icon="star-outline" label="Loyalty Rewards" />
            <Feature icon="location-outline" label="Find Stores" />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <ActionButton
              text="Login"
              icon="arrow-forward"
              onPress={() => router.push('/login')}
              variant="light"
            />
            <ActionButton
              text="Create Account"
              icon="arrow-forward"
              onPress={() => router.push('/register')}
              variant="dark"
            />
          </View>

          {/* Guest Access */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => {
              NotificationService.showNotification("You are a guest!!");
              router.push('/home');
            }}
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const Feature = ({ icon, label }: { icon: any; label: string }) => (
  <View style={styles.featureItem}>
    <Ionicons name={icon} size={26} color="#fed7aa" />
    <Text style={styles.featureText}>{label}</Text>
  </View>
);

const ActionButton = ({
  text,
  icon,
  onPress,
  variant = 'dark',
}: {
  text: string;
  icon: any;
  onPress: () => void;
  variant: 'light' | 'dark';
}) => {
  const isLight = variant === 'light';
  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        isLight ? styles.lightButton : styles.darkButton,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.actionButtonText,
          isLight ? styles.lightText : styles.darkText,
        ]}
      >
        {text}
      </Text>
      <Ionicons
        name={icon}
        size={20}
        color={isLight ? '#b45309' : '#fff'}
        style={{ marginLeft: 6 }}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 36,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    width: 110,
    height: 110,
    backgroundColor: '#b45309',
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 6,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#fffbeb',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#fed7aa',
    fontStyle: 'italic',
  },
  featureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 30,
  },
  featureItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    width: '30%',
  },
  featureText: {
    color: '#fed7aa',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  buttonSection: {
    gap: 14,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  lightButton: {
    backgroundColor: '#fffbeb',
  },
  darkButton: {
    backgroundColor: '#b45309',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  lightText: {
    color: '#b45309',
  },
  darkText: {
    color: '#fff',
  },
  guestButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#fed7aa',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
