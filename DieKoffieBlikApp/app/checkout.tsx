import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar, 
  Alert,
  Animated,
  TextInput,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const menuItems = [
  { id: '1', name: 'Americano', price: 30 },
  { id: '2', name: 'Cappuccino', price: 35 },
  { id: '3', name: 'Latte', price: 32 },
  { id: '4', name: 'Mocha', price: 38 },
  { id: '5', name: 'Espresso', price: 28 },
  { id: '6', name: 'Iced Coffee', price: 30 },
  { id: '7', name: 'Frappé', price: 42 },
  { id: '8', name: 'Croissant', price: 25 },
  { id: '9', name: 'Muffin', price: 20 },
  { id: '10', name: 'Signature Blend', price: 45 },
];

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: 'card', popular: true },
  { id: 'cash', name: 'Cash on Delivery', icon: 'cash', popular: false },
  { id: 'mobile', name: 'Mobile Payment', icon: 'phone-portrait', popular: true },
  { id: 'wallet', name: 'Digital Wallet', icon: 'wallet', popular: false },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart: cartParam } = useLocalSearchParams();
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    if (cartParam) {
      try {
        const parsedCart = JSON.parse(cartParam as string);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error parsing cart:', error);
      }
    }

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
  }, [cartParam]);

  const cartItems = Object.entries(cart).map(([itemId, quantity]) => {
    const item = menuItems.find(item => item.id === itemId);
    return item ? { ...item, quantity } : null;
  }).filter(Boolean);

  const subtotal = cartItems.reduce((total, item) => total + (item!.price * item!.quantity), 0);
  const deliveryFee = deliveryMethod === 'delivery' ? 15 : 0;
  const tax = Math.round(subtotal * 0.15);
  const total = subtotal + deliveryFee + tax;

  const handlePlaceOrder = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      Alert.alert(
        "Missing Information",
        "Please fill in your name and phone number",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    if (deliveryMethod === 'delivery' && !customerInfo.address) {
      Alert.alert(
        "Missing Address",
        "Please provide a delivery address",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    setIsProcessing(true);
    
    // Simulate order processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/home');
      }, 3000);
    }, 2000);
  };

  const OrderSummary = () => (
    <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      
      {cartItems.map((item) => (
        <View key={item!.id} style={styles.orderItem}>
          <View style={styles.orderItemLeft}>
            <View style={styles.itemIcon}>
              <Ionicons name="cafe" size={16} color="#78350f" />
            </View>
            <View>
              <Text style={styles.orderItemName}>{item!.name}</Text>
              <Text style={styles.orderItemQuantity}>Qty: {item!.quantity}</Text>
            </View>
          </View>
          <Text style={styles.orderItemPrice}>R{item!.price * item!.quantity}</Text>
        </View>
      ))}
      
      <View style={styles.divider} />
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>R{subtotal}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Delivery Fee</Text>
        <Text style={styles.summaryValue}>R{deliveryFee}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Tax (15%)</Text>
        <Text style={styles.summaryValue}>R{tax}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>R{total}</Text>
      </View>
    </Animated.View>
  );

  const DeliveryOptions = () => (
    <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>Delivery Method</Text>
      
      <TouchableOpacity 
        style={[
          styles.optionCard,
          deliveryMethod === 'pickup' && styles.optionCardSelected
        ]}
        onPress={() => setDeliveryMethod('pickup')}
      >
        <View style={styles.optionIcon}>
          <Ionicons 
            name="storefront" 
            size={24} 
            color={deliveryMethod === 'pickup' ? '#78350f' : '#6b7280'} 
          />
        </View>
        <View style={styles.optionContent}>
          <Text style={[
            styles.optionTitle,
            deliveryMethod === 'pickup' && styles.optionTitleSelected
          ]}>
            Pickup
          </Text>
          <Text style={styles.optionSubtitle}>Ready in 15-20 minutes</Text>
        </View>
        <View style={styles.optionRight}>
          <Text style={styles.optionPrice}>FREE</Text>
          {deliveryMethod === 'pickup' && (
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          )}
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.optionCard,
          deliveryMethod === 'delivery' && styles.optionCardSelected
        ]}
        onPress={() => setDeliveryMethod('delivery')}
      >
        <View style={styles.optionIcon}>
          <Ionicons 
            name="bicycle" 
            size={24} 
            color={deliveryMethod === 'delivery' ? '#78350f' : '#6b7280'} 
          />
        </View>
        <View style={styles.optionContent}>
          <Text style={[
            styles.optionTitle,
            deliveryMethod === 'delivery' && styles.optionTitleSelected
          ]}>
            Delivery
          </Text>
          <Text style={styles.optionSubtitle}>30-45 minutes</Text>
        </View>
        <View style={styles.optionRight}>
          <Text style={styles.optionPrice}>R15</Text>
          {deliveryMethod === 'delivery' && (
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const PaymentMethods = () => (
    <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      
      {paymentMethods.map((method) => (
        <TouchableOpacity 
          key={method.id}
          style={[
            styles.paymentCard,
            selectedPayment === method.id && styles.paymentCardSelected
          ]}
          onPress={() => setSelectedPayment(method.id)}
        >
          <View style={styles.paymentLeft}>
            <View style={styles.paymentIcon}>
              <Ionicons 
                name={method.icon as any} 
                size={24} 
                color={selectedPayment === method.id ? '#78350f' : '#6b7280'} 
              />
            </View>
            <Text style={[
              styles.paymentTitle,
              selectedPayment === method.id && styles.paymentTitleSelected
            ]}>
              {method.name}
            </Text>
          </View>
          <View style={styles.paymentRight}>
            {method.popular && (
              <View style={styles.popularTag}>
                <Text style={styles.popularTagText}>Popular</Text>
              </View>
            )}
            {selectedPayment === method.id && (
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );

  const CustomerDetails = () => (
    <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>Customer Details</Text>
      
      <View style={styles.inputContainer}>
        <Ionicons name="person" size={20} color="#6b7280" />
        <TextInput
          style={styles.textInput}
          placeholder="Full Name *"
          value={customerInfo.name}
          onChangeText={(text) => setCustomerInfo({...customerInfo, name: text})}
          placeholderTextColor="#9ca3af"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Ionicons name="call" size={20} color="#6b7280" />
        <TextInput
          style={styles.textInput}
          placeholder="Phone Number *"
          value={customerInfo.phone}
          onChangeText={(text) => setCustomerInfo({...customerInfo, phone: text})}
          keyboardType="phone-pad"
          placeholderTextColor="#9ca3af"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="#6b7280" />
        <TextInput
          style={styles.textInput}
          placeholder="Email (Optional)"
          value={customerInfo.email}
          onChangeText={(text) => setCustomerInfo({...customerInfo, email: text})}
          keyboardType="email-address"
          placeholderTextColor="#9ca3af"
        />
      </View>
      
      {deliveryMethod === 'delivery' && (
        <View style={styles.inputContainer}>
          <Ionicons name="location" size={20} color="#6b7280" />
          <TextInput
            style={styles.textInput}
            placeholder="Delivery Address *"
            value={customerInfo.address}
            onChangeText={(text) => setCustomerInfo({...customerInfo, address: text})}
            multiline
            placeholderTextColor="#9ca3af"
          />
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <Ionicons name="chatbubble" size={20} color="#6b7280" />
        <TextInput
          style={styles.textInput}
          placeholder="Special Instructions (Optional)"
          value={customerInfo.notes}
          onChangeText={(text) => setCustomerInfo({...customerInfo, notes: text})}
          multiline
          placeholderTextColor="#9ca3af"
        />
      </View>
    </Animated.View>
  );

  const SuccessModal = () => (
    <Modal visible={showSuccess} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.successModal}>
          <Ionicons name="checkmark-circle" size={80} color="#10b981" />
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successMessage}>
            Your order has been confirmed. You'll receive a notification when it's ready.
          </Text>
          <View style={styles.orderNumber}>
            <Text style={styles.orderNumberText}>Order #12345</Text>
          </View>
        </View>
      </View>
    </Modal>
  );

  const ProcessingModal = () => (
    <Modal visible={isProcessing} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.processingModal}>
          <Animated.View style={[
            styles.processingSpinner,
            {
              transform: [{
                rotate: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }]
            }
          ]}>
            <Ionicons name="hourglass" size={40} color="#78350f" />
          </Animated.View>
          <Text style={styles.processingText}>Processing your order...</Text>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#78350f" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff7ed" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <OrderSummary />
        <DeliveryOptions />
        <PaymentMethods />
        <CustomerDetails />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
        >
          <View style={styles.orderButtonContent}>
            <View style={styles.orderButtonLeft}>
              <Text style={styles.orderButtonText}>Place Order</Text>
              <Text style={styles.orderButtonSubtext}>R{total}</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <ProcessingModal />
      <SuccessModal />
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
  headerTitle: {
    fontSize: 24,
    color: '#fffbeb',
    fontWeight: 'bold',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  
  // Sections
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#78350f',
    marginBottom: 16,
  },
  
  // Order Summary
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  orderItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#78350f',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#78350f',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#78350f',
  },
  
  // Delivery Options
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#fff7ed',
    borderColor: '#78350f',
  },
  optionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#78350f',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  optionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#78350f',
  },
  
  // Payment Methods
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentCardSelected: {
    backgroundColor: '#fff7ed',
    borderColor: '#78350f',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  paymentTitleSelected: {
    color: '#78350f',
    fontWeight: '600',
  },
  paymentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  popularTag: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Customer Details
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
    paddingVertical: 4,
  },
  
  // Bottom Container
  bottomContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  placeOrderButton: {
    backgroundColor: '#78350f',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#78350f',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  orderButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderButtonLeft: {
    flex: 1,
  },
  orderButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  orderButtonSubtext: {
    color: '#fff7ed',
    fontSize: 14,
    marginTop: 2,
  },
  
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  orderNumber: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  orderNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#78350f',
  },
  processingModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 60,
  },
  processingSpinner: {
    marginBottom: 16,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#78350f',
  },
});