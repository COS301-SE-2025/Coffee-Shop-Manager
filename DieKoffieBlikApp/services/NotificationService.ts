// services/NotificationService.ts
import * as Notifications from 'expo-notifications';

class NotificationService {
  static async showNotification(message: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "DieKoffieBlik",
        body: message,
        sound: true,
      },
      trigger: null, // immediate
    });
  }
}

export default NotificationService;
