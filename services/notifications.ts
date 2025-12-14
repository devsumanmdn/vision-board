import { useSettingsStore } from '@/store/settingsStore';
import { VisionItem } from '@/store/visionStore';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleRegimen = async (item: VisionItem) => {
  if (!item.schedule) return;

  // Check if notifications are enabled in settings
  const notificationsEnabled = useSettingsStore.getState().notificationsEnabled;
  if (!notificationsEnabled) {
    console.log("Notifications disabled by user");
    return;
  }

  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    console.log("Notification permission not granted");
    return;
  }

  for (const scheduleItem of item.schedule) {
    const [hours, minutes] = scheduleItem.time.split(':').map(Number);
    
    // For Android, use daily trigger; for iOS use weekly calendar trigger
    if (Platform.OS === 'android') {
      // Android: Schedule a daily notification
      // Calculate seconds until the target time today, then repeat every 24 hours
      const now = new Date();
      const targetTime = new Date();
      targetTime.setHours(hours, minutes, 0, 0);
      
      // If target time has passed today, schedule for tomorrow
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
      
      const secondsUntilTrigger = Math.floor((targetTime.getTime() - now.getTime()) / 1000);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to Suffer 💪",
          body: `${scheduleItem.task} - ${item.motivations?.[0] || "Because you said you would."}`,
          data: { itemId: item.id },
        },
        trigger: {
          seconds: secondsUntilTrigger,
          repeats: false, // Android doesn't support repeating with seconds
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      });
    } else {
      // iOS: Use weekly calendar trigger for each active day
      for (const day of scheduleItem.activeDays) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Time to Suffer 💪",
            body: `${scheduleItem.task} - ${item.motivations?.[0] || "Because you said you would."}`,
            data: { itemId: item.id },
          },
          trigger: {
            hour: hours,
            minute: minutes,
            weekday: day + 1, // Expo uses 1-7 (1=Sunday)
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          },
        });
      }
    }
  }
  
  console.log("Notifications scheduled successfully!");
};
