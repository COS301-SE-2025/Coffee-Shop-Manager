import React, { useState, useEffect, memo } from 'react';
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
import PaymentService from '../backend/service/payment.service';
import * as WebBrowser from 'expo-web-browser';

const { width } = Dimensions.get('window');

type CustomerInfo = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

type CustomerDetailsProps = {
  customerInfo: CustomerInfo;
  setCustomerInfo: React.Dispatch<React.SetStateAction<CustomerInfo>>;
  slideAnim: Animated.Value;
};

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
  { id: 'card', name: 'Credit/Debit Card', icon: 'card'},
  { id: 'cash', name: 'Cash', icon: 'cash' },
];

const CustomerDetails = memo(({ 
  customerInfo, 
  setCustomerInfo, 
  slideAnim 
}: CustomerDetailsProps) => {
  // Add phone number validation
  const validatePhoneNumber = (text: string) => {
    // Only allow numbers and limit to 10 digits
    const numbersOnly = text.replace(/[^0-9]/g, '');
    if (numbersOnly.length > 10) return;
    
    // Ensure it starts with 0
    if (numbersOnly.length > 0 && !numbersOnly.startsWith('0')) {
      Alert.alert('Invalid Number', 'Phone number must start with 0');
      return;
    }
    
    setCustomerInfo(prev => ({...prev, phone: numbersOnly}));
  };

  return (
    <Animated.View style={[styles.section, { opacity: 1, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>Customer Details</Text>
      
      <View style={styles.inputContainer}>
        <Ionicons name="person" size={20} color="#6b7280" />
        <TextInput
          style={styles.textInput}
          placeholder="Full Name *"
          value={customerInfo.name}
          onChangeText={(text) => setCustomerInfo(prev => ({...prev, name: text}))}
          placeholderTextColor="#9ca3af"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Ionicons name="call" size={20} color="#6b7280" />
        <TextInput
          style={styles.textInput}
          placeholder="Phone Number * (10 digits)"
          value={customerInfo.phone}
          onChangeText={validatePhoneNumber}
          keyboardType="phone-pad"
          maxLength={10}
          placeholderTextColor="#9ca3af"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="#6b7280" />
        <TextInput
          style={styles.textInput}
          placeholder="Email (Optional)"
          value={customerInfo.email}
          onChangeText={(text) => setCustomerInfo(prev => ({...prev, email: text}))}
          keyboardType="email-address"
          placeholderTextColor="#9ca3af"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Ionicons name="chatbubble" size={20} color="#6b7280" />
        <TextInput
          style={styles.textInput}
          placeholder="Special Instructions (Optional)"
          value={customerInfo.notes}
          onChangeText={(text) => setCustomerInfo(prev => ({...prev, notes: text}))}
          multiline
          placeholderTextColor="#9ca3af"
        />
      </View>
    </Animated.View>
  );
});

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart: cartParam } = useLocalSearchParams();
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
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
  const tax = Math.round(subtotal * 0.15);
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
  if (!customerInfo.name || !customerInfo.phone) {
    Alert.alert("Missing Information", "Please fill in your name and phone number");
    return;
  }

  if (customerInfo.phone.length !== 10 || !customerInfo.phone.startsWith('0')) {
    Alert.alert("Invalid Phone Number", "Please enter a valid 10-digit phone number starting with 0");
    return;
  }

  const generatedOrderNumber = generateOrderNumber(customerInfo.phone);
    setOrderNumber(generatedOrderNumber);

    if (selectedPayment === 'cash') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push('/home');
        }, 3000);
      }, 2000);
      return;
    }

    // If card, integrate PayFast
    if (selectedPayment === 'card') {
      try {
        setIsProcessing(true);
        
        const res = await PaymentService.initiatePayment(
          generatedOrderNumber,
          total,
          customerInfo
        );

        setIsProcessing(false);

        if (res.success && res.paymentUrl) {
          console.log('Opening PayFast payment page...');
          
          // Open PayFast payment page
          const result = await WebBrowser.openBrowserAsync(res.paymentUrl, {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            showTitle: true,
            toolbarColor: '#78350f',
            controlsColor: '#fff',
          });
          
          // Handle the result
          if (result.type === 'cancel') {
            Alert.alert('Payment Cancelled', 'You cancelled the payment. Your order was not placed.');
          } else if (result.type === 'dismiss') {
            // User closed the browser - we can't know if payment succeeded
            Alert.alert(
              'Payment Status Unknown', 
              'The payment window was closed. If you completed the payment, your order will be processed.',
              [
                { text: 'OK', onPress: () => router.push('/home') }
              ]
            );
          }
          
        } else {
          Alert.alert("Payment Error", res.message || "Could not start payment.");
        }
        
      } catch (err) {
        console.error('Payment error:', err);
        setIsProcessing(false);
        Alert.alert("Error", "Something went wrong while starting the payment.");
      }
    }
  };

  function generateOrderNumber(phoneNumber?: string) {
    const timestamp = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${timestamp}-${random}`;
  }

  const OrderSummary = () => (
    <Animated.View style={[styles.section, { opacity: 1, transform: [{ translateY: 0 }] }]}>
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

  const PaymentMethods = () => (
    <Animated.View style={[styles.section, { opacity: 1, transform: [{ translateY: slideAnim }] }]}>
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
            {selectedPayment === method.id && (
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );

  const SuccessModal = ({ orderNumber }: { orderNumber: string }) => (
    <Modal visible={showSuccess} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.successModal}>
          <Ionicons name="checkmark-circle" size={80} color="#10b981" />
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successMessage}>
            Your order has been confirmed. You'll receive a notification when it's ready.
          </Text>
          <View style={styles.orderNumber}>
            <Text style={styles.orderNumberText}>{orderNumber}</Text>
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
        <PaymentMethods />
        <CustomerDetails 
          customerInfo={customerInfo}
          setCustomerInfo={setCustomerInfo}
          slideAnim={slideAnim}
        />
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
      <SuccessModal orderNumber={orderNumber} />
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