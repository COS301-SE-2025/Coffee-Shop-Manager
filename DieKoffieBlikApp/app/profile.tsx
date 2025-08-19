import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import CoffeeLoading from "../assets/loading";
import CoffeeBackground from "../assets/coffee-background";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase"; // Import your supabase client

interface UserProfile {
  id: string;
  username: string;
  email: string;
  last_name: string;
  password: string;
  phone_number: string;
  date_of_birth: string;
  created_at: string;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  favoriteItems: number;
  loyaltyPoints: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // State for user data
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user from Supabase Auth
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(`Auth error: ${authError.message}`);
      }

      if (!user) {
        // User is not logged in, redirect to login
        router.replace("/login");
        return;
      }

      // Fetch user profile data from your users table
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("email", user.email)
        .single();

      if (profileError) {
        throw new Error(`Profile error: ${profileError.message}`);
      }

      // Fetch additional data based on your actual tables
      const [ordersResult, stockResult] = await Promise.all([
        // Fetch total orders count from orders table
        supabase
          .from("orders")
          .select("id", { count: "exact" })
          .eq("user_id", userProfile.id),

        supabase.from("products").select("id", { count: "exact" }).limit(10),

        // Fetch user profile data
        supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", userProfile.id),
      ]);

      // Format the data for your component
      const formattedUserData: UserData = {
        name: `${userProfile.username} ${userProfile.last_name}`,
        email: userProfile.email,
        phone: userProfile.phone_number || "Not provided",

        totalOrders: ordersResult.count || 0,
        favoriteItems: stockResult.count || 0, // You can change this to actual favorites later
        loyaltyPoints: 0,
      };

      setUserData(formattedUserData);
    } catch (err: any) {
      console.error("Error fetching user data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleLogout = async () => {
  //   Alert.alert(
  //     "Logout",
  //     "Are you sure you want to logout?",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "Logout",
  //         style: "destructive",
  //         onPress: async () => {
  //           try {
  //             const { error } = await supabase.auth.signOut();
  //             if (error) {
  //               console.error('Logout error:', error);
  //               Alert.alert('Error', 'Failed to logout');
  //               return;
  //             }
  //             router.replace('/login');
  //           } catch (err) {
  //             console.error('Unexpected logout error:', err);
  //             Alert.alert('Error', 'An unexpected error occurred');
  //           }
  //         }
  //       }
  //     ]
  //   );
  // };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <CoffeeBackground>
          <View style={styles.centerContainer}>
            <CoffeeLoading visible={isLoading} />
          </View>
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </CoffeeBackground>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !userData) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>
          {error || "Failed to load profile data"}
        </Text>
        <Pressable style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const profileMenuItems = [
    {
      title: "Order History",
      icon: "time" as const,
      route: "/history",
      description: "View your past orders",
    },
    {
      title: "Account Settings",
      icon: "settings" as const,
      route: "/settings",
      description: "Your account settings",
    },
    {
      title: "Favourites",
      icon: "heart" as const,
      route: "/favourites",
      description: "Your saved items",
    },
    {
      title: "Help & Support",
      icon: "help-circle" as const,
      route: "/support",
      description: "Get help when you need it",
    },
  ];

  const statsData = [
    {
      label: "Total Orders",
      value: userData.totalOrders.toString(),
      icon: "receipt" as const,
    },
    {
      label: "Favorites",
      value: userData.favoriteItems.toString(),
      icon: "heart" as const,
    },
    {
      label: "Loyalty Points",
      value: userData.loyaltyPoints,
      icon: "star" as const,
    },
  ];

  const handleLogout = async () => {
    setIsLoading(true); // show loader immediately

    try {
      await AsyncStorage.removeItem("user_session");
      console.log("Session removed successfully");
    } catch (error) {
      console.error("Error removing session:", error);
      Alert.alert("Error", "Failed to clear session.");
      setIsLoading(false);
      return;
    }

    // Show confirmation alert
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setIsLoading(false), // hide loader if cancelled
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            setIsLoading(false); // hide loader before navigation
            router.push("/login");
          },
        },
      ],
      { cancelable: false },
    );
  };
  const NavBar = () => (
    <View style={styles.navbar}>
      <View style={styles.navLeft}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          android_ripple={{ color: "#78350f20" }}
        >
          <Ionicons name="arrow-back" size={24} color="#78350f" />
        </Pressable>
        <Text style={styles.navTitle}>Profile</Text>
      </View>
      <Pressable onPress={fetchUserData}>
        <Ionicons name="refresh" size={24} color="#78350f" />
      </Pressable>
    </View>
  );

  const ProfileHeader = () => (
    <View style={styles.profileHeaderSection}>
      <LinearGradient
        colors={["#78350f", "#92400e"]}
        style={styles.profileGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImagePlaceholder}>
            <Ionicons name="person" size={60} color="#78350f" />
          </View>
          <Pressable style={styles.editProfileButton}>
            <Ionicons name="camera" size={16} color="#78350f" />
          </Pressable>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userData.name}</Text>
          <Text style={styles.profileEmail}>{userData.email}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const StatsSection = () => (
    <View style={styles.statsSection}>
      {statsData.map((stat, index) => (
        <View key={index} style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name={stat.icon} size={20} color="#78350f" />
          </View>
          <Text style={styles.statNumber}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );

  const MenuSection = () => (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>Account</Text>
      {profileMenuItems.map((item, index) => (
        <Pressable
          key={index}
          style={styles.menuItem}
          onPress={() => router.push(item.route)}
          android_ripple={{ color: "#78350f10" }}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIconContainer}>
              <Ionicons name={item.icon} size={20} color="#78350f" />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemDescription}>{item.description}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </Pressable>
      ))}
    </View>
  );

  const SettingsSection = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>Settings</Text>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIconContainer}>
            <Ionicons name="notifications" size={20} color="#78350f" />
          </View>
          <View>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Get notified about orders
            </Text>
          </View>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: "#e5e7eb", true: "#78350f" }}
          thumbColor={notificationsEnabled ? "#fff" : "#f3f4f6"}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIconContainer}>
            <Ionicons name="moon" size={20} color="#78350f" />
          </View>
          <View>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingDescription}>Switch to dark theme</Text>
          </View>
        </View>
        <Switch
          value={darkModeEnabled}
          onValueChange={setDarkModeEnabled}
          trackColor={{ false: "#e5e7eb", true: "#78350f" }}
          thumbColor={darkModeEnabled ? "#fff" : "#f3f4f6"}
        />
      </View>
    </View>
  );

  const ActionButtons = () => (
    <View style={styles.actionButtonsSection}>
      <Pressable
        style={styles.logoutBtn}
        onPress={handleLogout}
        android_ripple={{ color: "#ffffff30" }}
      >
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutBtnText}>Logout</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CoffeeBackground>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <CoffeeLoading visible={isLoading} />
        <NavBar />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader />
          <StatsSection />
          <MenuSection />
          <SettingsSection />
          <ActionButtons />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>DieKoffieBlik</Text>
            <Text style={styles.footerSubtext}>Version 1.0.0</Text>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#78350f",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#78350f",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Navigation Bar
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 15,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  navLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#78350f",
  },

  // Profile Header
  profileHeaderSection: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#78350f",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  profileGradient: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: "#fff",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  editProfileButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "#fed7aa",
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: "#fbbf24",
  },

  // Stats Section
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 24,
  },
  statCard: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#78350f",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },

  // Menu Section
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#78350f",
    marginBottom: 16,
  },
  menuItem: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#78350f",
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 12,
    color: "#9ca3af",
  },

  // Settings Section
  settingsSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  settingItem: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#78350f",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: "#9ca3af",
  },

  // Action Buttons
  actionButtonsSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 32,
    gap: 12,
  },
  logoutBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
  },
  logoutBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  // Footer
  footer: {
    alignItems: "center",
    padding: 32,
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: "#78350f",
    fontWeight: "600",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#9ca3af",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
