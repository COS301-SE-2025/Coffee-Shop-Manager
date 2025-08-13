import React, { useState } from 'react';
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
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function FavoritesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState([
    {
      id: '1',
      name: 'Vanilla Latte',
      category: 'coffee',
      price: 'R 45.00',
      restaurant: 'Die Koffieblik Café',
      description: 'Rich espresso with steamed milk and vanilla syrup',
      rating: 4.8,
      isFavorite: true
    },
    {
      id: '2',
      name: 'Chocolate Croissant',
      category: 'pastries',
      price: 'R 25.00',
      restaurant: 'Die Koffieblik Bakery',
      description: 'Buttery croissant filled with premium Belgian chocolate',
      rating: 4.9,
      isFavorite: true
    },
    {
      id: '3',
      name: 'Ethiopian Single Origin',
      category: 'beans',
      price: 'R 180.00',
      restaurant: 'Die Koffieblik Roastery',
      description: '250g premium coffee beans with floral notes',
      rating: 4.7,
      isFavorite: true
    },
    {
      id: '4',
      name: 'Iced Americano',
      category: 'coffee',
      price: 'R 35.00',
      restaurant: 'Die Koffieblik Express',
      description: 'Bold espresso shots served over ice',
      rating: 4.6,
      isFavorite: true
    },
    {
      id: '5',
      name: 'Blueberry Muffin',
      category: 'pastries',
      price: 'R 28.00',
      restaurant: 'Die Koffieblik Café',
      description: 'Fresh baked muffin loaded with blueberries',
      rating: 4.5,
      isFavorite: true
    }
  ]);

  const categories = [
    { key: 'all', label: 'All Items', icon: 'grid' as const },
    { key: 'coffee', label: 'Coffee', icon: 'cafe' as const },
    { key: 'pastries', label: 'Pastries', icon: 'restaurant' as const },
    { key: 'beans', label: 'Beans', icon: 'leaf' as const }
  ];

  const filteredFavorites = selectedCategory === 'all' 
    ? favorites 
    : favorites.filter(item => item.category === selectedCategory);

  const toggleFavorite = (id: string) => {
    Alert.alert(
      "Remove from Favorites",
      "Are you sure you want to remove this item from your favorites?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => {
            setFavorites(prev => prev.filter(item => item.id !== id));
          }
        }
      ]
    );
  };

  const NavBar = () => (
    <View style={styles.navbar}>
      <View style={styles.navLeft}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
          android_ripple={{ color: '#78350f20' }}
        >
          <Ionicons name="arrow-back" size={24} color="#78350f" />
        </Pressable>
        <Text style={styles.navTitle}>Favorites</Text>
      </View>
    </View>
  );

  const HeaderSection = () => (
    <View style={styles.headerSection}>
      <LinearGradient
        colors={['#78350f', '#92400e']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.heartContainer}>
            <Ionicons name="heart" size={60} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Your Favorites</Text>
          <Text style={styles.headerSubtitle}>
            {favorites.length} item{favorites.length !== 1 ? 's' : ''} saved
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  const CategoryTabs = () => (
    <View style={styles.categorySection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <Pressable
            key={category.key}
            style={[
              styles.categoryTab,
              selectedCategory === category.key && styles.categoryTabActive
            ]}
            onPress={() => setSelectedCategory(category.key)}
            android_ripple={{ color: '#78350f20' }}
          >
            <View style={[
              styles.categoryIconContainer,
              selectedCategory === category.key && styles.categoryIconContainerActive
            ]}>
              <Ionicons 
                name={category.icon} 
                size={20} 
                color={selectedCategory === category.key ? '#fff' : '#78350f'} 
              />
            </View>
            <Text style={[
              styles.categoryTabText,
              selectedCategory === category.key && styles.categoryTabTextActive
            ]}>
              {category.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const FavoriteItem = ({ item }: { item: any }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.favoriteHeader}>
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteName}>{item.name}</Text>
          <Text style={styles.favoriteRestaurant}>{item.restaurant}</Text>
        </View>
        <Pressable
          onPress={() => toggleFavorite(item.id)}
          style={styles.favoriteButton}
        >
          <Ionicons name="heart" size={24} color="#ef4444" />
        </Pressable>
      </View>
      
      <Text style={styles.favoriteDescription}>{item.description}</Text>
      
      <View style={styles.favoriteFooter}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#fbbf24" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <Text style={styles.favoritePrice}>{item.price}</Text>
      </View>
      
      <View style={styles.actionButtonsContainer}>
        <Pressable style={styles.addToCartButton}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </Pressable>
        <Pressable style={styles.shareButton}>
          <Ionicons name="share-outline" size={16} color="#78350f" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent 
      />
      <NavBar />
      <HeaderSection />
      <CategoryTabs />
      
      <FlatList
        data={filteredFavorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FavoriteItem item={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No favorites yet</Text>
            <Text style={styles.emptyStateText}>
              {selectedCategory === 'all' 
                ? "Start adding items to your favorites to see them here"
                : `No ${categories.find(c => c.key === selectedCategory)?.label.toLowerCase()} favorites found`
              }
            </Text>
            <Pressable style={styles.browseCatalogButton}>
              <Text style={styles.browseCatalogText}>Browse Menu</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  
  // Navigation Bar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#78350f',
  },
  
  // Header Section
  headerSection: {
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
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  heartContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#ffffff20',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fed7aa',
  },
  
  // Category Section
  categorySection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  categoryTabActive: {
    backgroundColor: '#78350f',
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryIconContainerActive: {
    backgroundColor: '#ffffff20',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#78350f',
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  
  // Favorite Items
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  favoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 4,
  },
  favoriteRestaurant: {
    fontSize: 12,
    color: '#9ca3af',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  favoriteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 4,
  },
  favoritePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#78350f',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#78350f',
    paddingVertical: 12,
    borderRadius: 12,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseCatalogButton: {
    backgroundColor: '#78350f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseCatalogText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});