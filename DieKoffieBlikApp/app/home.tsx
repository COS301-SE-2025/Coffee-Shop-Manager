import React, { useState, useEffect, useRef } from 'react';
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
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CoffeeBackground from "../assets/coffee-background";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CoffeeLoading from '../assets/loading';

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

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollY = useRef(new Animated.Value(0)).current;
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const API_BASE_URL = "http://192.168.101.124:5000";

  const coffeeQuotes = [
    "Life begins after coffee ☕",
    "But first, coffee ✨",
    "Espresso yourself! 💫",
    "Coffee is my love language ❤️"
  ];

  
const coffeeFacts = [
  "The word 'coffee' comes from the Arabic word 'qahwa' 🌍",
  "Espresso has less caffeine than drip coffee per cup! ⚡",
  "Coffee was first discovered by goats in Ethiopia 🐐",
  "Finland consumes the most coffee per capita globally 🇫🇮",
  "Coffee beans are actually seeds, not beans! 🌱",
  "The most expensive coffee comes from elephant dung 🐘",
  "Brazil is the largest producer of coffee in the world 🇧🇷",
  "Decaf coffee still contains small amounts of caffeine ☕",
  "Coffee is the second most traded commodity after oil 🛢️",
  "Cold brew coffee is less acidic than hot brewed coffee ❄️",
  "Adding milk to coffee can slow down the effects of caffeine 🥛",
  "Instant coffee was invented in 1901 by Japanese scientist Satori Kato ⏱️",
  "A typical coffee tree can live up to 100 years 🌳",
  "There are two main coffee species: Arabica and Robusta 🌿",
  "Drinking coffee may help improve memory and alertness 🧠",
  "Turkey has one of the oldest coffee brewing methods: Turkish coffee 🇹🇷",
  "The world’s largest cup of coffee was over 22,000 liters in South Korea ☕",
  "Coffee cherries turn bright red when they are ripe for picking 🍒",
  "The first webcam was invented at Cambridge University to monitor a coffee pot 🎥",
  "Beethoven was obsessed with coffee and counted 60 beans per cup he drank 🎼",
  "Coffee was banned in Mecca in the 16th century because of its stimulating effect 🚫",
  "New Yorkers drink seven times more coffee than people in other U.S. cities 🗽",
  "The word 'cappuccino' comes from the brown robes worn by Capuchin monks 🤎",
  "Coffee was originally chewed, not sipped, by mixing ground beans with fat 🥩",
  "Italy has over 150,000 coffee bars across the country 🇮🇹",
  "Luwak coffee, made from civet droppings, is one of the priciest coffees 🐾",
  "Coffee plants can grow up to 30 feet tall in the wild 🌴",
  "The Boston Tea Party helped popularize coffee in the United States 🇺🇸",
  "Dark roast coffee has less caffeine than light roast coffee due to roasting 🔥",
  "Coffee houses were called 'penny universities' in 17th century England 🎓",
  "Coffee grounds can be used as natural fertilizer and insect repellent 🌾",
  "Hawaii is the only U.S. state that grows coffee commercially 🌺",
  "Coffee was first brought to Europe through Venice in the 1600s 🚢",
  "A single coffee tree yields about one pound of roasted coffee per year 📦",
  "Norway ranks among the highest consumers of coffee per capita in the world 🇳🇴",
  "Caffeine is a natural pesticide produced by the coffee plant 🐛",
  "The Americano was created by soldiers in WWII diluting espresso with water 💧",
  "In Japan, there are coffee spas where you can literally bathe in coffee 🛁",
  "Coffee is believed to have originated around the 9th century in Ethiopia ⏳",
  "The average barista makes about 200 cups of coffee per day ☕",
  "Coffee drinkers tend to live longer according to several studies ⌛",
  "The largest coffee-producing continent is South America 🌎",
  "Coffee foam (crema) is a sign of freshness and quality in espresso 💨",
  "Coffee can enhance physical performance by increasing adrenaline levels 🏃‍♂️",
  "Black coffee contains almost zero calories, making it diet-friendly 🥤",
  "The smell of coffee alone can help reduce stress and improve alertness 😌",
  "Vietnam is the world’s second-largest coffee producer 🇻🇳",
  "Coffee beans are roasted at temperatures between 370°F and 540°F (188°C–282°C) 🌡️",
  "There are over 25 million coffee farmers around the world 🌍"
];


  // const featuredItems = [
  //   { 
  //     name: "Signature Cappuccino", 
  //     price: "R45", 
  //     icon: "cafe-outline" as const, 
  //     popular: true
  //   },
  //   { 
  //     name: "Double Espresso", 
  //     price: "R35", 
  //     icon: "flash-outline" as const, 
  //     popular: false
  //   },
  //   { 
  //     name: "Vanilla Latte", 
  //     price: "R50", 
  //     icon: "heart-outline" as const, 
  //     popular: true
  //   },
  //   { 
  //     name: "Iced Americano", 
  //     price: "R40", 
  //     icon: "snow-outline" as const, 
  //     popular: false
  //   }
  // ];

  const FeaturedItems = () => (
    <View style={styles.featuredSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Items</Text>
        <Pressable onPress={() => router.push('/order')}>
          <Text style={styles.seeAllText}>See All</Text>
        </Pressable>
      </View>
      
      {featuredLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.featuredScroll}
        contentContainerStyle={styles.featuredScrollContent}
      >
        {featuredItems.map((item, index) => (
          <Pressable 
            key={item.id} 
            style={styles.featuredCard}
            android_ripple={{ color: '#78350f20' }}
          >
            
            <View style={styles.featuredIconContainer}>
              <Ionicons name={item.icon as any} size={32} color="#78350f" />
            </View>
            
            <Text style={styles.featuredItemName}>{item.name}</Text>
            
            <Text style={styles.featuredItemPrice}>R{item.price}</Text>
            
            <Pressable 
              style={styles.addToCartBtn}
              android_ripple={{ color: '#ffffff30' }}
            >
              <Ionicons name="add" size={16} color="#fff" />
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
      )}
    </View>
  );

  // Removed profile quick action as requested
  const quickActions = [
    { 
      title: "Order Coffee", 
      icon: "cart" as const, 
      route: "/order", 
      primary: true,
      description: "Browse menu & order"
    },
    { 
      title: "Order History", 
      icon: "time" as const, 
      route: "/history", 
      primary: false,
      description: "View past orders"
    },
    { 
      title: "Favourites", 
      icon: "heart" as const, 
      route: "/favourites", 
      primary: false,
      description: "Saved items"
    }
  ];

  useEffect(() => {
    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Rotate coffee facts every 5 seconds
    const factInterval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % coffeeFacts.length);
    }, 5000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(factInterval);
    };
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setCurrentFactIndex(Math.floor(Math.random() * coffeeFacts.length));
    }, 2000);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const NavBar = () => (
    <>
      <Animated.View style={[styles.navbarBackground, { opacity: headerOpacity }]} />
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <View style={styles.logoContainer}>
            <Ionicons name="cafe" size={28} color="#78350f" />
          </View>
          <View>
            <Text style={styles.navTitle}>DieKoffieBlik</Text>
            <Text style={styles.navSubtitle}>{getGreeting()}</Text>
          </View>
        </View>
        <View style={styles.navRight}>
          <Pressable style={styles.navButton} android_ripple={{ color: '#78350f20' }}>
            <Ionicons name="search" size={22} color="#78350f" />
          </Pressable>
          <Pressable 
            style={styles.navButton} 
            android_ripple={{ color: '#78350f20' }}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color="#78350f" />
            {/* <View style={styles.notificationBadge} />       only when new notifications */}
          </Pressable>

          {/* Added profile icon as requested */}
          <Pressable 
            style={styles.profileButton} 
            android_ripple={{ color: '#78350f20' }}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-circle" size={28} color="#78350f" />
          </Pressable>
        </View>
      </View>
    </>
  );

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        if (!accessToken) return;

        const response = await fetch(`${API_BASE_URL}/product`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        
        // Take first 3 items and enhance them
        const firstThree: FeaturedItem[] = data.slice(0, 3).map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          stock_quantity: item.stock_quantity,
          icon: item.name.toLowerCase().includes('espresso') ? 'flash-outline' :
                item.name.toLowerCase().includes('latte') ? 'heart-outline' : 
                item.name.toLowerCase().includes('cappuccino') ? 'cafe-outline' :
                item.name.toLowerCase().includes('americano') ? 'snow-outline' : 'cafe-outline',
          popular: Math.random() > 0.5,
          rating: (4.2 + Math.random() * 0.6).toFixed(1)
        }));
        
        setFeaturedItems(firstThree);
      } catch (error) {
        console.error('Featured items error:', error);
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  const HeroSection = () => (
    <Animated.View 
      style={[
        styles.heroSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['#78350f', '#92400e']}
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
          <Pressable 
            style={styles.ctaButton}
            onPress={() => router.push('/order')}
            android_ripple={{ color: '#ffffff30' }}
          >
            <Ionicons name="cafe" size={20} color="#78350f" />
            <Text style={styles.ctaButtonText}>Order Now</Text>
          </Pressable>
        </View>
        <View style={styles.heroImageContainer}>
          <View style={styles.coffeeCupContainer}>
            <Animated.View 
              style={[
                styles.coffeeCupPlaceholder,
                {
                  transform: [{
                    rotate: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: ['0deg', '5deg'],
                    })
                  }]
                }
              ]}
            >
              <Ionicons name="cafe" size={60} color="#78350f" />
            </Animated.View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const QuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <Pressable 
            key={index}
            style={[
              styles.quickActionCard, 
              action.primary && styles.primaryAction
            ]}
            onPress={() => router.push(action.route)}
            android_ripple={{ 
              color: action.primary ? '#ffffff30' : '#78350f20' 
            }}
          >
            <View style={[
              styles.actionIconContainer,
              action.primary && styles.primaryIconContainer
            ]}>
              <Ionicons 
                name={action.icon} 
                size={24} 
                color={action.primary ? "#fff" : "#78350f"} 
              />
            </View>
            <Text style={[
              styles.quickActionText,
              action.primary && styles.quickActionTextPrimary
            ]}>
              {action.title}
            </Text>
            <Text style={[
              styles.quickActionDescription,
              action.primary && styles.quickActionDescriptionPrimary
            ]}>
              {action.description}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  // const FeaturedItems = () => (
  //   <View style={styles.featuredSection}>
  //     <View style={styles.sectionHeader}>
  //       <Text style={styles.sectionTitle}>Featured Items</Text>
  //       <Pressable 
  //         onPress={() => router.push('/order')}
  //         android_ripple={{ color: '#78350f20' }}
  //       >
  //         <Text style={styles.seeAllText}>See All</Text>
  //       </Pressable>
  //     </View>
  //     <ScrollView 
  //       horizontal 
  //       showsHorizontalScrollIndicator={false} 
  //       style={styles.featuredScroll}
  //       contentContainerStyle={styles.featuredScrollContent}
  //     >
  //       {featuredItems.map((item, index) => (
  //         <Pressable 
  //           key={index} 
  //           style={styles.featuredCard}
  //           android_ripple={{ color: '#78350f20' }}
  //         >
  //           <View style={styles.featuredIconContainer}>
  //             <Ionicons name={item.icon} size={32} color="#78350f" />
  //           </View>
            
  //           <Text style={styles.featuredItemName}>{item.name}</Text>
            
  //           <View style={styles.ratingContainer}>
  //             <Ionicons name="star" size={12} color="#f59e0b" />
  //           </View>
            
  //           <Text style={styles.featuredItemPrice}>{item.price}</Text>
            
  //           <Pressable 
  //             style={styles.addToCartBtn}
  //             android_ripple={{ color: '#ffffff30' }}
  //           >
  //             <Ionicons name="add" size={16} color="#fff" />
  //           </Pressable>
  //         </Pressable>
  //       ))}
  //     </ScrollView>
  //   </View>
  // );

  const CoffeeFactCard = () => (
    <Animated.View style={styles.factCard}>
      <View style={styles.factHeader}>
        <View style={styles.factIconContainer}>
          <Ionicons name="bulb" size={20} color="#f59e0b" />
        </View>
        <Text style={styles.factTitle}>Did You Know?</Text>
      </View>
      <Animated.Text 
        key={currentFactIndex}
        style={styles.factText}
      >
        {coffeeFacts[currentFactIndex]}
      </Animated.Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent 
      />

      {/* Background image or solid color */}
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
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <HeroSection />
          <QuickActions />
          <FeaturedItems />
          <CoffeeFactCard />
          
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Made with ❤️ and lots of ☕</Text>
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
    backgroundColor: '#fafafa',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Navigation Bar
  navbarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: '#fff',
    zIndex: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    zIndex: 2,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#78350f',
  },
  navSubtitle: {
    fontSize: 12,
    color: '#b45309',
    marginTop: 2,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#fff7ed',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  
  // Hero Section
  heroSection: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#78350f',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  heroGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  heroContent: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 14,
    color: '#fbbf24',
    marginBottom: 4,
    fontWeight: '500',
  },
  heroMainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#fed7aa',
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-start',
    elevation: 2,
  },
  ctaButtonText: {
    color: '#78350f',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  heroImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coffeeCupContainer: {
    position: 'relative',
  },
  coffeeCupPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  
  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#78350f',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#fff',
    width: CARD_WIDTH,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  primaryAction: {
    backgroundColor: '#78350f',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryIconContainer: {
    backgroundColor: '#92400e',
  },
  quickActionText: {
    fontSize: 14,
    color: '#78350f',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionTextPrimary: {
    color: '#fff',
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  quickActionDescriptionPrimary: {
    color: '#fed7aa',
  },
  
  // Featured Items
  featuredSection: {
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 32,
  },
  featuredScroll: {
    paddingRight: 20,
    overflow: 'visible',
  },
  featuredScrollContent: {
    paddingRight: 20,
  },
  featuredCard: {
    backgroundColor: '#fff',
    width: 160,
    padding: 16,
    paddingBottom: 24,
    borderRadius: 16,
    marginRight: 16,
    alignItems: 'center',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  popularBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  featuredIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  featuredItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78350f',
    textAlign: 'center',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 12,
  },
  addToCartBtn: {
    backgroundColor: '#78350f',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Coffee Fact Card
  factCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 32,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  factHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  factIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  factTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#78350f',
  },
  factText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    padding: 32,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#b45309',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
   loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#78350f',
    fontSize: 14,
  },
  ratingText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
    marginLeft: 3,
  },
});