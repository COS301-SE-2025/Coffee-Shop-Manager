import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Vibration
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const menuCategories = [
  { id: 'hot', name: 'Hot Coffee', icon: 'cafe', color: '#dc2626' },
  { id: 'cold', name: 'Cold Drinks', icon: 'snow', color: '#2563eb' },
  { id: 'pastry', name: 'Pastries', icon: 'restaurant', color: '#d97706' },
  { id: 'special', name: 'Specials', icon: 'star', color: '#7c3aed' },
];

const menuItems = [
  { 
    id: '1', 
    name: 'Americano', 
    price: 30, 
    category: 'hot',
    description: 'Rich espresso with hot water for a smooth, bold taste',
    rating: 4.5,
    reviews: 124,
    popular: false,
    image: 'cafe',
    prepTime: '3-5 min',
    calories: 10,
    tags: ['Strong', 'Classic']
  },
  { 
    id: '2', 
    name: 'Cappuccino', 
    price: 35, 
    category: 'hot',
    description: 'Perfect balance of espresso, steamed milk, and foam',
    rating: 4.8,
    reviews: 189,
    popular: true,
    image: 'cafe-outline',
    prepTime: '4-6 min',
    calories: 120,
    tags: ['Creamy', 'Popular']
  },
  { 
    id: '3', 
    name: 'Latte', 
    price: 32, 
    category: 'hot',
    description: 'Smooth espresso with perfectly steamed milk',
    rating: 4.6,
    reviews: 156,
    popular: true,
    image: 'heart',
    prepTime: '4-6 min',
    calories: 150,
    tags: ['Smooth', 'Mild']
  },
  { 
    id: '4', 
    name: 'Mocha', 
    price: 38, 
    category: 'hot',
    description: 'Decadent chocolate meets premium coffee',
    rating: 4.7,
    reviews: 67,
    popular: false,
    image: 'heart-outline',
    prepTime: '5-7 min',
    calories: 200,
    tags: ['Sweet', 'Chocolate']
  },
  { 
    id: '5', 
    name: 'Espresso', 
    price: 28, 
    category: 'hot',
    description: 'Pure, concentrated coffee perfection',
    rating: 4.4,
    reviews: 203,
    popular: false,
    image: 'flash',
    prepTime: '2-3 min',
    calories: 5,
    tags: ['Strong', 'Quick']
  },
  { 
    id: '6', 
    name: 'Iced Coffee', 
    price: 30, 
    category: 'cold',
    description: 'Refreshing cold brew served over ice',
    rating: 4.3,
    reviews: 78,
    popular: false,
    image: 'snow-outline',
    prepTime: '2-3 min',
    calories: 15,
    tags: ['Refreshing', 'Cold']
  },
  { 
    id: '7', 
    name: 'Frappé', 
    price: 42, 
    category: 'cold',
    description: 'Blended iced coffee with whipped cream',
    rating: 4.6,
    reviews: 92,
    popular: true,
    image: 'snow',
    prepTime: '3-4 min',
    calories: 280,
    tags: ['Sweet', 'Blended']
  },
  { 
    id: '8', 
    name: 'Croissant', 
    price: 25, 
    category: 'pastry',
    description: 'Buttery, flaky French pastry baked fresh daily',
    rating: 4.5,
    reviews: 45,
    popular: false,
    image: 'restaurant-outline',
    prepTime: '1-2 min',
    calories: 230,
    tags: ['Buttery', 'Fresh']
  },
  { 
    id: '9', 
    name: 'Blueberry Muffin', 
    price: 20, 
    category: 'pastry',
    description: 'Soft, moist muffin packed with fresh blueberries',
    rating: 4.2,
    reviews: 34,
    popular: false,
    image: 'restaurant',
    prepTime: '1-2 min',
    calories: 180,
    tags: ['Sweet', 'Fruity']
  },
  { 
    id: '10', 
    name: 'Signature Blend', 
    price: 45, 
    category: 'special',
    description: 'Our award-winning house special blend',
    rating: 4.9,
    reviews: 234,
    popular: true,
    image: 'star',
    prepTime: '5-7 min',
    calories: 25,
    tags: ['Premium', 'Award-winning']
  },
];

interface CartItem {
  [key: string]: number;
}

export default function OrderScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem>({});
  const [selectedCategory, setSelectedCategory] = useState('hot');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Memoized filtered items
  const filteredItems = useMemo(() => {
    let items = menuItems.filter(item => item.category === selectedCategory);
    
    if (searchQuery.trim()) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return items.sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return b.rating - a.rating;
    });
  }, [selectedCategory, searchQuery]);
  
  const cartCount = useMemo(() => 
    Object.values(cart).reduce((sum, count) => sum + count, 0), [cart]
  );
  
  const cartTotal = useMemo(() => 
    Object.entries(cart).reduce((total, [itemId, count]) => {
      const item = menuItems.find(item => item.id === itemId);
      return total + (item ? item.price * count : 0);
    }, 0), [cart]
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
      })
    ]).start();
  }, []);

  const addToCart = useCallback((itemId: string) => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(50);
    }
    
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => {
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
      pathname: '/checkout',
      params: { cart: JSON.stringify(cart) },
    });
  }, [cartCount, cart, router]);

  const CategorySelector = React.memo(() => (
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
            selectedCategory === category.id && styles.categoryButtonActive
          ]}
          onPress={() => setSelectedCategory(category.id)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.categoryIconContainer,
            selectedCategory === category.id && { backgroundColor: 'rgba(255,255,255,0.2)' }
          ]}>
            <Ionicons 
              name={category.icon as any} 
              size={18} 
              color={selectedCategory === category.id ? '#fff' : '#78350f'} 
            />
          </View>
          <Text style={[
            styles.categoryText,
            selectedCategory === category.id && styles.categoryTextActive
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  ));

  const renderStars = useCallback((rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={12} color="#f59e0b" />
        );
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
    <Animated.View 
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      
      <View style={styles.cardContent}>
        <View style={styles.itemImageContainer}>
          <Ionicons name={item.image as any} size={32} color="#78350f" />
        </View>
        
        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.prepTimeContainer}>
              <Ionicons name="time-outline" size={12} color="#6b7280" />
              <Text style={styles.prepTimeText}>{item.prepTime}</Text>
            </View>
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
                style={styles.quantityButton}
                onPress={() => addToCart(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color="#78350f" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => addToCart(item.id)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  ));

  const FloatingCart = () => (
    cartCount > 0 && (
      <Animated.View 
        style={[
          styles.floatingCart,
          { 
            transform: [{ 
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0]
              })
            }] 
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.floatingCartContent}
          onPress={goToCheckout}
          activeOpacity={0.9}
        >
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemCount}>
              {cartCount} item{cartCount > 1 ? 's' : ''}
            </Text>
            <Text style={styles.cartTotal}>R{cartTotal}</Text>
          </View>
          <View style={styles.checkoutIconContainer}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#78350f" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
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
          <Ionicons name={showSearch ? 'close' : 'search'} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
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
          <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
        </View>
      )}

      {/* Categories */}
      <CategorySelector />

      {/* Menu Items */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <MenuItem item={item} />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cafe-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
        getItemLayout={(data, index) => ({
          length: 160,
          offset: 160 * index,
          index,
        })}
      />

      {/* Floating Cart */}
      <FloatingCart />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#78350f',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  
  // Search Styles
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingLeft: 40,
    color: '#334155',
  },
  searchIcon: {
    position: 'absolute',
    left: 28,
  },
  
  // Category Styles
  categoryScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 120,
    height: 48,
  },
  categoryButtonActive: {
    backgroundColor: '#78350f',
    borderColor: 'transparent',
  },
  categoryIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(120, 53, 15, 0.1)',
  },
  categoryText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  
  // List Styles
  list: {
    padding: 20,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 16,
  },
  
  // Card Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  itemImageContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#fef7ed',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  prepTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prepTimeText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
  },
  ratingPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#78350f',
  },
  
  // Cart Control Styles
  cartControls: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  quantityText: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#78350f',
  },
  addButton: {
    backgroundColor: '#78350f',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#78350f',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  
  // Floating Cart Styles
  floatingCart: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  floatingCartContent: {
    backgroundColor: '#78350f',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#78350f',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  cartInfo: {
    flex: 1,
  },
  cartItemCount: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  cartTotal: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  checkoutIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});