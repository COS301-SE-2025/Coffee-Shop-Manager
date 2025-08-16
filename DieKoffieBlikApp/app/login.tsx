import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import CoffeeLoading from './loading';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CoffeeBackground from "../assets/coffee-background";

const REFRESH_THRESHOLD = 60 * 60 * 1000; // 1 hour in milliseconds

// Validation functions (you can move these to separate files)
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
};

interface LoginScreenProps {
  onLogin?: (email: string, password: string, rememberMe: boolean) => void;
  onForgotPassword?: () => void;
  onCreateAccount?: () => void;
}

export default function LoginScreen({ 
  onLogin, 
  onForgotPassword, 
  onCreateAccount 
}: LoginScreenProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Form validation states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await AsyncStorage.getItem('user_session');
        if (sessionData) {
          const { email: storedEmail, session } = JSON.parse(sessionData);
          
          // Verify if session is still valid
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          
          if (currentSession) {
            setEmail(storedEmail);
            setRememberMe(true);
            router.replace('/home');
          } else {
            // Session expired, clear storage
            await AsyncStorage.removeItem('user_session');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();
  }, []);

  const refreshSessionIfNeeded = async (session: any) => {
    try {
      const expiresAt = new Date(session.expires_at).getTime();
      const now = new Date().getTime();
      
      if (expiresAt - now < REFRESH_THRESHOLD) {
        const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        
        if (newSession) {
          await AsyncStorage.setItem('user_session', JSON.stringify({
            email,
            session: newSession,
            user: newSession.user
          }));
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const isFormValid = () => {
    return (
      email !== '' &&
      password !== '' &&
      !emailError &&
      !passwordError
    );
  };

  const handleSubmit = async () => {
    setFormSubmitted(true);

    // Validate inputs
    const emailValidationResult = validateEmail(email);
    setEmailError(emailValidationResult ?? '');
    const isEmailValid = !emailValidationResult;

    const passwordValidationResult = validatePassword(password);
    setPasswordError(passwordValidationResult ?? '');
    const isPasswordValid = !passwordValidationResult;

    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true); // show loader at the start

    try {
      console.log("Email: " + email);
      console.log("Password: " + password);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Supabase error:", error.message, error);
        Alert.alert('Login failed', error.message);
        return;
      }

      console.log("✅ Logged in:", data);

      // Optional: fetch user profile
      const userId = data?.user?.id;
      if (userId) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (profileError) {
          console.warn('Profile not found:', profileError.message);
        } else {
          console.log('User profile:', profile);
        }
      }

      // Call optional onLogin callback
      if (onLogin) {
        onLogin(email, password, rememberMe);
      } else {
        console.log('Login successful', { email, password: '********', rememberMe });
      }

      // Handle "Remember Me" storage
      if (rememberMe) {
        try {
          await AsyncStorage.setItem('user_session', JSON.stringify({
            email: email,
            session: data.session,
            user: data.user
          }));
          console.log('Session stored successfully');
        } catch (storageError) {
          console.error('Error storing session:', storageError);
        }
      } else {
        try {
          await AsyncStorage.removeItem('user_session');
          console.log('Session removed successfully');
        } catch (removeError) {
          console.error('Error removing session:', removeError);
        }
      }

      // Navigate to home AFTER everything is done
      router.replace('/home');

    } catch (err: any) {
      console.error('Unexpected login error:', err);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      // Hide loader at the very end
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (formSubmitted) {
      const error = validateEmail(value);
      setEmailError(error ?? '');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (formSubmitted) {
      const error = validatePassword(value);
      setPasswordError(error ?? '');
    }
  };

  const handleEmailBlur = () => {
    const error = validateEmail(email);
    setEmailError(error ?? '');
  };

  const handlePasswordBlur = () => {
    const error = validatePassword(password);
    setPasswordError(error ?? '');
  };

  return (
    <SafeAreaView style={styles.container}>
      <CoffeeBackground>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              
              {/* Background decorations */}
              <View style={[styles.decoration, styles.decorationTopRight]} />
              <View style={[styles.decoration, styles.decorationBottomLeft]} />
              
              {/* Coffee cup icon */}
              <View style={styles.iconContainer}>
                <View style={styles.coffeeIcon}>
                  <Ionicons name="cafe" size={40} color="white" />
                </View>
              </View>
              
              {/* Title */}
              <Text style={styles.title}>DieKoffieBlik</Text>
              <Text style={styles.subtitle}>Welcome back</Text>
              
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    emailError ? styles.inputError : null
                  ]}
                  placeholder="you@example.com"
                  placeholderTextColor="#d97706"
                  value={email}
                  onChangeText={handleEmailChange}
                  onBlur={handleEmailBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Password</Text>
                  <TouchableOpacity onPress={onForgotPassword}>
                    <Text style={styles.forgotPassword}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      passwordError ? styles.inputError : null
                    ]}
                    placeholder="••••••••"
                    placeholderTextColor="#d97706"
                    value={password}
                    onChangeText={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    secureTextEntry={!passwordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setPasswordVisible(!passwordVisible)}
                  >
                    <Ionicons
                      name={passwordVisible ? "eye" : "eye-off"}
                      size={20}
                      color="#b45309"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              {/* Remember me checkbox */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[
                  styles.checkbox,
                  rememberMe ? styles.checkboxChecked : null
                ]}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Remember me</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  (!isFormValid() || isLoading) ? styles.loginButtonDisabled : null
                ]}
                onPress={handleSubmit}
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? (
                  <Text style={styles.loginButtonText}>
                    Login to Account
                  </Text>
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>
                      Login to Account
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>
              <CoffeeLoading visible={isLoading} />

              {/* Create account link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={styles.signupLink}>Create one now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </CoffeeBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  decoration: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#fef3c7',
    opacity: 0.3,
  },
  decorationTopRight: {
    top: -64,
    right: -64,
  },
  decorationBottomLeft: {
    bottom: -64,
    left: -64,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  coffeeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#b45309',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#5f341d',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#92400e',
    fontWeight: '500',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotPassword: {
    fontSize: 12,
    color: '#b45309',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fffbeb',
    color: '#5f341d',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 3,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#b45309',
    borderColor: '#b45309',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  loginButton: {
    backgroundColor: '#b45309',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: '#fbbf24',
    opacity: 0.5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#6b7280',
  },
  signupLink: {
    fontSize: 14,
    color: '#b45309',
    fontWeight: '500',
  },
});