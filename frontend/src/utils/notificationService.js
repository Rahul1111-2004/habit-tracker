import { toast } from 'react-toastify';

class NotificationService {
  constructor() {
    this.hasPermission = false;
    this.checkPermission();
  }

  async checkPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      toast.error('Your browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      
      if (this.hasPermission) {
        toast.success('Notifications enabled successfully!');
      } else {
        toast.warning('Please enable notifications to receive reminders');
      }
      
      return this.hasPermission;
    } catch (error) {
      toast.error('Error requesting notification permission');
      return false;
    }
  }

  scheduleNotification(habit) {
    if (!this.hasPermission) {
      this.requestPermission();
      return;
    }

    const reminderTime = new Date(habit.reminderTime);
    const now = new Date();

    if (reminderTime <= now) {
      toast.warning('Reminder time must be in the future');
      return;
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    // Schedule the notification
    setTimeout(() => {
      this.showNotification(habit);
    }, timeUntilReminder);

    // Store the notification ID for later cancellation if needed
    return setTimeout(() => {}, timeUntilReminder);
  }

  showNotification(habit) {
    if (!this.hasPermission) return;

    const notification = new Notification('TrackIt Reminder', {
      body: `Time to complete your habit: ${habit.name}`,
      icon: '/favicon.ico', // You can replace this with your app's icon
      badge: '/favicon.ico',
      tag: `habit-${habit.id}`,
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  cancelNotification(notificationId) {
    if (notificationId) {
      clearTimeout(notificationId);
    }
  }
}

export const notificationService = new NotificationService(); 