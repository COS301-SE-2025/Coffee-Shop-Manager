import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* <ImageBackground
        source={require('../assets/coffee-beans-bg.jpg')} // You'll need to add this image
        style={styles.backgroundImage}
      > */}
        <LinearGradient
          colors={['rgba(120, 53, 15, 0.95)', 'rgba(180, 83, 9, 0.98)']}
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
              <View style={styles.featureItem}>
                <Ionicons name="timer-outline" size={28} color="#fed7aa" />
                <Text style={styles.featureText}>Quick Order</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="star-outline" size={28} color="#fed7aa" />
                <Text style={styles.featureText}>Loyalty Rewards</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="location-outline" size={28} color="#fed7aa" />
                <Text style={styles.featureText}>Find Stores</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.loginButtonText}>Login</Text>
                <Ionicons name="arrow-forward" size={20} color="#b45309" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => router.push('/register')}
              >
                <Text style={styles.registerButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Guest Access */}
            <TouchableOpacity
  style={styles.guestButton}
  onPress={() => router.push('/order')}
>
  <Text style={styles.guestButtonText}>Continue as Guest</Text>
</TouchableOpacity>
          </View>
        </LinearGradient>
      {/*</ImageBackground>*/}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#b45309',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fffbeb',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#fed7aa',
    marginBottom: 48,
  },
  featureSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 48,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    width: '28%',
  },
  featureText: {
    color: '#fed7aa',
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  buttonSection: {
    gap: 16,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: '#b45309',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#b45309',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    padding: 16,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#fed7aa',
    fontSize: 14,
  },
});