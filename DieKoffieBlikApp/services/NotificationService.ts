// services/NotificationService.ts
import { Alert, ToastAndroid, Platform } from 'react-native';

class NotificationService {
  static async showNotification(message: string) {
    if (Platform.OS === 'android') {
      // Use Android Toast - more notification-like
      ToastAndroid.showWithGravityAndOffset(
        `☕ DieKoffieBlik: ${message}`,
        ToastAndroid.LONG,
        ToastAndroid.TOP,
        25,
        50
      );
    } else {
      // Use Alert for iOS/other platforms
      Alert.alert(
        "☕ DieKoffieBlik",
        message,
        [{ text: "OK", style: "default" }]
      );
    }
  }
}

export default NotificationService;