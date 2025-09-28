import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
  RefreshControl,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import CoffeeBackground from "../assets/coffee-background";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CoffeeLoading from "../assets/loading";

interface FeaturedItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  stock_quantity?: number;
  icon: string;
  popular: boolean;
  rating: string;
}

interface ApiProduct {
  id: string;
  name: string;
  price: number;
  description?: string;
  stock_quantity?: number;
}

interface UserStats {
  totalOrders: number;
  loyaltyPoints: number;
  currentStreak: number;
}

interface Order {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
  order_products: {
    quantity: number;
    price: number;
    products: {
      id: string;
      name: string;
      price: number;
      description: string;
    };
  }[];
}

interface ProductWithStats extends ApiProduct {
  totalQuantity: number;
}

interface BackendUserStats {
  total_orders: number;
  current_streak: number;
  longest_streak: number;
  account_age_days: number;
}

type IoniconName = keyof typeof Ionicons.glyphMap;

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const factFadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollY = useRef(new Animated.Value(0)).current;
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({ totalOrders: 0, loyaltyPoints: 0, currentStreak: 0 });
  const [userName, setUserName] = useState("Coffee Lover");

  const API_BASE_URL = "http://192.168.0.97:5000";

  const coffeeQuotes = [
    "Life begins after coffee",
    "But first, coffee",
    "Espresso yourself!",
    "Coffee is my love language",
    "Rise and grind!",
    "Fuel your passion",
  ];

  const coffeeFacts = [
    "The word 'coffee' comes from the Arabic word 'qahwa'",
    "Espresso has less caffeine than drip coffee per cup!",
    "Coffee was first discovered by goats in Ethiopia",
    "Finland consumes the most coffee per capita globally",
    "Coffee beans are actually seeds, not beans!",
    "Brazil is the largest producer of coffee in the world",
    "Cold brew coffee is less acidic than hot brewed coffee",
    "A typical coffee tree can live up to 100 years",
    "There are two main coffee species: Arabica and Robusta",
    "Coffee can enhance physical performance by increasing adrenaline levels",
    "Black coffee contains almost zero calories",
    "The smell of coffee alone can help reduce stress",
    "Vietnam is the world's second-largest coffee producer",
    "There are over 25 million coffee farmers around the world",
    "The most expensive coffee comes from elephant dung",
    "Decaf coffee still contains small amounts of caffeine",
    "Coffee is the second most traded commodity after oil",
    "Adding milk to coffee can slow down the effects of caffeine",
    "Instant coffee was invented in 1901 by Japanese scientist Satori Kato",
    "Turkey has one of the oldest coffee brewing methods: Turkish coffee",
  ];

  // Calculate points from orders (EXACT same logic as website)
  const calculatePointsFromOrders = (orders: Order[]) => {
    const processedOrderIds = new Set();
    let totalPoints = 0;

    // Process orders only once and calculate points
    orders.forEach((order) => {
      if (processedOrderIds.has(order.id)) return;
      processedOrderIds.add(order.id);

      const pointsEarned = Math.round(order.total_price * 0.05 * 100);
      totalPoints += pointsEarned;
    });

    return totalPoints;
  };

  // Fetch user data for personalization - using EXACT same pattern as working profile screen
  const fetchUserData = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const userEmail = await AsyncStorage.getItem("email");
      const userId = await AsyncStorage.getItem("user_id");
      
      if (!accessToken || !userEmail || !userId) return;

      // Fetch orders first (using same pattern as profile page)
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
        }
      }

      // Fetch user profile (same as profile page)
      const profileResponse = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!profileResponse.ok) return;

      const apiResponse = await profileResponse.json();
      if (!apiResponse.success || !apiResponse.profile) return;

      const profile = apiResponse.profile;

      // Calculate stats from fetched orders (EXACT same logic as profile page)
      const completedOrders = fetchedOrders.filter(order => 
        order.status.toLowerCase() === 'completed'
      );
      
      const currentStreak = calculateStreak(fetchedOrders);
      // Calculate points from orders like website
      const calculatedPoints = calculatePointsFromOrders(fetchedOrders);

      setUserStats({
        totalOrders: fetchedOrders.length, // Same as profile page
        loyaltyPoints: calculatedPoints, // NOW CALCULATED FROM ORDERS LIKE WEBSITE
        currentStreak: currentStreak,
      });

      setUserName(profile.display_name || "Coffee Lover");
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Fallback: Don't show error, just use default values
    }
  }, []);

  // Calculate streak from orders (EXACT same function as profile page)
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

  const fetchFeaturedItems = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) return;

      // Fetch products and orders simultaneously
      const [productsResponse, ordersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/product`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        fetch(`${API_BASE_URL}/order`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      ]);

      if (!productsResponse.ok) throw new Error("Failed to fetch products");
      
      const productsData = await productsResponse.json();
      let ordersData = { orders: [] };
      
      if (ordersResponse.ok) {
        ordersData = await ordersResponse.json();
      }

      // Calculate product popularity from order data - same as before
      const productPopularity = calculateProductPopularity(ordersData.orders || []);
      
      // Get all products with their popularity stats
      const productsWithStats: ProductWithStats[] = productsData.map((item: ApiProduct) => {
        const popularity = productPopularity[item.id] || { orderCount: 0, totalQuantity: 0 };
        return {
          ...item,
          totalQuantity: popularity.totalQuantity,
        };
      });

      // Sort by popularity and determine top 25%
      const sortedByPopularity = productsWithStats.sort((a: ProductWithStats, b: ProductWithStats) => b.totalQuantity - a.totalQuantity);
      const topPercentileThreshold = Math.ceil(sortedByPopularity.length * 0.25);
      const popularProductIds = new Set(
        sortedByPopularity.slice(0, topPercentileThreshold).map((p: ProductWithStats) => p.id)
      );

      const getIconForProduct = (name: string) => {
        const lowercaseName = name.toLowerCase();
        if (lowercaseName.includes("espresso")) return "flash-outline";
        if (lowercaseName.includes("latte")) return "heart-outline";
        if (lowercaseName.includes("cappuccino")) return "cafe-outline";
        if (lowercaseName.includes("americano")) return "snow-outline";
        if (lowercaseName.includes("mocha")) return "color-palette-outline";
        if (lowercaseName.includes("macchiato")) return "star-outline";
        return "cafe-outline";
      };

      const featuredProducts: FeaturedItem[] = productsData
        .slice(0, 4)
        .map((item: ApiProduct) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          stock_quantity: item.stock_quantity,
          icon: getIconForProduct(item.name),
          popular: popularProductIds.has(item.id), // Top 25% most ordered products
          rating: "", // Removed ratings
        }));

      setFeaturedItems(featuredProducts);
    } catch (error) {
      console.error("Featured items error:", error);
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

  // Calculate product popularity from order data
  const calculateProductPopularity = (orders: any[]) => {
    const productStats: { [productId: string]: { orderCount: number; totalQuantity: number } } = {};
    
    // Only count completed orders for popularity
    const completedOrders = orders.filter((order: any) => 
      order.status && order.status.toLowerCase() === 'completed'
    );
    
    completedOrders.forEach((order: any) => {
      if (order.order_products && Array.isArray(order.order_products)) {
        order.order_products.forEach((orderProduct: any) => {
          if (orderProduct.products && orderProduct.products.id) {
            const productId = orderProduct.products.id;
            const quantity = orderProduct.quantity || 0;
            
            if (!productStats[productId]) {
              productStats[productId] = { orderCount: 0, totalQuantity: 0 };
            }
            
            productStats[productId].orderCount += 1;
            productStats[productId].totalQuantity += quantity;
          }
        });
      }
    });
    
    return productStats;
  };

  // Add subtle pulsing animation for CTA button
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);

    const animationTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    return () => clearTimeout(animationTimer);
  }, []);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const factInterval = setInterval(() => {
      if (isAnimating) return;

      setIsAnimating(true);

      Animated.timing(factFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentFactIndex((prev) => (prev + 1) % coffeeFacts.length);

        setTimeout(() => {
          Animated.timing(factFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setIsAnimating(false);
          });
        }, 50);
      });
    }, 12000);

    return () => clearInterval(factInterval);
  }, [isAnimating, factFadeAnim]);

  useEffect(() => {
    fetchFeaturedItems();
    fetchUserData();
  }, [fetchFeaturedItems, fetchUserData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fadeAnim.setValue(1);
    slideAnim.setValue(0);

    Promise.all([
      fetchFeaturedItems(),
      fetchUserData(),
    ]).finally(() => {
      setTimeout(() => {
        setRefreshing(false);
        setCurrentFactIndex(Math.floor(Math.random() * coffeeFacts.length));
      }, 1500);
    });
  }, [fetchFeaturedItems, fetchUserData]);

  const getGreeting = useCallback(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, [currentTime]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const NavBar = () => (
    <>
      <Animated.View
        style={[styles.navbarBackground, { opacity: headerOpacity }]}
      />
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <View style={styles.logoContainer}>
            <Ionicons name="cafe" size={28} color="#78350f" />
          </View>
          <View>
            <Text style={styles.navTitle}>DieKoffieBlik</Text>
            <Text style={styles.navSubtitle}>{getGreeting()}, {userName}</Text>
          </View>
        </View>
        <View style={styles.navRight}>
          

          <Pressable
            style={styles.profileButton}
            android_ripple={{ color: "#78350f20" }}
            onPress={() => router.push("/profile")}
          >
            <Ionicons name="person-circle" size={28} color="#78350f" />
          </Pressable>
        </View>
      </View>
    </>
  );

  const HeroSection = useCallback(
    () => (
      <Animated.View
        style={[
          styles.heroSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={["#78350f", "#92400e", "#b45309"]}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroGreeting}>{getGreeting()}</Text>
            <Text style={styles.heroMainTitle}>Ready for some coffee?</Text>
            <Text style={styles.heroSubtitle}>
              {coffeeQuotes[Math.floor(Math.random() * coffeeQuotes.length)]}
            </Text>
            
            

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Pressable
                style={styles.ctaButton}
                onPress={() => router.push("/order")}
                android_ripple={{ color: "#78350f30" }}
              >
                <Ionicons name="cafe" size={20} color="#78350f" />
                <Text style={styles.ctaButtonText}>Order Now</Text>
              </Pressable>
            </Animated.View>
          </View>
          
          <View style={styles.heroImageContainer}>
            <View style={styles.coffeeCupContainer}>
              <Animated.View
                style={[
                  styles.coffeeCupPlaceholder,
                  {
                    transform: [
                      {
                        rotate: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: ["0deg", "5deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="cafe" size={60} color="#78350f" />
              </Animated.View>
              
             
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    ),
    [fadeAnim, slideAnim, getGreeting, userStats, pulseAnim],
  );

  const StatsSection = () => (
    <View style={styles.statsSection}>
      <View style={styles.statCard}>
        <Ionicons name="receipt" size={24} color="#78350f" />
        <Text style={styles.statNumber}>{userStats.totalOrders}</Text>
        <Text style={styles.statLabel}>Orders</Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons name="flame" size={24} color="#f59e0b" />
        <Text style={styles.statNumber}>{userStats.currentStreak}</Text>
        <Text style={styles.statLabel}>Day Streak</Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons name="star" size={24} color="#f59e0b" />
        <Text style={styles.statNumber}>{userStats.loyaltyPoints}</Text>
        <Text style={styles.statLabel}>Points</Text>
      </View>
    </View>
  );

  const QuickActions = () => {
    const quickActions = [
      {
        title: "Order Coffee",
        icon: "cart" as const,
        route: "/order",
        primary: true,
        description: "Browse menu & order",
        color: "#78350f",
      },
      {
        title: "Leaderboard",
        icon: "trophy" as const,
        route: "/leaderboard",
        primary: false,
        description: "Top coffee lovers",
        color: "#f59e0b",
      },
      {
        title: "Order History",
        icon: "time" as const,
        route: "/history",
        primary: false,
        description: "View past orders",
        color: "#059669",
      },
    ];

    return (
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <Pressable
              key={`${action.title}-${index}`}
              style={[
                styles.quickActionCard,
                action.primary && styles.primaryAction,
                index === 2 && styles.fullWidthAction, // Make history full width
              ]}
              onPress={() => router.push(action.route)}
              android_ripple={{
                color: action.primary ? "#ffffff30" : "#78350f20",
              }}
            >
              <LinearGradient
                colors={action.primary ? ["#78350f", "#92400e"] : ["#fff", "#f9fafb"]}
                style={styles.actionGradient}
              >
                <View
                  style={[
                    styles.actionIconContainer,
                    action.primary && styles.primaryIconContainer,
                  ]}
                >
                  <Ionicons
                    name={action.icon}
                    size={24}
                    color={action.primary ? "#fff" : action.color}
                  />
                </View>
                <Text
                  style={[
                    styles.quickActionText,
                    action.primary && styles.quickActionTextPrimary,
                  ]}
                >
                  {action.title}
                </Text>
                <Text
                  style={[
                    styles.quickActionDescription,
                    action.primary && styles.quickActionDescriptionPrimary,
                  ]}
                >
                  {action.description}
                </Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  const FeaturedItems = () => (
    <View style={styles.featuredSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Items</Text>
        <Pressable onPress={() => router.push("/order")}>
          <Text style={styles.seeAllText}>See All</Text>
        </Pressable>
      </View>

      {featuredLoading ? (
        <View style={styles.loadingContainer}>
          <CoffeeLoading visible={featuredLoading} />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.featuredScroll}
          contentContainerStyle={styles.featuredScrollContent}
        >
          {featuredItems.map((item, index) => (
            <Animated.View
              key={item.id}
              style={[
                styles.featuredCard,
                {
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Pressable
                style={styles.featuredCardContent}
                android_ripple={{ color: "#78350f20" }}
              >
                <View style={styles.featuredIconContainer}>
                  <Ionicons
                    name={item.icon as IoniconName}
                    size={32}
                    color="#78350f"
                  />
                </View>

                {item.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Popular</Text>
                  </View>
                )}

                <Text style={styles.featuredItemName}>{item.name}</Text>

                <Text style={styles.featuredItemPrice}>R{item.price.toFixed(2)}</Text>

                <Pressable
                  style={styles.addToCartBtn}
                  android_ripple={{ color: "#ffffff30" }}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                </Pressable>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const CoffeeFactCard = useCallback(
    () => (
      <View style={styles.factCard}>
        <LinearGradient
          colors={["#fef3c7", "#fbbf24"]}
          style={styles.factGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.factHeader}>
            <View style={styles.factIconContainer}>
              <Ionicons name="bulb" size={20} color="#92400e" />
            </View>
            <Text style={styles.factTitle}>Coffee Fact</Text>
          </View>
          <Animated.Text style={[styles.factText, { opacity: factFadeAnim }]}>
            {coffeeFacts[currentFactIndex]}
          </Animated.Text>
        </LinearGradient>
      </View>
    ),
    [currentFactIndex, factFadeAnim],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <CoffeeBackground>
        <NavBar />

        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
        >
          <HeroSection />
          <StatsSection />
          <QuickActions />
          <FeaturedItems />
          <CoffeeFactCard />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Made with love and lots of coffee</Text>
            <Text style={styles.footerSubtext}>© 2025 DieKoffieBlik</Text>
          </View>
        </Animated.ScrollView>
      </CoffeeBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Navigation Bar
  navbarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 100 : 80,
    backgroundColor: "#fff",
    zIndex: 1,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 15,
    zIndex: 2,
  },
  navLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    elevation: 2,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#78350f",
  },
  navSubtitle: {
    fontSize: 12,
    color: "#b45309",
    marginTop: 2,
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: "#fff",
    elevation: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: "#fff7ed",
    elevation: 2,
  },

  // Hero Section
  heroSection: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    overflow: "hidden",
    minHeight: 200,
    elevation: 8,
    shadowColor: "#78350f",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  heroGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    minHeight: 200,
  },
  heroContent: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 14,
    color: "#fbbf24",
    marginBottom: 4,
    fontWeight: "500",
  },
  heroMainTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#fed7aa",
    marginBottom: 16,
    lineHeight: 20,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  streakText: {
    color: "#78350f",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  ctaButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: "flex-start",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  ctaButtonText: {
    color: "#78350f",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  heroImageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  coffeeCupContainer: {
    position: "relative",
  },
  coffeeCupPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#fff",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  loyaltyBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },
  loyaltyPoints: {
    color: "#78350f",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 2,
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
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#78350f",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },

  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#78350f",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: "#78350f",
    fontWeight: "600",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  fullWidthAction: {
    width: "100%",
  },
  primaryAction: {
    elevation: 6,
  },
  actionGradient: {
    padding: 20,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 2,
  },
  primaryIconContainer: {
    backgroundColor: "#92400e",
  },
  quickActionText: {
    fontSize: 15,
    color: "#78350f",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  quickActionTextPrimary: {
    color: "#fff",
  },
  quickActionDescription: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 16,
  },
  quickActionDescriptionPrimary: {
    color: "#fed7aa",
  },

  // Featured Items
  featuredSection: {
    paddingLeft: 20,
    marginTop: 32,
  },
  featuredScroll: {
    overflow: "visible",
  },
  featuredScrollContent: {
    paddingRight: 20,
  },
  featuredCard: {
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  featuredCardContent: {
    backgroundColor: "#fff",
    width: 170,
    padding: 16,
    paddingBottom: 24,
    alignItems: "center",
    position: "relative",
  },
  featuredIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    marginTop: 8,
    elevation: 2,
  },
  popularBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  popularText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  featuredItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#78350f",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 18,
  },
  featuredItemPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#78350f",
    marginBottom: 12,
  },
  addToCartBtn: {
    backgroundColor: "#78350f",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  // Coffee Fact Card
  factCard: {
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  factGradient: {
    padding: 20,
  },
  factHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  factIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    elevation: 2,
  },
  factTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#92400e",
  },
  factText: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
    fontWeight: "500",
  },

  // Loading
  loadingContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },

  // Footer
  footer: {
    alignItems: "center",
    padding: 32,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#b45309",
    fontStyle: "italic",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#9ca3af",
  },
});