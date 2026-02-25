// Notification Manager for Mood Tracker
// Handles Web Push API notifications with 3x daily default schedule

export const NotificationManager = {
  // Request permission
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  // Check if notifications are supported
  isSupported() {
    return 'Notification' in window;
  },

  // Get permission status
  getPermissionStatus() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  },

  // Send a test notification
  sendTestNotification() {
    if (Notification.permission === 'granted') {
      new Notification('Autoconhecimento Emocional', {
        body: 'Como você está se sentindo agora? 💭',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'mood-reminder',
        requireInteraction: false,
        silent: false
      });
    }
  },

  // Schedule notifications based on settings
  scheduleNotifications(settings) {
    // Clear existing intervals
    this.clearSchedule();

    if (!settings.enabled) return;

    const { times } = settings;
    
    // Schedule for each configured time
    times.forEach(time => {
      this.scheduleForTime(time);
    });

    // Store in localStorage for persistence
    localStorage.setItem('notificationSchedule', JSON.stringify(settings));
  },

  // Schedule notification for specific time
  scheduleForTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      this.sendReminder();
      // Reschedule for next day
      this.scheduleForTime(timeString);
    }, delay);

    // Store timeout ID for cleanup
    if (!window.moodTrackerTimeouts) {
      window.moodTrackerTimeouts = [];
    }
    window.moodTrackerTimeouts.push(timeoutId);
  },

  // Send reminder notification
  sendReminder() {
    if (Notification.permission === 'granted') {
      const messages = [
        'Como você está se sentindo agora? 💭',
        'Hora de registrar sua emoção! 😊',
        'Reserve um momento para o autoconhecimento 🌟',
        'Como está seu humor neste momento? 💫',
        'Que tal registrar como você se sente? ✨'
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      const notification = new Notification('Autoconhecimento Emocional', {
        body: randomMessage,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'mood-reminder',
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200]
      });

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);

      // Handle click - focus the app
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  },

  // Clear all scheduled notifications
  clearSchedule() {
    if (window.moodTrackerTimeouts) {
      window.moodTrackerTimeouts.forEach(id => clearTimeout(id));
      window.moodTrackerTimeouts = [];
    }
  },

  // Get default settings (3x daily)
  getDefaultSettings() {
    return {
      enabled: true,
      times: ['08:00', '14:00', '20:00'], // Morning, Afternoon, Night
      customTimes: false
    };
  },

  // Initialize on app load
  async init() {
    const hasPermission = await this.requestPermission();
    
    if (hasPermission) {
      // Load saved schedule or use default
      const savedSchedule = localStorage.getItem('notificationSchedule');
      const settings = savedSchedule 
        ? JSON.parse(savedSchedule) 
        : this.getDefaultSettings();

      if (settings.enabled) {
        this.scheduleNotifications(settings);
      }
    }

    return hasPermission;
  }
};

export default NotificationManager;
