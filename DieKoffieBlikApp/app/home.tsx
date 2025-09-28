import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Alert,
  Image,
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
  image?: string;
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

interface Recommendation {
  suggestions: string[];
  reasoning: string;
  weather?: {
    temperature: number;
    windspeed: number;
    weathercode: number;
    time: string;
  };
  confidence: 'low' | 'medium' | 'high';
}

type IoniconName = keyof typeof Ionicons.glyphMap;

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

// Memoized constants
const PRETORIA_COORDINATES = { latitude: -25.7479, longitude: 28.2293 };
const API_BASE_URL = "http://192.168.0.97:5000";

const COFFEE_QUOTES = [
  "Life begins after coffee",
  "But first, coffee",
  "Espresso yourself!",
  "Coffee is my love language",
  "Rise and grind!",
  "Fuel your passion",
];

const COFFEE_FACTS = [
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

// Custom hook for managing API state
const useApiData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async (url: string, options?: RequestInit) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("No access token found");
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('API Error:', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { apiCall, isLoading, error, setError };
};

// Custom hook for animations
const useAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const factFadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const startInitialAnimations = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);

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
  }, [fadeAnim, slideAnim]);

  const startPulseAnimation = useCallback(() => {
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
  }, [pulseAnim]);

  const animateFactTransition = useCallback((callback: () => void) => {
    Animated.timing(factFadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      callback();
      setTimeout(() => {
        Animated.timing(factFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 50);
    });
  }, [factFadeAnim]);

  return {
    fadeAnim,
    slideAnim,
    factFadeAnim,
    pulseAnim,
    scrollY,
    startInitialAnimations,
    startPulseAnimation,
    animateFactTransition,
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const { apiCall, isLoading: apiLoading, error: apiError, setError } = useApiData();
  const {
    fadeAnim,
    slideAnim,
    factFadeAnim,
    pulseAnim,
    scrollY,
    startInitialAnimations,
    startPulseAnimation,
    animateFactTransition,
  } = useAnimations();

  // State management
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({ 
    totalOrders: 0, 
    loyaltyPoints: 0, 
    currentStreak: 0 
  });
  const [userName, setUserName] = useState("Coffee Lover");
  
  // Recommendation state
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [recommendationProducts, setRecommendationProducts] = useState<FeaturedItem[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [hasLoadedRecommendations, setHasLoadedRecommendations] = useState(false);

  // Memoized greeting calculation
  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, [currentTime]);

  // Memoized random quote
  const currentQuote = useMemo(() => 
    COFFEE_QUOTES[Math.floor(Math.random() * COFFEE_QUOTES.length)], 
    [refreshing] // Re-calculate on refresh
  );

  // Helper functions
  const getIconForProduct = useCallback((name: string): IoniconName => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes("espresso")) return "flash-outline";
    if (lowercaseName.includes("latte")) return "heart-outline";
    if (lowercaseName.includes("cappuccino")) return "cafe-outline";
    if (lowercaseName.includes("americano")) return "snow-outline";
    if (lowercaseName.includes("mocha")) return "color-palette-outline";
    if (lowercaseName.includes("macchiato")) return "star-outline";
    if (lowercaseName.includes("frappuccino")) return "cloudy-outline";
    if (lowercaseName.includes("iced")) return "snow-outline";
    if (lowercaseName.includes("tea")) return "leaf-outline";
    return "cafe-outline";
  }, []);

  const getConfidenceColor = useCallback((confidence: string) => {
    switch (confidence) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  }, []);

  const getWeatherIcon = useCallback((weathercode: number): IoniconName => {
    if (weathercode === 0) return 'sunny-outline';
    if (weathercode <= 3) return 'partly-sunny-outline';
    if (weathercode <= 67) return 'rainy-outline';
    if (weathercode <= 77) return 'snow-outline';
    return 'cloudy-outline';
  }, []);

  // Error handling with user feedback
  const handleError = useCallback((error: Error, context: string) => {
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly error messages for critical failures
    if (context === 'fetchUserData' || context === 'fetchFeaturedItems') {
      Alert.alert(
        'Connection Issue',
        'Unable to load some content. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  // Calculate points from orders (improved with error handling)
  const calculatePointsFromOrders = useCallback((orders: Order[]) => {
    try {
      const processedOrderIds = new Set();
      let totalPoints = 0;

      orders.forEach((order) => {
        if (processedOrderIds.has(order.id)) return;
        processedOrderIds.add(order.id);

        const pointsEarned = Math.round(order.total_price * 0.05 * 100);
        totalPoints += pointsEarned;
      });

      return totalPoints;
    } catch (error) {
      console.error('Error calculating points:', error);
      return 0;
    }
  }, []);

  // Calculate streak from orders (improved with error handling)
  const calculateStreak = useCallback((orders: Order[]) => {
    try {
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
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }, []);

  // Calculate product popularity from order data (improved)
  const calculateProductPopularity = useCallback((orders: any[]) => {
    try {
      const productStats: { [productId: string]: { orderCount: number; totalQuantity: number } } = {};
      
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
    } catch (error) {
      console.error('Error calculating product popularity:', error);
      return {};
    }
  }, []);

  // Fetch user data (improved with error handling)
  const fetchUserData = useCallback(async () => {
    try {
      const userEmail = await AsyncStorage.getItem("email");
      const userId = await AsyncStorage.getItem("user_id");
      
      if (!userEmail || !userId) {
        console.log('Missing user credentials');
        return;
      }

      // Fetch orders and profile in parallel
      const [ordersData, profileData] = await Promise.allSettled([
        apiCall(`${API_BASE_URL}/order`),
        apiCall(`${API_BASE_URL}/user/${userId}`)
      ]);

      let fetchedOrders: Order[] = [];
      if (ordersData.status === 'fulfilled' && ordersData.value.orders) {
        fetchedOrders = ordersData.value.orders;
      }

      if (profileData.status === 'fulfilled' && profileData.value.success && profileData.value.profile) {
        const profile = profileData.value.profile;
        setUserName(profile.display_name || "Coffee Lover");
      }

      // Calculate stats from fetched orders
      const completedOrders = fetchedOrders.filter(order => 
        order.status.toLowerCase() === 'completed'
      );
      
      const currentStreak = calculateStreak(fetchedOrders);
      const calculatedPoints = calculatePointsFromOrders(fetchedOrders);

      setUserStats({
        totalOrders: fetchedOrders.length,
        loyaltyPoints: calculatedPoints,
        currentStreak: currentStreak,
      });
    } catch (error) {
      handleError(error as Error, 'fetchUserData');
    }
  }, [apiCall, calculateStreak, calculatePointsFromOrders, handleError]);

  // Fetch featured items (improved)
  const fetchFeaturedItems = useCallback(async () => {
    try {
      setFeaturedLoading(true);

      const [productsData, ordersData] = await Promise.allSettled([
        apiCall(`${API_BASE_URL}/product`),
        apiCall(`${API_BASE_URL}/order`)
      ]);

      if (productsData.status !== 'fulfilled') {
        throw new Error('Failed to fetch products');
      }

      const products = productsData.value;
      const orders = ordersData.status === 'fulfilled' ? ordersData.value.orders || [] : [];

      // Calculate product popularity
      const productPopularity = calculateProductPopularity(orders);
      
      // Get all products with their popularity stats
      const productsWithStats: ProductWithStats[] = products.map((item: ApiProduct) => {
        const popularity = productPopularity[item.id] || { orderCount: 0, totalQuantity: 0 };
        return {
          ...item,
          totalQuantity: popularity.totalQuantity,
        };
      });

      // Sort by popularity and determine top 25%
      const sortedByPopularity = productsWithStats.sort((a: ProductWithStats, b: ProductWithStats) => 
        b.totalQuantity - a.totalQuantity
      );
      const topPercentileThreshold = Math.ceil(sortedByPopularity.length * 0.2);
      const popularProductIds = new Set(
        sortedByPopularity.slice(0, topPercentileThreshold).map((p: ProductWithStats) => p.id)
      );

      const featuredProducts: FeaturedItem[] = products
        .slice(0, 6) // Show more items
        .map((item: ApiProduct) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          stock_quantity: item.stock_quantity,
          icon: getIconForProduct(item.name),
          popular: popularProductIds.has(item.id),
          rating: "",
        }));

      setFeaturedItems(featuredProducts);
    } catch (error) {
      handleError(error as Error, 'fetchFeaturedItems');
    } finally {
      setFeaturedLoading(false);
    }
  }, [apiCall, calculateProductPopularity, getIconForProduct, handleError]);

  // Fetch recommendations (improved)
  const fetchRecommendations = useCallback(async () => {
    if (recommendationsLoading || hasLoadedRecommendations) return;
    
    try {
      setRecommendationsLoading(true);
      
      console.log('Fetching recommendations...');
      
      const data = await apiCall(
        `${API_BASE_URL}/user/recommendation?lat=${PRETORIA_COORDINATES.latitude}&lon=${PRETORIA_COORDINATES.longitude}`
      );
      
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
        await fetchRecommendationProducts(data.recommendations.suggestions);
        setHasLoadedRecommendations(true);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      // Don't show error to user for recommendations as they're not critical
    } finally {
      setRecommendationsLoading(false);
    }
  }, [apiCall, recommendationsLoading, hasLoadedRecommendations]);

  // Fetch recommendation products (improved)
  const fetchRecommendationProducts = useCallback(async (suggestions: string[]) => {
    try {
      console.log('Fetching products for suggestions:', suggestions);
      
      const productsData = await apiCall(`${API_BASE_URL}/product`);

      // Improved product matching algorithm
      const matchedProducts = productsData.filter((product: ApiProduct) => {
        return suggestions.some(suggestion => {
          const suggestionWords = suggestion.toLowerCase().replace(/_/g, ' ').split(' ');
          const productName = product.name.toLowerCase();
          const productDescription = (product.description || '').toLowerCase();
          
          return suggestionWords.some(word => 
            productName.includes(word) || productDescription.includes(word)
          );
        });
      });

      console.log('Matched products:', matchedProducts.length);

      const recommendationItems: FeaturedItem[] = matchedProducts
        .slice(0, 4) // Show more recommendations
        .map((item: ApiProduct) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          stock_quantity: item.stock_quantity,
          icon: getIconForProduct(item.name),
          popular: false,
          rating: "",
        }));

      setRecommendationProducts(recommendationItems);
    } catch (error) {
      console.error("Failed to fetch recommendation products:", error);
    }
  }, [apiCall, getIconForProduct]);

  // Refresh handler (improved)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setError(null);
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
    setHasLoadedRecommendations(false);

    Promise.allSettled([
      fetchFeaturedItems(),
      fetchUserData(),
      fetchRecommendations(),
    ]).finally(() => {
      setTimeout(() => {
        setRefreshing(false);
        setCurrentFactIndex(Math.floor(Math.random() * COFFEE_FACTS.length));
      }, 1500);
    });
  }, [fetchFeaturedItems, fetchUserData, fetchRecommendations, fadeAnim, slideAnim, setError]);

  // Animation effects
  useEffect(() => {
    const timer = setTimeout(startInitialAnimations, 100);
    return () => clearTimeout(timer);
  }, [startInitialAnimations]);

  useEffect(() => {
    return startPulseAnimation();
  }, [startPulseAnimation]);

  // Time update effect
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  // Coffee fact rotation effect (improved)
  useEffect(() => {
    const factInterval = setInterval(() => {
      if (isAnimating) return;

      setIsAnimating(true);
      animateFactTransition(() => {
        setCurrentFactIndex((prev) => (prev + 1) % COFFEE_FACTS.length);
        setIsAnimating(false);
      });
    }, 15000); // Longer interval for better UX

    return () => clearInterval(factInterval);
  }, [isAnimating, animateFactTransition]);

  // Initial data loading
  useEffect(() => {
    fetchFeaturedItems();
    fetchUserData();
    
    // Load recommendations after a delay
    const recommendationTimer = setTimeout(() => {
      fetchRecommendations();
    }, 1000);

    return () => clearTimeout(recommendationTimer);
  }, []);

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Navigation bar component (memoized)
  const NavBar = React.memo(() => (
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
            <Text style={styles.navSubtitle}>{greeting}, {userName}</Text>
          </View>
        </View>
        <View style={styles.navRight}>
          <Pressable
            style={styles.profileButton}
            android_ripple={{ color: "#78350f20" }}
            onPress={() => router.push("/profile")}
            accessibilityLabel="Open profile"
          >
            <Ionicons name="person-circle" size={28} color="#78350f" />
          </Pressable>
        </View>
      </View>
    </>
  ));

  // Hero section component (memoized)
  const HeroSection = React.memo(() => (
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
          <Text style={styles.heroGreeting}>{greeting}</Text>
          <Text style={styles.heroMainTitle}>Ready for some coffee?</Text>
          <Text style={styles.heroSubtitle}>{currentQuote}</Text>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              style={styles.ctaButton}
              onPress={() => router.push("/order")}
              android_ripple={{ color: "#78350f30" }}
              accessibilityLabel="Order coffee now"
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
  ));

  // Stats section component (memoized)
  const StatsSection = React.memo(() => (
    <View style={styles.statsSection}>
      <Pressable 
        style={styles.statCard}
        onPress={() => router.push("/history")}
        android_ripple={{ color: "#78350f10" }}
      >
        <Ionicons name="receipt" size={24} color="#78350f" />
        <Text style={styles.statNumber}>{userStats.totalOrders}</Text>
        <Text style={styles.statLabel}>Orders</Text>
      </Pressable>
      
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
  ));

  // Quick actions component (improved with better layout)
  const QuickActions = React.memo(() => {
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
        color: "#724204ff",
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
              ]}
              onPress={() => router.push(action.route)}
              android_ripple={{
                color: action.primary ? "#ffffff30" : "#78350f20",
              }}
              accessibilityLabel={`${action.title}: ${action.description}`}
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
  });

  // Featured items component (improved with better performance)
  const FeaturedItems = React.memo(() => (
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
          removeClippedSubviews={true}
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
                onPress={() => router.push("/order")}
                accessibilityLabel={`${item.name} - R${item.price.toFixed(2)}`}
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

                {item.stock_quantity !== undefined && item.stock_quantity < 5 && (
                  <View style={styles.lowStockBadge}>
                    <Text style={styles.lowStockText}>Low Stock</Text>
                  </View>
                )}

                <Text style={styles.featuredItemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.featuredItemPrice}>R{item.price.toFixed(2)}</Text>

                
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  ));

  // Recommendations section (improved)
  const RecommendationsSection = React.memo(() => {
    if (!recommendations && !recommendationsLoading) return null;

    return (
      <View style={styles.recommendationsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.recommendationHeaderLeft}>
            <Ionicons name="sparkles" size={20} color="#78350f" />
            <Text style={styles.sectionTitle}>Recommended for You</Text>
          </View>
          {recommendations && (
            <View >
             
            </View>
          )}
        </View>

        {recommendationsLoading ? (
          <View style={styles.loadingContainer}>
            <CoffeeLoading visible={recommendationsLoading} />
          </View>
        ) : recommendations ? (
          <>
            

            {/* Recommended Products */}
            {recommendationProducts.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.recommendationScroll}
                contentContainerStyle={styles.recommendationScrollContent}
                removeClippedSubviews={true}
              >
                {recommendationProducts.map((item) => (
                  <View
                    key={item.id}
                    style={styles.recommendationCard}
                  >
                    <Pressable
                      style={styles.recommendationCardContent}
                      android_ripple={{ color: "#78350f20" }}
                      onPress={() => router.push("/order")}
                      accessibilityLabel={`Recommended: ${item.name} - R${item.price.toFixed(2)}`}
                    >
                      <View style={styles.recommendationIconContainer}>
                        <Ionicons
                          name={item.icon as IoniconName}
                          size={28}
                          color="#78350f"
                        />
                      </View>

                      <View style={styles.sparkleIndicator}>
                        <Ionicons name="sparkles" size={12} color="#f59e0b" />
                      </View>

                      <Text style={styles.recommendationItemName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.recommendationItemPrice}>
                        R{item.price.toFixed(2)}
                      </Text>

                      
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noRecommendationsContainer}>
                <Ionicons name="cafe-outline" size={32} color="#9ca3af" />
                <Text style={styles.noRecommendationsText}>
                  No matching products found for current recommendations
                </Text>
                <Pressable
                  style={styles.browseMenuBtn}
                  onPress={() => router.push("/order")}
                  android_ripple={{ color: "#78350f20" }}
                  accessibilityLabel="Browse full menu"
                >
                  <Text style={styles.browseMenuText}>Browse Full Menu</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : null}
      </View>
    );
  });

  // Coffee fact card (memoized)
  const CoffeeFactCard = React.memo(() => (
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
          {COFFEE_FACTS[currentFactIndex]}
        </Animated.Text>
      </LinearGradient>
    </View>
  ));

  // Error boundary component
  const ErrorDisplay = React.memo(() => {
    if (!apiError) return null;

    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={24} color="#ef4444" />
        <Text style={styles.errorText}>Unable to load some content</Text>
        <Pressable
          style={styles.retryButton}
          onPress={onRefresh}
          android_ripple={{ color: "#78350f20" }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  });

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
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#78350f']}
              tintColor="#78350f"
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
        >
          <ErrorDisplay />
          <HeroSection />
          <StatsSection />
          <QuickActions />
          <RecommendationsSection />
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
    marginLeft: 4,
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

  // Recommendations Section
  recommendationsSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  recommendationHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  recommendationInfo: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  reasoningText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    lineHeight: 20,
  },
  weatherInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
  },
  recommendationScroll: {
    overflow: "visible",
  },
  recommendationScrollContent: {
    paddingRight: 0,
  },
  recommendationCard: {
    marginRight: 12,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  recommendationCardContent: {
    backgroundColor: "#fff",
    width: 150,
    padding: 14,
    paddingBottom: 20,
    alignItems: "center",
    position: "relative",
  },
  recommendationIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 6,
    elevation: 2,
  },
  sparkleIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fef3c7",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  recommendationItemName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#78350f",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 16,
  },
  recommendationItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#78350f",
    marginBottom: 10,
  },
  recommendationAddBtn: {
    backgroundColor: "#78350f",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  noRecommendationsContainer: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
  },
  noRecommendationsText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 20,
  },
  browseMenuBtn: {
    backgroundColor: "#78350f",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  browseMenuText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
  lowStockBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  lowStockText: {
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

  // Error handling
  errorContainer: {
    backgroundColor: "#fef2f2",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    flex: 1,
    marginLeft: 12,
  },
  retryButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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