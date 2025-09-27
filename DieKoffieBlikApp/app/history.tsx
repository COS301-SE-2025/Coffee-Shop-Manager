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
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CoffeeBackground from "../assets/coffee-background";

const API_BASE_URL = "http://192.168.0.97:5000";

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

export interface OrderItem {
  id: string;
  date: string;
  status: "completed" | "cancelled" | "pending" | string;
  items: number;
  total: string;
  restaurant: string;
  items_detail: string[];
  orderNumber: number;
}

export default function OrderHistoryScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch orders from API using the same logic as the website
  const fetchOrders = async (isRefresh = false) => {
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

      const response = await fetch(`${API_BASE_URL}/order`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.orders) {
        setOrders(data.orders);
        console.log("Fetched orders:", data.orders.length);
      } else {
        console.warn("Failed to fetch orders:", data.error || "Unknown error");
        Alert.alert("Error", "Failed to load orders. Please try again.");
      }
    } catch (error) {
      console.error("Network or server error:", error);
      Alert.alert("Error", "Failed to connect to server. Please check your internet connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load orders when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  // Convert API order to display format
  const convertOrderToDisplayFormat = (order: Order): OrderItem => {
    const itemsDetail = order.order_products.map(
      (p) => `${p.products.name} x${p.quantity}`
    );
    
    return {
      id: order.id,
      date: new Date(order.created_at).toLocaleDateString("en-ZA"),
      status: order.status.toLowerCase(),
      items: order.order_products.reduce((sum, p) => sum + p.quantity, 0),
      total: `R ${order.total_price.toFixed(2)}`,
      restaurant: "Die Koffieblik Café",
      items_detail: itemsDetail,
      orderNumber: order.number,
    };
  };

  const filterOptions = [
    { key: "all", label: "All Orders" },
    { key: "completed", label: "Completed" },
    { key: "pending", label: "Pending" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#10b981";
      case "cancelled":
        return "#ef4444";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Convert and filter orders
  const displayOrders = orders.map(convertOrderToDisplayFormat);
  const filteredOrders =
    selectedFilter === "all"
      ? displayOrders
      : displayOrders.filter((order) => order.status === selectedFilter);

  // Calculate stats from real data
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status.toLowerCase() === "completed").length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total_price, 0);

  const onRefresh = () => {
    fetchOrders(true);
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
        <Text style={styles.navTitle}>Order History</Text>
      </View>
    </View>
  );

  const HeaderStats = () => (
    <View style={styles.headerSection}>
      <LinearGradient
        colors={["#78350f", "#92400e"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedOrders}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>R {totalSpent.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const FilterTabs = () => (
    <View style={styles.filterSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filterOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.filterTab,
              selectedFilter === option.key && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(option.key)}
            android_ripple={{ color: "#78350f20" }}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === option.key && styles.filterTabTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const OrderItem = ({ order }: { order: OrderItem }) => (
    <Pressable style={styles.orderCard} android_ripple={{ color: "#78350f10" }}>
      <View style={styles.orderHeader}>
        <View style={styles.orderLeft}>
          <Text style={styles.orderId}>#{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{order.date}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(order.status) }]}
          >
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      <View style={styles.orderBody}>
        <Text style={styles.restaurantName}>{order.restaurant}</Text>
        <Text style={styles.orderItems}>{order.items_detail.join(", ")}</Text>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.orderInfo}>
          <Text style={styles.itemCount}>
            {order.items} item{order.items > 1 ? "s" : ""}
          </Text>
          <Text style={styles.orderTotal}>{order.total}</Text>
        </View>
        <View style={styles.actionButtons}>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Reorder</Text>
          </Pressable>
          <Pressable style={styles.actionButtonSecondary}>
            <Ionicons name="receipt" size={16} color="#78350f" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  const LoadingState = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingSpinner}>
        <Ionicons name="cafe" size={40} color="#78350f" />
      </View>
      <Text style={styles.loadingText}>Loading your orders...</Text>
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
        <NavBar />
        <HeaderStats />
        <FilterTabs />

        {loading ? (
          <LoadingState />
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <OrderItem order={item} />}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#78350f"]}
                tintColor="#78350f"
              />
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={64} color="#9ca3af" />
                <Text style={styles.emptyStateTitle}>No orders found</Text>
                <Text style={styles.emptyStateText}>
                  {selectedFilter === "all"
                    ? "You haven't made any orders yet"
                    : `No ${selectedFilter} orders found`}
                </Text>
                <Pressable 
                  style={styles.refreshButton}
                  onPress={() => fetchOrders()}
                >
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </CoffeeBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  // Navigation Bar
  navbar: {
    flexDirection: "row",
    alignItems: "center",
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
    shadowColor: "#78350f",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#fed7aa",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#fed7aa40",
  },

  // Filter Section
  filterSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginBottom: 10,
  },
  filterTabActive: {
    backgroundColor: "#78350f",
  },
  filterTabText: {
    fontSize: 14,
    color: "#78350f",
    fontWeight: "600",
  },
  filterTabTextActive: {
    color: "#fff",
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#78350f",
    fontWeight: "600",
  },

  // Order Items
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#78350f",
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  orderBody: {
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderInfo: {
    flex: 1,
  },
  itemCount: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 2,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#78350f",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    backgroundColor: "#78350f",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtonSecondary: {
    backgroundColor: "#fff7ed",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: "#78350f",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});