import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

class NotificationService {
  private userId: string | null = null;
  private subscriptions: any[] = [];

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Get the current user ID from AsyncStorage
      this.userId = await AsyncStorage.getItem('user_id');
      if (this.userId) {
        this.subscribeToUserOrders();
      }
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  public async updateUser(userId: string) {
    // Update user ID if it changes (after login)
    this.userId = userId;
    
    // Clear existing subscriptions
    this.clearSubscriptions();
    
    // Set up new subscriptions for this user
    if (this.userId) {
      this.subscribeToUserOrders();
    }
  }

  private subscribeToUserOrders() {
    if (!this.userId) return;

    // Subscribe to orders table but FILTER by user_id
    interface OrderPayload {
      schema: string;
      table: string;
      commit_timestamp: string;
      eventType: string;
      new: {
        id: number;
        user_id: string;
        // Add other order fields as needed
        [key: string]: any;
      };
      old: null;
      errors?: any;
    }

    const subscription = supabase
      .channel('orders')
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `user_id=eq.${this.userId}` },
        async (payload: OrderPayload) => {
          console.log('User-specific order notification received:', payload);

          // Only show notification for THIS user's orders
          await this.showNotification(
            'Your Order Update',
            'Your order has been received and is being processed'
          );
        }
      )
      .subscribe();
    
    this.subscriptions.push(subscription);
  }

  private clearSubscriptions() {
    // Remove all existing subscriptions
    this.subscriptions.forEach(subscription => {
      supabase.removeChannel(subscription);
    });
    this.subscriptions = [];
  }

  private async showNotification(title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Show immediately
    });
  }
}

// Create and export singleton instance
export default new NotificationService();
