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
  RefreshControl,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CoffeeBackground from "../assets/coffee-background";
import CoffeeLoading from "../assets/loading";

const API_BASE_URL = "http://192.168.0.97:5000";

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

interface Order {
  id: string;
  number: number;
  status: string;
  total_price: number;
  created_at: string;
  order_products: {
    quantity: number;
    price: number;
    products: {
      name: string;
      price: number;
      description: string;
    };
  }[];
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  currentStreak: number;
  favoriteDrink: string;
  loyaltyPoints: number;
  totalSpent: number;
  dateOfBirth: string;
  userId: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  image: any; // For require() images
}

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // State for user data
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  // Badge images mapping
  const badgeImages = {
    first_order: require("../app/badges/badges/first.png"),
    "5_orders": require("../app/badges/badges/5orders.png"),
    "10_orders": require("../app/badges/badges/10orders.png"),
    "3_day_streak": require("../app/badges/badges/3dayStreak.png"),
    "7_day_streak": require("../app/badges/badges/7dayStreak.png"),
    week_member: require("../app/badges/badges/week_account.png"),
    month_member: require("../app/badges/badges/week_account.png"),
    year_member: require("../app/badges/badges/year_account.png"),
  };

  // Add refresh functionality
  const onRefresh = () => {
    fetchAllData(true);
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch all data - simplified approach like history page
  const fetchAllData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const userEmail = await AsyncStorage.getItem("email");
      const userId = await AsyncStorage.getItem("user_id");

      if (!accessToken || !userEmail || !userId) {
        Alert.alert("Session Expired", "Please log in again");
        router.replace("/login");
        return;
      }

      // Fetch orders first (using same pattern as history page)
      const ordersResponse = await fetch(`${API_BASE_URL}/order`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      let fetchedOrders: Order[] = [];
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        if (ordersData.orders) {
          fetchedOrders = ordersData.orders;
          setOrders(fetchedOrders);
        }
      }

      // Fetch user profile
      const profileResponse = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!profileResponse.ok) {
        if (profileResponse.status === 401) {
          await handleTokenExpiry();
          return;
        }
        throw new Error(`HTTP ${profileResponse.status}: Failed to fetch profile`);
      }

      const apiResponse: ApiResponse = await profileResponse.json();

      if (!apiResponse.success || !apiResponse.profile) {
        throw new Error("Invalid API response format");
      }

      const profile = apiResponse.profile;

      // Calculate stats from fetched orders (same logic as history page)
      const completedOrders = fetchedOrders.filter(order => 
        order.status.toLowerCase() === 'completed'
      );
      
      const totalSpent = fetchedOrders.reduce((sum, order) => sum + order.total_price, 0);
      const currentStreak = calculateStreak(fetchedOrders);
      const favoriteDrink = calculateFavoriteDrink(fetchedOrders);

      const formattedUserData: UserData = {
        name: profile.display_name || "User",
        email: userEmail,
        phone: profile.phone_number || "Not provided",
        totalOrders: fetchedOrders.length,
        currentStreak: currentStreak,
        favoriteDrink: favoriteDrink,
        loyaltyPoints: profile.loyalty_points || 0,
        totalSpent: totalSpent,
        dateOfBirth: profile.date_of_birth || "Not provided",
        userId: profile.user_id,
      };

      setUserData(formattedUserData);

      // Fetch badges last
      await fetchUserBadges(isRefresh, accessToken);
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error fetching data:", err);
        setError(err.message);
        if (!isRefresh) {
          Alert.alert("Error", "Failed to load profile data. Please try again.");
        }
      } else {
        console.error("Unknown error:", err);
        setError("Failed to load profile");
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate streak from orders (same as before)
  const calculateStreak = (orders: Order[]) => {
    if (orders.length === 0) return 0;
    
    const sortedOrders = orders
      .filter(order => order.status.toLowerCase() === 'completed')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (sortedOrders.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const latestOrder = new Date(sortedOrders[0].created_at);
    latestOrder.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - latestOrder.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) return 0;

    const orderDates = new Set(
      sortedOrders.map(order => {
        const date = new Date(order.created_at);
        return date.toDateString();
      })
    );

    let currentDate = new Date(today);
    
    if (daysDiff === 1) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    while (orderDates.has(currentDate.toDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  // Calculate favorite drink from orders (same as before)
  const calculateFavoriteDrink = (orders: Order[]) => {
    if (orders.length === 0) return "None";
    
    const drinkCounts: { [key: string]: number } = {};
    
    orders.forEach(order => {
      order.order_products.forEach(product => {
        const drinkName = product.products.name;
        drinkCounts[drinkName] = (drinkCounts[drinkName] || 0) + product.quantity;
      });
    });

    if (Object.keys(drinkCounts).length === 0) return "None";

    const favoriteDrink = Object.keys(drinkCounts).reduce((a, b) => 
      drinkCounts[a] > drinkCounts[b] ? a : b
    );

    return favoriteDrink;
  };

  const fetchUserBadges = async (isRefresh = false, providedToken?: string) => {
    const accessToken = providedToken || await AsyncStorage.getItem("access_token");
    
    if (!accessToken) return;

    if (!isRefresh) {
      setBadgesLoading(true);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/badges`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.badges) {
          const badgeMapping = [
            { apiKey: "first_order", name: "First Sip", description: "Placed your first order" },
            { apiKey: "5_orders", name: "Coffee Lover", description: "Ordered 5 coffees" },
            { apiKey: "10_orders", name: "Regular", description: "Ordered 10 coffees" },
            { apiKey: "3_day_streak", name: "Daily Habit", description: "3 day streak" },
            { apiKey: "7_day_streak", name: "Weekly Warrior", description: "7 day streak" },
            { apiKey: "week_member", name: "Week Member", description: "Member for a week" },
            { apiKey: "month_member", name: "Month Member", description: "Member for a month" },
            { apiKey: "year_member", name: "Year Member", description: "Member for a year" },
          ];

          const userBadges = badgeMapping.map(badge => ({
            id: badge.apiKey,
            name: badge.name,
            description: badge.description,
            image: badgeImages[badge.apiKey as keyof typeof badgeImages],
            earned: data.badges.includes(badge.apiKey)
          }));

          setBadges(userBadges);
        }
      } else {
        console.warn("Failed to fetch badges:", response.status);
      }
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setBadgesLoading(false);
    }
  };

  const handleTokenExpiry = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refresh_token");

      if (!refreshToken) {
        await clearStorageAndRedirect();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        await clearStorageAndRedirect();
        return;
      }

      const { accessToken: newAccessToken } = await response.json();
      await AsyncStorage.setItem("access_token", newAccessToken);

      fetchAllData();
    } catch (error) {
      console.error("Token refresh error:", error);
      await clearStorageAndRedirect();
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
            console.error("Unexpected logout error:", err);
            Alert.alert("Error", "An unexpected error occurred");
          }
        },
      },
    ]);
  };

  // Loading state
  if (isLoading) {
    return <CoffeeLoading visible={isLoading} />;
  }

  // Error state
  if (error || !userData) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>
          {error || "Failed to load profile data"}
        </Text>
        <Pressable style={styles.retryButton} onPress={() => fetchAllData()}>
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
      label: "Current Streak",
      value: `${userData.currentStreak} days`,
      icon: "flame" as const,
    },
    {
      label: "Favourite Drink",
      value: userData.favoriteDrink,
      icon: "cafe" as const,
    },
  ];

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
      <Pressable onPress={() => fetchAllData()}>
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
          <Text style={styles.profilePhone}>{userData.phone}</Text>
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

  const BadgesSection = () => (
    <View style={styles.badgesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Achievements</Text>
        <Pressable onPress={() => fetchUserBadges()} style={styles.refreshButton}>
          <Ionicons name="refresh" size={16} color="#78350f" />
        </Pressable>
      </View>
      
      {badgesLoading ? (
        <View style={styles.badgesGrid}>
          {[...Array(8)].map((_, index) => (
            <View key={index} style={[styles.badgeCard, styles.badgeLoading]}>
              <View style={styles.badgeImageLoading} />
              <View style={styles.badgeTextLoading} />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.badgesGrid}>
          {badges.map((badge) => (
            <View
              key={badge.id}
              style={[
                styles.badgeCard,
                badge.earned ? styles.badgeEarned : styles.badgeNotEarned
              ]}
            >
              <View style={styles.badgeImageContainer}>
                <Image
                  source={badge.image}
                  style={[
                    styles.badgeImage,
                    !badge.earned && styles.badgeImageGrayscale
                  ]}
                  resizeMode="contain"
                />
              </View>
              <Text style={[
                styles.badgeName,
                badge.earned ? styles.badgeNameEarned : styles.badgeNameNotEarned
              ]}>
                {badge.name}
              </Text>
              <Text style={[
                styles.badgeDescription,
                badge.earned ? styles.badgeDescriptionEarned : styles.badgeDescriptionNotEarned
              ]}>
                {badge.description}
              </Text>
              {badge.earned && (
                <View style={styles.earnedIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                </View>
              )}
            </View>
          ))}
        </View>
      )}
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
    <CoffeeBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <NavBar />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#78350f"]}
              tintColor="#78350f"
            />
          }
        >
          <ProfileHeader />
          <StatsSection />
          <BadgesSection />
          <MenuSection />
          <SettingsSection />
          <ActionButtons />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>DieKoffieBlik</Text>
            <Text style={styles.footerSubtext}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </CoffeeBackground>
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
  profilePhone: {
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#78350f",
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },

  // Badges Section
  badgesSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#78350f",
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  badgeCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    position: "relative",
  },
  badgeEarned: {
    borderWidth: 2,
    borderColor: "#10b981",
  },
  badgeNotEarned: {
    opacity: 0.6,
  },
  badgeLoading: {
    opacity: 0.7,
  },
  badgeImageContainer: {
    width: 50,
    height: 50,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeImage: {
    width: 50,
    height: 50,
  },
  badgeImageGrayscale: {
    opacity: 0.4,
  },
  badgeImageLoading: {
    width: 50,
    height: 50,
    backgroundColor: "#e5e7eb",
    borderRadius: 25,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeNameEarned: {
    color: "#78350f",
  },
  badgeNameNotEarned: {
    color: "#9ca3af",
  },
  badgeDescription: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 14,
  },
  badgeDescriptionEarned: {
    color: "#6b7280",
  },
  badgeDescriptionNotEarned: {
    color: "#9ca3af",
  },
  badgeTextLoading: {
    width: "80%",
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
  },
  earnedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
  },

  // Menu Section
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 32,
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
});