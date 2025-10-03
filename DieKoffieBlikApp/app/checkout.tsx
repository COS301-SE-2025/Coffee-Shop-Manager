import React, { useState, useEffect, memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  Animated,
  TextInput,
  Modal,
  Dimensions,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import PaymentService from "../backend/service/payment.service";
import CoffeeBackground from "../assets/coffee-background";
import CoffeeLoading from "../assets/loading";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const API_BASE_URL = "https://api.diekoffieblik.co.za";

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

type UserProfile = {
  user_id: string;
  display_name: string;
  loyalty_points: number;
  phone_number: string;
  total_orders: number;
  total_spent: number;
};

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: "card" },
  { id: "cash", name: "Cash", icon: "cash" },
  { id: "points", name: "Loyalty Points", icon: "star" },
  { id: "mixed", name: "Points + Card", icon: "layers" },
];

const CustomerDetails = memo(
  ({ customerInfo, setCustomerInfo, slideAnim }: CustomerDetailsProps) => {
    // Add phone number validation
    const validatePhoneNumber = (text: string) => {
      // Only allow numbers and limit to 10 digits
      const numbersOnly = text.replace(/[^0-9]/g, "");
      if (numbersOnly.length > 10) return;

      // Ensure it starts with 0
      if (numbersOnly.length > 0 && !numbersOnly.startsWith("0")) {
        Alert.alert("Invalid Number", "Phone number must start with 0");
        return;
      }

      setCustomerInfo((prev) => ({ ...prev, phone: numbersOnly }));
    };

    return (
      <Animated.View
        style={[
          styles.section,
          { opacity: 1, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.sectionTitle}>Customer Details</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color="#6b7280" />
          <TextInput
            style={styles.textInput}
            placeholder="Full Name *"
            value={customerInfo.name}
            onChangeText={(text) =>
              setCustomerInfo((prev) => ({ ...prev, name: text }))
            }
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="#6b7280" />
          <TextInput
            style={styles.textInput}
            placeholder="Email *"
            value={customerInfo.email}
            onChangeText={(text) =>
              setCustomerInfo((prev) => ({ ...prev, email: text }))
            }
            keyboardType="email-address"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="call" size={20} color="#6b7280" />
          <TextInput
            style={styles.textInput}
            placeholder="Phone Number (10 digits)"
            value={customerInfo.phone}
            onChangeText={validatePhoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="chatbubble" size={20} color="#6b7280" />
          <TextInput
            style={styles.textInput}
            placeholder="Special Instructions (Optional)"
            value={customerInfo.notes}
            onChangeText={(text) =>
              setCustomerInfo((prev) => ({ ...prev, notes: text }))
            }
            multiline
            placeholderTextColor="#9ca3af"
          />
        </View>
      </Animated.View>
    );
  },
);

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart: cartParam } = useLocalSearchParams();
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  
  // State for dynamic menu items
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  
  // NEW: State for user profile and points
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [useAllPoints, setUseAllPoints] = useState(false);

  // Points conversion rate: 100 points = R1
  const POINTS_TO_RAND_RATE = 100;

  // NEW: Function to redeem points via API
  const redeemPoints = async (pointsAmount: number, userId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      
      if (!accessToken) {
        throw new Error("No access token found");
      }

      const response = await fetch(`${API_BASE_URL}/user/points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          targetUserId: userId,
          points: pointsAmount,
          description: `Order redemption - ${pointsAmount} points used`,
        }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to redeem points");
      }

      console.log("Points redeemed successfully:", result);
      return {
        success: true,
        remaining_points: result.remaining_points,
        message: result.message,
      };
    } catch (error) {
      console.error("Error redeeming points:", error);
      throw error;
    }
  };

  // Fetch menu items from API
  const fetchMenuItems = async () => {
    try {
      setLoadingItems(true);
      const accessToken = await AsyncStorage.getItem("access_token");
      
      if (!accessToken) {
        console.log("No access token found");
        Alert.alert("Session Expired", "Please log in again");
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/product`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch menu items`);
      }

      const data = await response.json();
      console.log("Fetched menu items for checkout:", data.length);
      setMenuItems(data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      Alert.alert("Error", "Failed to load menu items. Please try again.");
    } finally {
      setLoadingItems(false);
    }
  };

  // Load user info and profile from API
  const loadUserInfo = async () => {
    try {
      setLoadingProfile(true);
      const accessToken = await AsyncStorage.getItem('access_token');
      const userEmail = await AsyncStorage.getItem('email');
      const userId = await AsyncStorage.getItem('user_id');
      
      if (!accessToken || !userEmail || !userId) {
        console.log("Missing auth data, redirecting to login");
        router.replace("/login");
        return;
      }

      // Fetch user profile from API
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log("Token expired, redirecting to login");
          router.replace("/login");
          return;
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch profile`);
      }

      const apiResponse = await response.json();
      
      if (apiResponse.success && apiResponse.profile) {
        const profile = apiResponse.profile;
        setUserProfile(profile);
        
        // Update customer info with API data
        setCustomerInfo((prev) => ({
          ...prev,
          email: userEmail,
          name: profile.display_name || "",
          phone: profile.phone_number || "",
        }));

        console.log("Loaded user profile:", { 
          email: userEmail, 
          name: profile.display_name,
          phone: profile.phone_number,
          points: profile.loyalty_points
        });
      } else {
        // Fallback to stored email only
        setCustomerInfo((prev) => ({
          ...prev,
          email: userEmail || "",
        }));
      }
    } catch (error) {
      console.error("Failed to load user info from API:", error);
      
      // Fallback to stored email only
      const storedEmail = await AsyncStorage.getItem("email");
      setCustomerInfo((prev) => ({
        ...prev,
        email: storedEmail || "",
      }));
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadUserInfo();
    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (cartParam) {
      try {
        const parsedCart = JSON.parse(cartParam as string);
        console.log("Parsed cart:", parsedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error("Error parsing cart:", error);
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
      }),
    ]).start();
  }, [cartParam]);

  // Calculate cart items using dynamic menu data
  const cartItems = useMemo(() => {
    if (loadingItems || menuItems.length === 0) return [];
    
    return Object.entries(cart)
      .map(([itemId, quantity]) => {
        const item = menuItems.find((item) => item.id === itemId);
        if (!item) {
          console.warn(`Item with ID ${itemId} not found in menu items`);
          return null;
        }
        console.log(`✅ Found item: ${item.name} (${item.id})`);
        return { ...item, quantity };
      })
      .filter(Boolean);
  }, [cart, menuItems, loadingItems]);

  const subtotal = cartItems.reduce(
    (total: number, item: any) => total + (item!.price * item!.quantity),
    0
  );

  // NEW: Calculate point discounts and final total
  const maxPointsToUse = Math.min(
    userProfile?.loyalty_points || 0,
    Math.floor(subtotal * POINTS_TO_RAND_RATE) // Can't use more points than the order total
  );
  
  const actualPointsToUse = useAllPoints ? maxPointsToUse : Math.min(pointsToUse, maxPointsToUse);
  const pointsDiscount = actualPointsToUse / POINTS_TO_RAND_RATE;
  const finalTotal = Math.max(0, subtotal - pointsDiscount);
  
  // Auto-update points when useAllPoints is toggled
  useEffect(() => {
    if (useAllPoints) {
      setPointsToUse(maxPointsToUse);
    }
  }, [useAllPoints, maxPointsToUse]);

  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      Alert.alert("Missing Information", "Please fill in your name and email");
      return;
    }

    if (
      customerInfo.phone !== "" &&
      (customerInfo.phone.length !== 10 || !customerInfo.phone.startsWith("0"))
    ) {
      Alert.alert(
        "Invalid Phone Number",
        "Please enter a valid 10-digit phone number starting with 0",
      );
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart first.");
      return;
    }

    // NEW: Validate points payment
    if (selectedPayment === "points" && finalTotal > 0) {
      Alert.alert(
        "Insufficient Points", 
        "You don't have enough points to cover the full order. Please use 'Points + Card' or another payment method."
      );
      return;
    }

    if (selectedPayment === "mixed" && actualPointsToUse === 0) {
      Alert.alert(
        "No Points Selected", 
        "Please select how many points you want to use for this mixed payment."
      );
      return;
    }

    setIsProcessing(true);
    
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const userId = await AsyncStorage.getItem("user_id");
      
      if (!accessToken || !userId) {
        Alert.alert("Session Expired", "Please log in again");
        router.replace("/login");
        return;
      }

      // NEW: Redeem points first if points are being used
      if (actualPointsToUse > 0) {
        try {
          console.log(`Attempting to redeem ${actualPointsToUse} points for user ${userId}`);
          const redemptionResult = await redeemPoints(actualPointsToUse, userId);
          console.log("Points redemption successful:", redemptionResult);
          
          // Update user profile with new points balance
          if (userProfile) {
            setUserProfile({
              ...userProfile,
              loyalty_points: redemptionResult.remaining_points
            });
          }
        } catch (error) {
          console.error("Points redemption failed:", error);
          setIsProcessing(false);
          Alert.alert(
            "Points Redemption Failed", 
            "Unable to redeem points. Please try again or use a different payment method."
          );
          return;
        }
      }

      // Create the payload in the same format as the website
      const payload = {
        products: cartItems.map((item: any) => ({
          product: item!.name,
          quantity: item!.quantity,
        })),
        // NEW: Add points payment info if applicable
        ...(actualPointsToUse > 0 && {
          points_used: actualPointsToUse,
          points_discount: pointsDiscount,
        }),
        payment_method: selectedPayment,
      };

      console.log("Placing order with payload:", payload);

      // Make the same API call as the website
      const response = await fetch(`${API_BASE_URL}/create_order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Order placed successfully
        const generatedOrderNumber = generateOrderNumber(customerInfo.phone);
        setOrderNumber(generatedOrderNumber);
        
        // NEW: Handle points-only payment
        if (selectedPayment === "points" || (selectedPayment === "mixed" && finalTotal === 0)) {
          // If paid entirely with points, show success immediately
          setIsProcessing(false);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            router.push("/home");
          }, 3000);
          return;
        }
        
        // If cash payment, show success immediately
        if (selectedPayment === "cash") {
          setIsProcessing(false);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            router.push("/home");
          }, 3000);
          return;
        }

        // If card payment or mixed payment with remaining balance, proceed with PayFast integration
        if (selectedPayment === "card" || (selectedPayment === "mixed" && finalTotal > 0)) {
          try {
            const paymentRes = await PaymentService.initiatePayment(
              generatedOrderNumber,
              finalTotal, // Use final total after points discount
              customerInfo,
            );

            setIsProcessing(false);

            if (paymentRes.success && paymentRes.paymentUrl) {
              console.log("Opening PayFast payment page...");
              router.push({
                pathname: "/payment-webview",
                params: { 
                  url: encodeURIComponent(paymentRes.paymentUrl),
                  orderId: result.order_id
                },
              });
            } else {
              Alert.alert(
                "Payment Error",
                paymentRes.message || "Could not start payment.",
              );
            }
          } catch (paymentErr) {
            console.error("Payment error:", paymentErr);
            setIsProcessing(false);
            Alert.alert(
              "Error",
              "Something went wrong while starting the payment.",
            );
          }
        }
      } else {
        // Order creation failed - need to refund points if they were redeemed
        if (actualPointsToUse > 0) {
          try {
            console.log("Order failed, attempting to refund points...");
            // Note: You might need to implement a refund points endpoint
            // For now, we'll just show an error message
            Alert.alert(
              "Order Failed", 
              `Order creation failed but ${actualPointsToUse} points were redeemed. Please contact support for assistance.`
            );
          } catch (refundError) {
            console.error("Failed to refund points:", refundError);
          }
        } else {
          Alert.alert(
            "Order Failed",
            result.message || "Failed to create order. Please try again.",
          );
        }
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Order creation error:", error);
      setIsProcessing(false);
      
      // If points were redeemed but order failed, we should ideally refund them
      if (actualPointsToUse > 0) {
        Alert.alert(
          "Error",
          `Order failed but ${actualPointsToUse} points may have been redeemed. Please contact support if your points balance is incorrect.`,
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to submit order. Please check your connection and try again.",
        );
      }
    }
  };

  function generateOrderNumber(phoneNumber?: string) {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${timestamp}-${random}`;
  }

  const OrderSummary = () => (
    <Animated.View
      style={[styles.section, { opacity: 1, transform: [{ translateY: 0 }] }]}
    >
      <Text style={styles.sectionTitle}>Order Summary</Text>

      {loadingItems ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Ionicons name="cafe-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          {cartItems.map((item) => (
            <View key={item!.id} style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <View style={styles.itemIcon}>
                  <Ionicons name="cafe" size={16} color="#78350f" />
                </View>
                <View>
                  <Text style={styles.orderItemName}>{item!.name}</Text>
                  <Text style={styles.orderItemQuantity}>
                    Qty: {item!.quantity}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderItemPrice}>
                R{item!.price * item!.quantity}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>R{subtotal.toFixed(2)}</Text>
          </View>

          {/* NEW: Show points discount if applicable */}
          {actualPointsToUse > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.discountLabel]}>
                Points Discount ({actualPointsToUse} pts)
              </Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>
                -R{pointsDiscount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R{finalTotal.toFixed(2)}</Text>
          </View>
        </>
      )}
    </Animated.View>
  );

  // NEW: Points selector component
  const PointsSelector = () => {
    if (selectedPayment !== "points" && selectedPayment !== "mixed") return null;
    
    return (
      <Animated.View
        style={[
          styles.section,
          { opacity: 1, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.sectionTitle}>Use Loyalty Points</Text>
        
        {loadingProfile ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your points...</Text>
          </View>
        ) : (
          <>
            <View style={styles.pointsBalance}>
              <Ionicons name="star" size={24} color="#f59e0b" />
              <Text style={styles.pointsBalanceText}>
                Available: {userProfile?.loyalty_points || 0} points
              </Text>
              <Text style={styles.pointsValueText}>
                (≈ R{((userProfile?.loyalty_points || 0) / POINTS_TO_RAND_RATE).toFixed(2)})
              </Text>
            </View>

            <View style={styles.useAllPointsContainer}>
              <Text style={styles.useAllPointsLabel}>Use all available points</Text>
              <Switch
                value={useAllPoints}
                onValueChange={setUseAllPoints}
                trackColor={{ false: "#e5e7eb", true: "#fbbf24" }}
                thumbColor={useAllPoints ? "#f59e0b" : "#9ca3af"}
              />
            </View>

            {!useAllPoints && (
              <View style={styles.pointsInputContainer}>
                <Text style={styles.pointsInputLabel}>Points to use:</Text>
                <TextInput
                  style={styles.pointsInput}
                  value={pointsToUse.toString()}
                  onChangeText={(text) => {
                    const points = parseInt(text) || 0;
                    setPointsToUse(Math.min(points, maxPointsToUse));
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  maxLength={6}
                />
                <Text style={styles.pointsMaxText}>
                  Max: {maxPointsToUse}
                </Text>
              </View>
            )}

            <View style={styles.pointsPreview}>
              <Text style={styles.pointsPreviewText}>
                Using {actualPointsToUse} points = R{pointsDiscount.toFixed(2)} discount
              </Text>
              {finalTotal > 0 && selectedPayment === "mixed" && (
                <Text style={styles.remainingAmountText}>
                  Remaining amount: R{finalTotal.toFixed(2)}
                </Text>
              )}
            </View>
          </>
        )}
      </Animated.View>
    );
  };

  const PaymentMethods = () => (
    <Animated.View
      style={[
        styles.section,
        { opacity: 1, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.sectionTitle}>Payment Method</Text>

      {paymentMethods.map((method) => {
        // Disable points payment if user doesn't have enough points
        const isDisabled = method.id === "points" && (userProfile?.loyalty_points || 0) < POINTS_TO_RAND_RATE;
        
        return (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentCard,
              selectedPayment === method.id && styles.paymentCardSelected,
              isDisabled && styles.paymentCardDisabled,
            ]}
            onPress={() => !isDisabled && setSelectedPayment(method.id)}
            disabled={isDisabled}
          >
            <View style={styles.paymentLeft}>
              <View style={styles.paymentIcon}>
                <Ionicons
                  name={method.icon as any}
                  size={24}
                  color={
                    isDisabled 
                      ? "#cbd5e1" 
                      : selectedPayment === method.id 
                        ? "#78350f" 
                        : "#6b7280"
                  }
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.paymentTitle,
                    selectedPayment === method.id && styles.paymentTitleSelected,
                    isDisabled && styles.paymentTitleDisabled,
                  ]}
                >
                  {method.name}
                </Text>
                {method.id === "points" && userProfile && (
                  <Text style={styles.pointsSubtext}>
                    {userProfile.loyalty_points} points available
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.paymentRight}>
              {selectedPayment === method.id && !isDisabled && (
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );

  const SuccessModal = ({ orderNumber }: { orderNumber: string }) => (
    <Modal visible={showSuccess} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.successModal}>
          <Ionicons name="checkmark-circle" size={80} color="#10b981" />
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successMessage}>
            Your order has been confirmed. You'll receive a notification when
            it's ready.
          </Text>
          {actualPointsToUse > 0 && (
            <Text style={styles.pointsUsedText}>
              {actualPointsToUse} loyalty points were used for this order.
            </Text>
          )}
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
          <Animated.View
            style={[
              styles.processingSpinner,
              {
                transform: [
                  {
                    rotate: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="hourglass" size={40} color="#78350f" />
          </Animated.View>
          <Text style={styles.processingText}>Processing your order...</Text>
        </View>
      </View>
    </Modal>
  );

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? All items will be removed from your cart.",
      [
        { text: "Keep Order", style: "cancel" },
        {
          text: "Cancel Order",
          style: "destructive",
          onPress: () => {
            router.push("/home");
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <CoffeeBackground>
        <StatusBar barStyle="light-content" backgroundColor="#78350f" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff7ed" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Checkout</Text>

          <TouchableOpacity
            onPress={handleCancelOrder}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <OrderSummary />
          <PaymentMethods />
          <PointsSelector />
          <CustomerDetails
            customerInfo={customerInfo}
            setCustomerInfo={setCustomerInfo}
            slideAnim={slideAnim}
          />
        </ScrollView>

        {/* Place Order Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.placeOrderButton,
              (loadingItems || cartItems.length === 0) && styles.placeOrderButtonDisabled
            ]}
            onPress={handlePlaceOrder}
            disabled={loadingItems || cartItems.length === 0}
          >
            <View style={styles.orderButtonContent}>
              <View style={styles.orderButtonLeft}>
                <Text style={styles.orderButtonText}>Place Order</Text>
                <Text style={styles.orderButtonSubtext}>
                  {actualPointsToUse > 0 ? (
                    <>R{finalTotal.toFixed(2)} + {actualPointsToUse} pts</>
                  ) : (
                    <>R{finalTotal.toFixed(2)}</>
                  )}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <CoffeeLoading visible={isProcessing} />
        <SuccessModal orderNumber={orderNumber} />
      </CoffeeBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff7ed",
  },
  header: {
    backgroundColor: "#78350f",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    color: "#fffbeb",
    fontWeight: "bold",
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
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#78350f",
    marginBottom: 16,
  },

  // Loading and Empty States
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
  },
  emptyCartContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCartText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 8,
  },

  // Order Summary
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  orderItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#fff7ed",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  orderItemQuantity: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#78350f",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  discountLabel: {
    color: "#10b981",
  },
  discountValue: {
    color: "#10b981",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#78350f",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#78350f",
  },

  // Points Section
  pointsBalance: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7ed",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  pointsBalanceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#78350f",
    marginLeft: 8,
    flex: 1,
  },
  pointsValueText: {
    fontSize: 14,
    color: "#b45309",
  },
  useAllPointsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 16,
  },
  useAllPointsLabel: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  pointsInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  pointsInputLabel: {
    fontSize: 16,
    color: "#1f2937",
    marginRight: 12,
  },
  pointsInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    minWidth: 80,
    textAlign: "center",
    marginRight: 12,
  },
  pointsMaxText: {
    fontSize: 14,
    color: "#6b7280",
  },
  pointsPreview: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
  },
  pointsPreviewText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  remainingAmountText: {
    fontSize: 14,
    color: "#78350f",
    fontWeight: "600",
    marginTop: 4,
  },

  // Payment Methods
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentCardSelected: {
    backgroundColor: "#fff7ed",
    borderColor: "#78350f",
  },
  paymentCardDisabled: {
    backgroundColor: "#f3f4f6",
    opacity: 0.6,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  paymentTitleSelected: {
    color: "#78350f",
    fontWeight: "600",
  },
  paymentTitleDisabled: {
    color: "#9ca3af",
  },
  pointsSubtext: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  paymentRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Customer Details
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    marginLeft: 12,
    paddingVertical: 4,
  },

  // Bottom Container
  bottomContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  placeOrderButton: {
    backgroundColor: "#78350f",
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: "#78350f",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  placeOrderButtonDisabled: {
    backgroundColor: "#cbd5e1",
    shadowOpacity: 0.1,
  },
  orderButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderButtonLeft: {
    flex: 1,
  },
  orderButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
  orderButtonSubtext: {
    color: "#fff7ed",
    fontSize: 14,
    marginTop: 2,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  successModal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 12,
  },
  pointsUsedText: {
    fontSize: 14,
    color: "#10b981",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
  },
  orderNumber: {
    backgroundColor: "#fff7ed",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  orderNumberText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#78350f",
  },
  processingModal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 60,
  },
  processingSpinner: {
    marginBottom: 16,
  },
  processingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#78350f",
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fff7ed",
  },
  cancelButtonText: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "600",
  },
});