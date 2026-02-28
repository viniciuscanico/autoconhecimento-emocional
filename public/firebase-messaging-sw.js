importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBP1BZerw6rXBmEqQ8XLMKpnxskXaZcFDI",
  authDomain: "autoconhecimento-emocional.firebaseapp.com",
  projectId: "autoconhecimento-emocional",
  storageBucket: "autoconhecimento-emocional.firebasestorage.app",
  messagingSenderId: "836813990763",
  appId: "1:836813990763:web:caffa045251944336eba2e"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200]
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});