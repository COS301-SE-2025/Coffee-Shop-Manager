import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Animated,
  ScrollView,
  Dimensions,
  Alert,
  SafeAreaView,
  Platform,
  TextInput,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CoffeeBackground from "../assets/coffee-background";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CoffeeLoading from "../assets/loading";

const API_BASE_URL = "https://api.diekoffieblik.co.za"

const { width, height } = Dimensions.get("window");

const menuCategories = [
  { id: "hot", name: "Hot Coffee", icon: "cafe", color: "#dc2626" },
  { id: "cold", name: "Cold Drinks", icon: "snow", color: "#2563eb" },
  { id: "pastry", name: "Pastries", icon: "restaurant", color: "#d97706" },
  { id: "special", name: "Specials", icon: "star", color: "#7c3aed" },
];

// Barebones category defaults
const categoryDefaults = {
  hot: {
    category: "hot",
    image: "cafe",
    prepTime: "4-6 min",
    calories: 100,
    tags: ["Hot", "Fresh"],
    rating: 4.5,
    reviews: 120,
    popular: false,
  },
  cold: {
    category: "cold",
    image: "snow-outline",
    prepTime: "2-4 min",
    calories: 80,
    tags: ["Cold", "Refreshing"],
    rating: 4.3,
    reviews: 80,
    popular: false,
  },
  pastry: {
    category: "pastry",
    image: "restaurant-outline",
    prepTime: "1-2 min",
    calories: 200,
    tags: ["Fresh", "Baked"],
    rating: 4.2,
    reviews: 40,
    popular: false,
  },
  special: {
    category: "special",
    image: "star",
    prepTime: "5-8 min",
    calories: 50,
    tags: ["Premium", "Signature"],
    rating: 4.8,
    reviews: 150,
    popular: true,
  },
};

// Simple category detection based on name
const detectCategory = (itemName: string): string => {
  const name = itemName.toLowerCase();
  
  // Cold drinks keywords
  if (name.includes("iced") || name.includes("cold") || name.includes("frappe")) {
    return "cold";
  }
  
  // Pastry keywords
  if (name.includes("muffin") || name.includes("croissant") || name.includes("cake") || name.includes("pastry")) {
    return "pastry";
  }
  
  // Special keywords
  if (name.includes("signature") || name.includes("premium") || name.includes("special") || name.includes("blend")) {
    return "special";
  }
  
  // Default to hot
  return "hot";
};

// Enhancement function
const enhanceMenuItem = (apiItem: any) => {
  const category = detectCategory(apiItem.name);
  const defaults = categoryDefaults[category as keyof typeof categoryDefaults];
  
  return {
    ...apiItem,
    id: apiItem.id,
    name: apiItem.name,
    price: apiItem.price,
    description: apiItem.description,
    stock: apiItem.stock_quantity,
    // Add enhanced properties
    ...defaults,
  };
};

interface CartItem {
  [key: string]: number;
}

export default function OrderScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem>({});
  const [selectedCategory, setSelectedCategory] = useState("hot");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sortByPrice, setSortByPrice] = useState('none');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add flatListRef to control scrolling
  const flatListRef = React.useRef<FlatList>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      setError(null);

      const accessToken = await AsyncStorage.getItem("access_token");
      console.log("Access token: " + accessToken);
      if (!accessToken) {
        console.log("No access token found, redirecting to login");
        router.navigate("/login");
        setError("Please log in to view the menu");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/product`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log(response);

        if (!response.ok) throw new Error("Failed to fetch menu items");

        const data = await response.json();
        const enhancedItems = data.map(enhanceMenuItem);
        setMenuItems(enhancedItems);
      } catch (err) {
        console.error(err);
        setError("Failed to load menu items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    let items = menuItems.filter((item) => item.category === selectedCategory);

    if (searchQuery.trim()) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Apply sorting
    return items.sort((a, b) => {
      // First sort by price if selected
      if (sortByPrice === 'low-to-high') {
        if (a.price !== b.price) return a.price - b.price;
      } else if (sortByPrice === 'high-to-low') {
        if (a.price !== b.price) return b.price - a.price;
      }
      
      // Then by popularity and rating (existing logic)
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return b.rating - a.rating;
    });
  }, [selectedCategory, searchQuery, sortByPrice, menuItems]);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((sum, count) => sum + count, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      Object.entries(cart).reduce((total, [itemId, count]) => {
        const item = menuItems.find((item) => item.id === itemId);
        return total + (item ? item.price * count : 0);
      }, 0),
    [cart, menuItems]
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Reset scroll position when category or search changes
  useEffect(() => {
    if (flatListRef.current && filteredItems.length > 0) {
      // Use a small delay to ensure the list has rendered
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [selectedCategory, searchQuery]);

  const addToCart = useCallback((itemId: string) => {
    if (Platform.OS === "ios") {
      Vibration.vibrate(50);
    }

    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  }, []);

  const goToCheckout = useCallback(() => {
    if (cartCount === 0) {
      Alert.alert(
        "Empty Cart 🛒",
        "Add some delicious items to your cart first!",
        [{ text: "Got it!", style: "default" }]
      );
      return;
    }

    router.push({
      pathname: "/checkout",
      params: { cart: JSON.stringify(cart) },
    });
  }, [cartCount, cart, router]);

  const CategorySelector = React.memo(() => (
    <View style={styles.categoryWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {menuCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.categoryIconContainer,
                selectedCategory === category.id && {
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
              ]}
            >
              <Ionicons
                name={category.icon as any}
                size={18}
                color={selectedCategory === category.id ? "#fff" : "#78350f"}
              />
            </View>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  ));

  const SortSelector = React.memo(() => (
    <View style={styles.sortContainer}>
      <Text style={styles.sortLabel}>Sort by:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'none', label: 'Popular', icon: 'star' as const },
          { key: 'low-to-high', label: 'Price ↑', icon: 'arrow-up' as const },
          { key: 'high-to-low', label: 'Price ↓', icon: 'arrow-down' as const },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortOption,
              sortByPrice === option.key && styles.sortOptionActive,
            ]}
            onPress={() => setSortByPrice(option.key)}
          >
            <Ionicons
              name={option.icon}
              size={14}
              color={sortByPrice === option.key ? '#fff' : '#78350f'}
            />
            <Text
              style={[
                styles.sortOptionText,
                sortByPrice === option.key && styles.sortOptionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  ));

  const renderStars = useCallback((rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Ionicons key={i} name="star" size={12} color="#f59e0b" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={12} color="#f59e0b" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={12} color="#d1d5db" />
        );
      }
    }
    return stars;
  }, []);

  const MenuItem = React.memo(({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.itemImageContainer}>
          <Ionicons name={item.image as any} size={32} color="#78350f" />
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.itemPrice}>R {item.price}</Text>
          </View>

          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.cartControls}>
          {cart[item.id] ? (
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => removeFromCart(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={16} color="#78350f" />
              </TouchableOpacity>

              <Text style={styles.quantityText}>{cart[item.id]}</Text>

              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  item.stock === 0 && styles.disabledButton
                ]}
                onPress={() => item.stock > 0 && addToCart(item.id)}
                activeOpacity={item.stock > 0 ? 0.7 : 0.3}
                disabled={item.stock === 0}
              >
                <Ionicons name="add" size={16} color={item.stock > 0 ? "#78350f" : "#cbd5e1"} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.addButton,
                item.stock === 0 && styles.disabledButton
              ]}
              onPress={() => item.stock > 0 && addToCart(item.id)}
              activeOpacity={item.stock > 0 ? 0.8 : 0.3}
              disabled={item.stock === 0}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  ));

  const FloatingCart = () =>
    cartCount > 0 && (
      <View style={styles.floatingCart}>
        <TouchableOpacity
          style={styles.floatingCartContent}
          onPress={goToCheckout}
          activeOpacity={0.9}
        >
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemCount}>
              {cartCount} item{cartCount > 1 ? "s" : ""}
            </Text>
            <Text style={styles.cartTotal}>R{cartTotal}</Text>
          </View>
          <View style={styles.checkoutIconContainer}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    );

  // Loading and error states
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CoffeeBackground>
          <View style={styles.centerContainer}>
            <CoffeeLoading visible={loading} />
          </View>
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading menu...</Text>
          </View>
        </CoffeeBackground>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <CoffeeBackground>
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                // Trigger refetch
                const fetchMenuItems = async () => {
                  try {
                    setLoading(true);
                    console.log(process.env.IP)
                    const response = await fetch(`http://${process.env.IP}/product`);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const apiData = await response.json();
                    const enhancedItems = apiData.map(enhanceMenuItem);
                    setMenuItems(enhancedItems);
                  } catch (err) {
                    setError('Failed to load menu items. Please try again.');
                  } finally {
                    setLoading(false);
                  }
                };
                fetchMenuItems();
              }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </CoffeeBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CoffeeBackground>
        <StatusBar barStyle="light-content" backgroundColor="#78350f" />

        {/* Fixed Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Order Coffee</Text>
            <Text style={styles.headerSubtitle}>
              {filteredItems.length} items available
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons
              name={showSearch ? "close" : "search"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Fixed Search Bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search drinks..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            <Ionicons
              name="search"
              size={20}
              color="#94a3b8"
              style={styles.searchIcon}
            />
          </View>
        )}

        {/* Fixed Categories */}
        <CategorySelector />

        {/* Fixed Sort Options */}
        <SortSelector />

        {/* Menu Items with fixed content area */}
        <View style={styles.contentArea}>
          <FlatList
            ref={flatListRef}
            data={filteredItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.list,
              filteredItems.length === 0 && styles.emptyList
            ]}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <MenuItem item={item} />}
            removeClippedSubviews={false}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={8}
            getItemLayout={(data, index) => ({
              length: 140, // Fixed item height
              offset: 140 * index + (index > 0 ? 16 * index : 0), // Account for margins
              index,
            })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="cafe-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>No items found</Text>
              </View>
            }
          />
        </View>

        {/* Floating Cart */}
        <FloatingCart />
      </CoffeeBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  // Loading and Error States
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: "#78350f",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 16,
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#78350f",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Header Styles - Fixed positioning
  header: {
    backgroundColor: "#78350f",
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 30,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    position: "relative",
    zIndex: 1000,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },

  // Search Styles - Fixed positioning
  searchContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    zIndex: 999,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingLeft: 40,
    color: "#334155",
  },
  searchIcon: {
    position: "absolute",
    left: 28,
  },

  // Category Styles - Fixed positioning
  categoryWrapper: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    position: "relative",
    zIndex: 998,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#f8fafc",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minWidth: 120,
    height: 48,
  },
  categoryButtonActive: {
    backgroundColor: "#78350f",
    borderColor: "transparent",
  },
  categoryIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(120, 53, 15, 0.1)",
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#fff",
  },

  // Sort Styles - Fixed positioning
  sortContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    position: "relative",
    zIndex: 997,
  },
  sortLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginRight: 12,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sortOptionActive: {
    backgroundColor: '#78350f',
    borderColor: 'transparent',
  },
  sortOptionText: {
    fontSize: 12,
    color: '#78350f',
    fontWeight: '500',
    marginLeft: 4,
  },
  sortOptionTextActive: {
    color: '#fff',
  },

  // Content Area - Flexible space for list
  contentArea: {
    flex: 1,
    position: "relative",
  },

  // List Styles - Updated for consistent layout
  list: {
    padding: 20,
    paddingBottom: 120,
    flexGrow: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    minHeight: 200,
  },
  emptyText: {
    marginTop: 16,
    color: "#94a3b8",
    fontSize: 16,
  },

  // Card Styles - Fixed height for consistency
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
    minHeight: 124, // Fixed minimum height
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
    minHeight: 108, // Fixed content height
  },
  itemImageContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#fef7ed",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
    justifyContent: "space-between",
    minHeight: 76, // Ensure consistent spacing
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  itemDescription: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 8,
    height: 36, // Fixed height for 2 lines
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    height: 20, // Fixed height
  },
  tag: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    height: 18,
    justifyContent: "center",
  },
  tagText: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "500",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#78350f",
    flexShrink: 0,
  },

  // Cart Control Styles - Fixed positioning
  cartControls: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    flexShrink: 0,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    width: 100,
    justifyContent: "space-between",
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  quantityText: {
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#78350f",
    minWidth: 20,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#78350f",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#78350f",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: "#cbd5e1",
    shadowOpacity: 0.1,
  },

  // Floating Cart Styles - Fixed positioning
  floatingCart: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  floatingCartContent: {
    backgroundColor: "#78350f",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 8,
    shadowColor: "#78350f",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  cartInfo: {
    flex: 1,
  },
  cartItemCount: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "500",
  },
  cartTotal: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  checkoutIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});