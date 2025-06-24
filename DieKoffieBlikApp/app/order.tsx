import React, { useState, useEffect } from 'react';
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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const menuCategories = [
  { id: 'hot', name: 'Hot Coffee', icon: 'cafe' },
  { id: 'cold', name: 'Cold Drinks', icon: 'snow' },
  { id: 'pastry', name: 'Pastries', icon: 'restaurant' },
  { id: 'special', name: 'Specials', icon: 'star' },
];

const menuItems = [
  { 
    id: '1', 
    name: 'Americano', 
    price: 30, 
    category: 'hot',
    description: 'Rich espresso with hot water',
    rating: 4.5,
    reviews: 124,
    popular: false,
    image: 'cafe'
  },
  { 
    id: '2', 
    name: 'Cappuccino', 
    price: 35, 
    category: 'hot',
    description: 'Espresso with steamed milk foam',
    rating: 4.8,
    reviews: 89,
    popular: true,
    image: 'cafe-outline'
  },
  { 
    id: '3', 
    name: 'Latte', 
    price: 32, 
    category: 'hot',
    description: 'Smooth espresso with steamed milk',
    rating: 4.6,
    reviews: 156,
    popular: true,
    image: 'heart'
  },
  { 
    id: '4', 
    name: 'Mocha', 
    price: 38, 
    category: 'hot',
    description: 'Chocolate meets coffee perfection',
    rating: 4.7,
    reviews: 67,
    popular: false,
    image: 'heart-outline'
  },
  { 
    id: '5', 
    name: 'Espresso', 
    price: 28, 
    category: 'hot',
    description: 'Pure, concentrated coffee',
    rating: 4.4,
    reviews: 203,
    popular: false,
    image: 'flash'
  },
  { 
    id: '6', 
    name: 'Iced Coffee', 
    price: 30, 
    category: 'cold',
    description: 'Refreshing cold brew',
    rating: 4.3,
    reviews: 78,
    popular: false,
    image: 'snow-outline'
  },
  { 
    id: '7', 
    name: 'Frappé', 
    price: 42, 
    category: 'cold',
    description: 'Blended iced coffee delight',
    rating: 4.6,
    reviews: 92,
    popular: true,
    image: 'snow'
  },
  { 
    id: '8', 
    name: 'Croissant', 
    price: 25, 
    category: 'pastry',
    description: 'Buttery, flaky pastry',
    rating: 4.5,
    reviews: 45,
    popular: false,
    image: 'restaurant-outline'
  },
  { 
    id: '9', 
    name: 'Muffin', 
    price: 20, 
    category: 'pastry',
    description: 'Fresh baked daily',
    rating: 4.2,
    reviews: 34,
    popular: false,
    image: 'restaurant'
  },
  { 
    id: '10', 
    name: 'Signature Blend', 
    price: 45, 
    category: 'special',
    description: 'Our house special blend',
    rating: 4.9,
    reviews: 234,
    popular: true,
    image: 'star'
  },
];

export default function OrderScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState('hot');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  const filteredItems = menuItems.filter(item => item.category === selectedCategory);
  const cartCount = Object.values(cart).reduce((sum, count) => sum + count, 0);
  const cartTotal = Object.entries(cart).reduce((total, [itemId, count]) => {
    const item = menuItems.find(item => item.id === itemId);
    return total + (item ? item.price * count : 0);
  }, 0);

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

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
    
    // Show a nice feedback
    const item = menuItems.find(item => item.id === itemId);
    Alert.alert(
      "Added to Cart! ☕",
      `${item?.name} has been added to your cart`,
      [{ text: "Continue Shopping", style: "default" }]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const goToCheckout = () => {
    if (cartCount === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add some items to your cart before checkout",
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    
    router.push({
      pathname: '/checkout',
      params: { cart: JSON.stringify(cart) },
    });
  };

  const CategorySelector = () => (
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
        >
          <Ionicons 
            name={category.icon as any} 
            size={20} 
            color={selectedCategory === category.id ? '#fff' : '#78350f'} 
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === category.id && styles.categoryTextActive
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={12}
          color="#f59e0b"
        />
      );
    }
    return stars;
  };

  const MenuItem = ({ item }: { item: any }) => (
    <Animated.View 
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      {item.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Popular</Text>
        </View>
      )}
      
      <View style={styles.itemImageContainer}>
        <Ionicons name={item.image as any} size={40} color="#78350f" />
      </View>
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {renderStars(item.rating)}
          </View>
          <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
        </View>
        
        <Text style={styles.itemPrice}>R{item.price}</Text>
      </View>
      
      <View style={styles.cartControls}>
        {cart[item.id] ? (
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => removeFromCart(item.id)}
            >
              <Ionicons name="remove" size={18} color="#78350f" />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{cart[item.id]}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => addToCart(item.id)}
            >
              <Ionicons name="add" size={18} color="#78350f" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => addToCart(item.id)}
          >
            <Ionicons name="add" size={24} color="#fff7ed" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  const CartSummary = () => (
    cartCount > 0 && (
      <View style={styles.cartSummary}>
        <Text style={styles.cartSummaryText}>
          {cartCount} item{cartCount > 1 ? 's' : ''} • R{cartTotal}
        </Text>
      </View>
    )
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#78350f" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff7ed" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Coffee</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#fff7ed" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <CategorySelector />

      {/* Menu Items */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <MenuItem item={item} />}
      />

      {/* Cart Summary */}
      <CartSummary />

      {/* Checkout Button */}
      <TouchableOpacity 
        style={[
          styles.checkoutButton,
          cartCount === 0 && styles.checkoutButtonDisabled
        ]} 
        onPress={goToCheckout}
      >
        <View style={styles.checkoutContent}>
          <View style={styles.checkoutLeft}>
            <Text style={styles.checkoutButtonText}>
              {cartCount === 0 ? 'Add items to cart' : 'Checkout'}
            </Text>
            {cartCount > 0 && (
              <Text style={styles.checkoutSubtext}>R{cartTotal}</Text>
            )}
          </View>
          <View style={styles.checkoutRight}>
            <Ionicons name="cart" size={20} color="white" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  header: {
    backgroundColor: '#78350f',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  searchButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    color: '#fffbeb',
    fontWeight: 'bold',
  },
  
  // Categories
  categoryScroll: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#78350f',
  },
  categoryText: {
    fontSize: 14,
    color: '#78350f',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  
  // Menu Items
  list: {
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#fff7ed',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  itemDetails: {
    flex: 1,
    marginBottom: 12,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#78350f',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#78350f',
  },
  
  // Cart Controls
  cartControls: {
    alignItems: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#78350f',
  },
  addButton: {
    backgroundColor: '#78350f',
    padding: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#78350f',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  
  // Cart Summary
  cartSummary: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#78350f',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cartSummaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Checkout Button
  checkoutButton: {
    backgroundColor: '#78350f',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#78350f',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  checkoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutLeft: {
    flex: 1,
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  checkoutSubtext: {
    color: '#fff7ed',
    fontSize: 14,
    marginTop: 2,
  },
  checkoutRight: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});