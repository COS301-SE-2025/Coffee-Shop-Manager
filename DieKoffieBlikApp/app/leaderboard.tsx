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
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CoffeeBackground from "../assets/coffee-background";
import CoffeeLoading from "../assets/loading";

const API_BASE_URL = "https://api.diekoffieblik.co.za";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_orders: number;
  total_spent?: number; // Made optional since API doesn't return it
  rank: number;
}

interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardEntry[];
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    fetchLeaderboard();
    getCurrentUserId();
  }, []);

  const getCurrentUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (userId) {
        setCurrentUserId(userId);
      }
    } catch (error) {
      console.error("Failed to get user ID:", error);
    }
  };

  const fetchLeaderboard = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      
      if (!accessToken) {
        Alert.alert("Session Expired", "Please log in again");
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/leaderboard?limit=50`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch leaderboard`);
      }

      const data: LeaderboardResponse = await response.json();

      if (data.success && data.leaderboard) {
        // Add rank to each entry
        const rankedLeaderboard = data.leaderboard.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));
        setLeaderboard(rankedLeaderboard);
      } else {
        console.warn("Failed to fetch leaderboard:", data);
        Alert.alert("Error", "Failed to load leaderboard. Please try again.");
      }
    } catch (error) {
      console.error("Network or server error:", error);
      Alert.alert("Error", "Failed to connect to server. Please check your internet connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchLeaderboard(true);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "trophy";
      case 2:
        return "medal";
      case 3:
        return "ribbon";
      default:
        return "person";
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#ffd700"; // Gold
      case 2:
        return "#c0c0c0"; // Silver
      case 3:
        return "#cd7f32"; // Bronze
      default:
        return "#78350f";
    }
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
        <Text style={styles.navTitle}>Leaderboard</Text>
      </View>
      <Pressable onPress={() => fetchLeaderboard()}>
        <Ionicons name="refresh" size={24} color="#78350f" />
      </Pressable>
    </View>
  );

  const HeaderSection = () => (
    <View style={styles.headerSection}>
      <LinearGradient
        colors={["#f59e0b", "#d97706"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Ionicons name="trophy" size={48} color="#fff" />
          <Text style={styles.headerTitle}>Coffee Champions</Text>
          <Text style={styles.headerSubtitle}>Top coffee lovers ranked by total orders</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const TopThree = () => {
    const topThree = leaderboard.slice(0, 3);
    if (topThree.length === 0) return null;

    return (
      <View style={styles.topThreeSection}>
        <Text style={styles.sectionTitle}>Top 3 Champions</Text>
        <View style={styles.topThreeContainer}>
          {topThree.map((entry, index) => (
            <View key={entry.user_id} style={[styles.topThreeCard, index === 0 && styles.firstPlace]}>
              <LinearGradient
                colors={index === 0 ? ["#ffd700", "#ffed4e"] : index === 1 ? ["#c0c0c0", "#e5e5e5"] : ["#cd7f32", "#d4a574"]}
                style={styles.topThreeGradient}
              >
                <View style={styles.topThreeRank}>
                  <Ionicons name={getRankIcon(entry.rank)} size={32} color="#fff" />
                  <Text style={styles.topThreeRankText}>#{entry.rank}</Text>
                </View>
                <Text style={styles.topThreeName}>{entry.display_name}</Text>
                <View style={styles.topThreeStats}>
                  <Text style={styles.topThreeOrdersText}>{entry.total_orders} orders</Text>
                  {/* Only show total_spent if it exists */}
                  {entry.total_spent !== undefined && (
                    <Text style={styles.topThreeSpentText}>R{entry.total_spent.toFixed(2)}</Text>
                  )}
                </View>
                {entry.user_id === currentUserId && (
                  <View style={styles.youBadge}>
                    <Text style={styles.youBadgeText}>YOU</Text>
                  </View>
                )}
              </LinearGradient>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const LeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <View style={[styles.leaderboardItem, item.user_id === currentUserId && styles.currentUserItem]}>
      <View style={styles.rankContainer}>
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(item.rank) }]}>
          <Ionicons name={getRankIcon(item.rank)} size={20} color="#fff" />
        </View>
        <Text style={styles.rankText}>#{item.rank}</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={[styles.userName, item.user_id === currentUserId && styles.currentUserName]}>
          {item.display_name}
          {item.user_id === currentUserId && " (You)"}
        </Text>
        <Text style={styles.userStats}>
          {item.total_orders} orders
          {/* Only show total_spent if it exists */}
          {item.total_spent !== undefined && ` • R${item.total_spent.toFixed(2)} spent`}
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreNumber}>{item.total_orders}</Text>
        <Text style={styles.scoreLabel}>orders</Text>
      </View>
    </View>
  );

  const LoadingState = () => (
    <View style={styles.loadingContainer}>
      <CoffeeLoading visible={loading} />
      <Text style={styles.loadingText}>Loading leaderboard...</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CoffeeBackground>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <NavBar />
          <LoadingState />
        </CoffeeBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CoffeeBackground>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <NavBar />
        <HeaderSection />
        
        <ScrollView 
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#78350f"]}
              tintColor="#78350f"
            />
          }
        >
          <TopThree />
          
          <View style={styles.fullLeaderboardSection}>
            <Text style={styles.sectionTitle}>Full Rankings</Text>
            {leaderboard.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={64} color="#9ca3af" />
                <Text style={styles.emptyStateTitle}>No rankings yet</Text>
                <Text style={styles.emptyStateText}>
                  Start ordering coffee to appear on the leaderboard!
                </Text>
              </View>
            ) : (
              leaderboard.map((item, index) => (
                <LeaderboardItem key={item.user_id} item={item} index={index} />
              ))
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Rankings update in real-time</Text>
            <Text style={styles.footerSubtext}>Keep ordering to climb the leaderboard!</Text>
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
  scrollContainer: {
    flex: 1,
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

  // Header Section
  headerSection: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#f59e0b",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fef3c7",
    textAlign: "center",
  },

  // Top Three Section
  topThreeSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#78350f",
    marginBottom: 16,
  },
  topThreeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  topThreeCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  firstPlace: {
    elevation: 6,
    transform: [{ scale: 1.05 }],
  },
  topThreeGradient: {
    padding: 16,
    alignItems: "center",
    minHeight: 140,
    justifyContent: "center",
    position: "relative",
  },
  topThreeRank: {
    alignItems: "center",
    marginBottom: 8,
  },
  topThreeRankText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 4,
  },
  topThreeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  topThreeStats: {
    alignItems: "center",
  },
  topThreeOrdersText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  topThreeSpentText: {
    fontSize: 10,
    color: "#ffffff80",
  },
  youBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ef4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  youBadgeText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#fff",
  },

  // Full Leaderboard Section
  fullLeaderboardSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  leaderboardItem: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: "#78350f",
    backgroundColor: "#fff7ed",
  },
  rankContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#78350f",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#78350f",
    marginBottom: 2,
  },
  currentUserName: {
    color: "#92400e",
  },
  userStats: {
    fontSize: 12,
    color: "#9ca3af",
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#78350f",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#9ca3af",
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#78350f",
    marginTop: 16,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },

  // Footer
  footer: {
    alignItems: "center",
    padding: 32,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#78350f",
    fontWeight: "600",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
});