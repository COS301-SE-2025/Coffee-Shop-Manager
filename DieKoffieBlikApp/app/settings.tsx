import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CoffeeBackground from "../assets/coffee-background";
import CoffeeLoading from "../assets/loading";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://api.diekoffieblik.co.za";

interface UpdateProfileData {
  display_name: string;
  phone_number: string;
  password?: string;
  date_of_birth?: string;
}

interface UserProfile {
  user_id: string;
  favourite_product_id: string | null;
  total_orders: number;
  total_spent: number;
  date_of_birth: string;
  phone_number: string;
  loyalty_points: number;
  role: string;
  display_name: string;
}

interface ApiResponse {
  success: boolean;
  profile: UserProfile;
}

export default function AccountSettingsScreen() {
  const router = useRouter();

  // User data states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Preference states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const accessToken = await AsyncStorage.getItem("access_token");
      const userEmail = await AsyncStorage.getItem("email");
      const userId = await AsyncStorage.getItem("user_id");

      if (!accessToken || !userEmail || !userId) {
        router.replace("/login");
        return;
      }

      console.log(`Fetching profile for user ID: ${userId}`);

      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await clearStorageAndRedirect();
          return;
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch profile`);
      }

      const apiResponse: ApiResponse = await response.json();

      if (!apiResponse.success || !apiResponse.profile) {
        throw new Error("Invalid API response format");
      }

      const profile = apiResponse.profile;
      console.log("Profile data received:", profile);

      // Set the form fields with fetched data
      setName(profile.display_name || "");
      setEmail(userEmail); // Email from AsyncStorage (read-only)
      setPhone(profile.phone_number || "");
      setDateOfBirth(profile.date_of_birth || "");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } else {
        console.error("Unknown error fetching user data:", err);
        setError("Failed to load profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearStorageAndRedirect = async () => {
    await AsyncStorage.multiRemove([
      "access_token",
      "refresh_token",
      "email",
      "user_session",
      "user_id",
    ]);
    router.replace("/login");
  };

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Name is required");
      return;
    }

    // Validate phone number if provided
    if (phone && (phone.length !== 10 || !phone.startsWith("0"))) {
      Alert.alert(
        "Validation Error",
        "Phone number must be 10 digits and start with 0",
      );
      return;
    }

    try {
      setIsSaving(true);

      const accessToken = await AsyncStorage.getItem("access_token");
      const userId = await AsyncStorage.getItem("user_id");

      if (!accessToken || !userId) {
        router.replace("/login");
        return;
      }

      // Prepare update data (only fields that backend accepts)
      const updateData: UpdateProfileData = {
        display_name: name.trim(),
        phone_number: phone.trim(),
      };

      // Only include password if it's been entered
      if (password.trim()) {
        if (password.length < 8) {
          Alert.alert(
            "Validation Error",
            "Password must be at least 8 characters",
          );
          setIsSaving(false);
          return;
        }
        updateData.password = password.trim();
      }

      // Only include date of birth if it's been entered
      if (dateOfBirth.trim()) {
        updateData.date_of_birth = dateOfBirth.trim();
      }

      console.log("Updating user profile with:", updateData);

      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP ${response.status}: Failed to update profile`,
        );
      }

      console.log("Profile updated successfully:", result);

      // Update session data if it exists
      try {
        const sessionData = await AsyncStorage.getItem("user_session");
        if (sessionData) {
          const parsedSession = JSON.parse(sessionData);
          if (parsedSession.user) {
            parsedSession.user.name = name;
            parsedSession.user.display_name = name;
          }
          await AsyncStorage.setItem(
            "user_session",
            JSON.stringify(parsedSession),
          );
        }
      } catch (sessionError) {
        console.error("Error updating session data:", sessionError);
      }

      Alert.alert("Success", "Your profile has been updated successfully");

      // Clear password field after successful save
      setPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error saving changes:", err);
        Alert.alert("Error", err.message);
      } else {
        console.error("Unknown error saving changes:", err);
        Alert.alert("Error", "Failed to save changes. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await clearStorageAndRedirect();
          } catch (err) {
            console.error("Logout error:", err);
            router.replace("/login"); // Fallback
          }
        },
      },
    ]);
  };

  const validatePhoneNumber = (text: string) => {
    const numbersOnly = text.replace(/[^0-9]/g, "");
    if (numbersOnly.length > 10) return;

    if (numbersOnly.length > 0 && !numbersOnly.startsWith("0")) {
      Alert.alert("Invalid Number", "Phone number must start with 0");
      return;
    }

    setPhone(numbersOnly);
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <CoffeeLoading visible={isLoading} />
      </SafeAreaView>
    );
  }

  // Error state - Fixed the JSX issue
  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <CoffeeBackground>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchUserData}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        </CoffeeBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CoffeeBackground>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Navbar */}
        <View style={styles.navbar}>
          <Pressable onPress={() => router.back()} style={styles.navButton}>
            <Ionicons name="arrow-back" size={24} color="#78350f" />
          </Pressable>
          <Text style={styles.navTitle}>Account Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Ionicons name="person-circle" size={80} color="#78350f" />
              <View style={styles.editImageButton}>
                <Ionicons name="camera" size={16} color="#78350f" />
              </View>
            </View>
            <Text style={styles.profileName}>{name || "User"}</Text>
            <Text style={styles.profileEmail}>{email || "No email"}</Text>
          </View>

          {/* Editable Fields */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your display name"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={email}
                placeholder="Email address"
                placeholderTextColor="#9ca3af"
                editable={false}
              />
              <Text style={styles.inputNote}>
                Email cannot be changed for security reasons
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={validatePhoneNumber}
                keyboardType="phone-pad"
                placeholder="0123456789"
                placeholderTextColor="#9ca3af"
                maxLength={10}
              />
              <Text style={styles.inputNote}>
                Must be 10 digits starting with 0
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                maxLength={10}
              />
              <Text style={styles.inputNote}>
                Format: YYYY-MM-DD (e.g., 1990-12-25)
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password (Optional)</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.inputNote}>
                Minimum 8 characters. Leave blank to keep current password.
              </Text>
            </View>
          </View>

         

         
          

          {/* Save Button */}
          <Pressable
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveChanges}
            disabled={isSaving}
            android_ripple={{ color: "#ffffff30" }}
          >
            {isSaving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.saveButtonText}>Saving Changes...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </Pressable>

          {/* Logout Button */}
          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
            android_ripple={{ color: "#ef444420" }}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>DieKoffieBlik v1.0.0</Text>
          </View>
        </ScrollView>
      </CoffeeBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: "#78350f",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff7ed",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#78350f",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#78350f",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#9ca3af",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#78350f",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#b45309",
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 16,
    color: "#78350f",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  inputDisabled: {
    backgroundColor: "#f9fafb",
    color: "#6b7280",
  },
  inputNote: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 6,
    fontStyle: "italic",
    lineHeight: 16,
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  preferenceLeft: {
    flex: 1,
    marginRight: 16,
  },
  preferenceText: {
    fontSize: 16,
    color: "#78350f",
    fontWeight: "600",
    marginBottom: 4,
  },
  preferenceSubtext: {
    fontSize: 13,
    color: "#9ca3af",
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#78350f",
    fontWeight: "500",
    marginLeft: 12,
  },
  saveButton: {
    backgroundColor: "#78350f",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#78350f",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0.1,
  },
  savingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 24,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: "center",
    paddingTop: 16,
  },
  versionText: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
  },
});