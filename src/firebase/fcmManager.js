import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { messaging, vapidKey, db } from './config';

const FCMManager = {

  async requestPermissionAndGetToken() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const token = await getToken(messaging, {
        vapidKey: vapidKey,
        serviceWorkerRegistration: registration
      });

      console.log('✅ Token FCM:', token);
      return token;
    } catch (error) {
      console.error('❌ Erro ao obter token:', error);
      return null;
    }
  },

  async saveTokenToFirestore(token, userId = 'anonymous') {
    await setDoc(doc(db, 'fcmTokens', token), {
      token: token,
      userId: userId,
      createdAt: new Date().toISOString(),
      platform: /android/i.test(navigator.userAgent) ? 'Android' : 'Desktop'
    });
  },

  async scheduleNotifications(settings, token) {
    const userId = 'anonymous';
    await setDoc(doc(db, 'notificationSettings', userId), {
      ...settings,
      token: token,
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Configurações salvas no Firestore.');
  },

  async cancelNotifications(userId = 'anonymous') {
    await deleteDoc(doc(db, 'notificationSettings', userId));
  },

  setupForegroundListener() {
    onMessage(messaging, (payload) => {
      console.log('📬 Notificação em foreground:', payload);
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/icon-192.png',
        vibrate: [200, 100, 200]
      });
    });
  }
};

export default FCMManager;