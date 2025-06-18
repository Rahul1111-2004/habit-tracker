import { toast } from 'react-toastify';

class NotificationService {
  constructor() {
    this.hasPermission = false;
    this.isSupported = 'Notification' in window;
    this.checkPermission();
  }

  async checkPermission() {
    if (!this.isSupported) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
    } else if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        this.hasPermission = permission === 'granted';
      } catch (error) {
        console.error('Error checking notification permission:', error);
        this.hasPermission = false;
      }
    }
  }

  async requestPermission() {
    if (!this.isSupported) {
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
      console.error('Error requesting notification permission:', error);
      toast.error('Error requesting notification permission');
      return false;
    }
  }

  scheduleNotification(habit) {
    if (!this.isSupported) {
      toast.error('Your browser does not support notifications');
      return;
    }

    if (!this.hasPermission) {
      this.requestPermission();
      return;
    }

    try {
      const reminderTime = new Date(habit.reminderTime);
      const now = new Date();

      if (reminderTime <= now) {
        toast.warning('Reminder time must be in the future');
        return;
      }

      const timeUntilReminder = reminderTime.getTime() - now.getTime();

      // Schedule the notification
      const notificationId = setTimeout(() => {
        this.showNotification(habit);
      }, timeUntilReminder);

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      toast.error('Error scheduling notification');
      return null;
    }
  }

  showNotification(habit) {
    try {
      const notification = new Notification('Habit Reminder', {
        body: `Time to complete your habit: ${habit.name}`,
        icon: '/favicon.ico',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
      toast.error('Error showing notification');
    }
  }

  cancelNotification(notificationId) {
    if (notificationId) {
      clearTimeout(notificationId);
    }
  }
}

export const notificationService = new NotificationService(); 