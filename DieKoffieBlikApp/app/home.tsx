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
  score?: number; // Add score for recommendations
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
  totalSpent: number;
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
  scores?: { [productId: string]: number };
  target_time?: string;
  weekday?: string;
  time_period?: string;
}

type IoniconName = keyof typeof Ionicons.glyphMap;

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

// Memoized constants
const PRETORIA_COORDINATES = { latitude: -25.7479, longitude: 28.2293 };
const API_BASE_URL = "https://api.diekoffieblik.co.za";

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
];

// FIXED: Simple cache to prevent duplicate API calls
const apiCache = new Map();
const CACHE_DURATION = 60000; // 1 minute cache

// Custom hook for managing API state with caching
const useApiData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async (url: string, options?: RequestInit) => {
    // Check cache first
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    const cached = apiCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached data for:', url);
      return cached.data;
    }

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

      const data = await response.json();
      
      // Cache the result
      apiCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
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
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({ 
    totalOrders: 0, 
    loyaltyPoints: 0, 
    currentStreak: 0,
    totalSpent: 0
  });
  const [userName, setUserName] = useState("Coffee Lover");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Recommendation state
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [recommendationProducts, setRecommendationProducts] = useState<FeaturedItem[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

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
    [refreshing]
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

  // Helper function to convert recommendation score into meaningful text
  const getRecommendationReason = useCallback((score: number, recommendations: Recommendation | null) => {
    // High confidence recommendations (score > 0.8)
    if (score > 0.8) {
      return "Perfect for you";
    }
    
    // Good recommendations (score > 0.6)
    if (score > 0.6) {
      // Use weather context if available
      if (recommendations?.weather) {
        const temp = recommendations.weather.temperature;
        if (temp < 15) {
          return "Great for cold weather";
        } else if (temp > 25) {
          return "Perfect for hot days";
        }
      }
      
      // Use time context
      if (recommendations?.time_period) {
        const timePeriod = recommendations.time_period.toLowerCase();
        if (timePeriod.includes("morning")) {
          return "Morning favorite";
        } else if (timePeriod.includes("afternoon")) {
          return "Afternoon pick-me-up";
        } else if (timePeriod.includes("evening")) {
          return "Evening treat";
        }
      }
      
      return "Highly recommended";
    }
    
    // Moderate recommendations (score > 0.4)
    if (score > 0.4) {
      return "Worth trying";
    }
    
    // Lower confidence
    return "Suggested for you";
  }, []);

  // Calculate streak from orders
  const calculateStreak = useCallback((orders: Order[]) => {
    try {
      if (orders.length === 0) return 0;
      
      const completedOrders = orders
        .filter(order => order.status.toLowerCase() === 'completed')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (completedOrders.length === 0) return 0;

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const orderDates = new Set(
        completedOrders.map(order => {
          const date = new Date(order.created_at);
          return date.toDateString();
        })
      );

      let currentDate = new Date(today);
      const latestOrder = new Date(completedOrders[0].created_at);
      latestOrder.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - latestOrder.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 1) return 0;
      if (daysDiff === 1) currentDate.setDate(currentDate.getDate() - 1);

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

  // FIXED: Fetch user profile data from the correct API endpoint
  const fetchUserProfile = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) {
        console.log('No user ID found');
        return null;
      }

      console.log('Fetching user profile for ID:', userId);
      
      const profileData = await apiCall(`${API_BASE_URL}/user/${userId}`);
      
      if (profileData.success && profileData.profile) {
        console.log('User profile loaded:', profileData.profile);
        setUserProfile(profileData.profile);
        setUserName(profileData.profile.display_name || "Coffee Lover");
        
        // Set correct user stats from profile
        setUserStats({
          totalOrders: profileData.profile.total_orders,
          loyaltyPoints: profileData.profile.loyalty_points,
          currentStreak: 0, // Will be calculated from orders
          totalSpent: profileData.profile.total_spent
        });
        
        return profileData.profile;
      } else {
        console.error('Failed to fetch user profile:', profileData);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, [apiCall]);

  // FIXED: Updated data fetch function to use user profile API and correct orders endpoint
  const fetchAllData = useCallback(async () => {
    if (dataLoaded && !refreshing) return;
    
    try {
      setFeaturedLoading(true);
      
      const userEmail = await AsyncStorage.getItem("email");
      const userId = await AsyncStorage.getItem("user_id");
      
      if (!userEmail || !userId) {
        console.log('Missing user credentials');
        setFeaturedLoading(false);
        return;
      }

      console.log('Fetching data for user ID:', userId);

      // Fetch user profile first to get correct stats
      const profile = await fetchUserProfile();
      
      // Get products
      const productsResponse = await apiCall(`${API_BASE_URL}/product`);
      
      // FIXED: Use the correct GET /order endpoint
      const ordersData = await apiCall(`${API_BASE_URL}/order`);
      
      // Handle products
      if (productsResponse) {
         const products = productsResponse.products;
        console.log('Products loaded:', products.length, products.slice(0, 2)); 
        setAllProducts(products);

        // Create featured items (first 6 products)
        const featuredProducts: FeaturedItem[] = products
          .slice(0, 6)
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

        setFeaturedItems(featuredProducts);
      }

      // FIXED: Handle orders from the correct endpoint and calculate streak
      if (ordersData && ordersData.orders) {
        const orders = ordersData.orders;
        console.log('User orders loaded:', orders.length);
        console.log('Total orders from API:', ordersData.count);
        
        const currentStreak = calculateStreak(orders);

        // Update stats with actual order count from API and calculated streak
        setUserStats(prevStats => ({
          ...prevStats,
          totalOrders: ordersData.count, // Use the count from API response
          currentStreak: currentStreak,
        }));
      } else {
        console.error('Failed to fetch orders or no orders data');
      }

      setDataLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setFeaturedLoading(false);
    }
  }, [apiCall, calculateStreak, getIconForProduct, dataLoaded, refreshing, fetchUserProfile]);

  // Recommendations fetch
  const fetchRecommendations = useCallback(async () => {
    if (!dataLoaded || recommendationsLoading || recommendations) return;
    
    try {
      setRecommendationsLoading(true);
      
      console.log('Fetching recommendations...');
      
      const data = await apiCall(
        `${API_BASE_URL}/user/recommendation?lat=${PRETORIA_COORDINATES.latitude}&lon=${PRETORIA_COORDINATES.longitude}`
      );
      
      console.log('Recommendations response:', data);
      
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
        
        if (data.recommendations.suggestions && allProducts.length > 0) {
          const suggestedProductIds = data.recommendations.suggestions;
          console.log('Suggested product IDs:', suggestedProductIds);
          
          const matchedProducts = allProducts.filter((product: ApiProduct) => {
            const isMatch = suggestedProductIds.includes(product.id);
            if (isMatch) {
              console.log(`✅ Matched product: ${product.name} (${product.id})`);
            }
            return isMatch;
          });

          console.log('Total matched products:', matchedProducts.length);

          const sortedProducts = matchedProducts.sort((a, b) => {
            const scoreA = data.recommendations.scores?.[a.id] || 0;
            const scoreB = data.recommendations.scores?.[b.id] || 0;
            return scoreB - scoreA;
          });

          const recommendationItems: FeaturedItem[] = sortedProducts
            .slice(0, 4)
            .map((item: ApiProduct) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              description: item.description,
              stock_quantity: item.stock_quantity,
              icon: getIconForProduct(item.name),
              popular: false,
              rating: "",
              score: data.recommendations.scores?.[item.id] || 0,
            }));

          console.log('Final recommendation items:', recommendationItems.length, recommendationItems.map(i => i.name));
          setRecommendationProducts(recommendationItems);
        }
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setRecommendationsLoading(false);
    }
  }, [apiCall, dataLoaded, recommendationsLoading, recommendations, allProducts, getIconForProduct]);

  // FIXED: Optimized refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setError(null);
    setDataLoaded(false);
    setRecommendations(null);
    setRecommendationProducts([]);
    setUserProfile(null);
    
    // Clear cache on refresh
    apiCache.clear();

    fetchAllData().finally(() => {
      setTimeout(() => {
        setRefreshing(false);
        setCurrentFactIndex(Math.floor(Math.random() * COFFEE_FACTS.length));
      }, 1000);
    });
  }, [fetchAllData, setError]);

  // Effects
  useEffect(() => {
    startInitialAnimations();
  }, []);

  useEffect(() => {
    return startPulseAnimation();
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (dataLoaded && allProducts.length > 0) {
      const timer = setTimeout(() => {
        fetchRecommendations();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [dataLoaded, allProducts.length]);

  // Time update effect
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 300000);

    return () => clearInterval(timeInterval);
  }, []);

  // Coffee fact rotation effect
  useEffect(() => {
    const factInterval = setInterval(() => {
      if (isAnimating) return;

      setIsAnimating(true);
      animateFactTransition(() => {
        setCurrentFactIndex((prev) => (prev + 1) % COFFEE_FACTS.length);
        setIsAnimating(false);
      });
    }, 20000);

    return () => clearInterval(factInterval);
  }, [isAnimating, animateFactTransition]);

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

  // FIXED: Stats section now shows correct data from user profile
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

  // Quick actions component
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

  // Featured items component
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
          {featuredItems.map((item) => (
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

  // Enhanced recommendations section with better info display
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
            <View style={[
              styles.confidenceBadge,
              { backgroundColor: getConfidenceColor(recommendations.confidence) }
            ]}>
              <Text style={styles.confidenceText}>{recommendations.confidence}</Text>
            </View>
          )}
        </View>

        {recommendationsLoading ? (
          <View style={styles.loadingContainer}>
            <CoffeeLoading visible={recommendationsLoading} />
            <Text style={styles.loadingText}>Getting personalized recommendations...</Text>
          </View>
        ) : recommendations ? (
          <>
            {/* Recommendation Info */}
            <View style={styles.recommendationInfo}>
              <Text style={styles.reasoningText}>{recommendations.reasoning}</Text>
              {recommendations.weather && (
                <View style={styles.weatherInfo}>
                  <Ionicons 
                    name={getWeatherIcon(recommendations.weather.weathercode)} 
                    size={16} 
                    color="#6b7280" 
                  />
                  <Text style={styles.weatherText}>
                    {recommendations.weather.temperature}°C • {recommendations.time_period} • {recommendations.weekday}
                  </Text>
                </View>
              )}
            </View>

            {/* Recommended Products */}
            {recommendationProducts.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.recommendationScroll}
                contentContainerStyle={styles.recommendationScrollContent}
                removeClippedSubviews={true}
              >
                {recommendationProducts.map((item, index) => (
                  <View key={item.id} style={styles.recommendationCard}>
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

                      {/* Recommendation reason indicator */}
                      {item.score && (
                        <View style={styles.recommendationBadge}>
                          <Text style={styles.recommendationText}>
                            {getRecommendationReason(item.score, recommendations)}
                          </Text>
                        </View>
                      )}

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
                  No matching products found for your preferences
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
  scoreIndicator: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#10b981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scoreText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  recommendationBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: 120,
  },
  recommendationText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
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
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#78350f",
    marginTop: 8,
    fontWeight: "500",
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