// notificationManager.js v2.0
// Sistema de notificações usando Notification Triggers API
// Solução nativa sem dependência de setTimeout ou timers contínuos

const NotificationManager = {
  
  /**
   * Verifica se Notification Triggers API está disponível
   */
  isSupported() {
    return (
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'showTrigger' in Notification.prototype
    );
  },

  /**
   * Solicita permissão de notificações
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      console.error('Este navegador não suporta notificações');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Permissão de notificação:', permission);
      return permission;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return 'denied';
    }
  },

  /**
   * Gera timestamps futuros baseado nas configurações
   * @param {Object} settings - { enabled, times: ['08:00', '14:00', '20:00'] } ou { enabled, interval, startTime, endTime }
   * @param {number} daysAhead - Quantos dias à frente agendar (padrão: 2)
   * @returns {Array} Lista de timestamps Unix
   */
  generateTimestamps(settings, daysAhead = 2) {
    if (!settings.enabled) return [];

    const timestamps = [];
    const now = new Date();
    
    // Se tem times fixos (3x, 2x, 1x ao dia)
    if (settings.times && settings.times.length > 0) {
      for (let day = 0; day < daysAhead; day++) {
        settings.times.forEach(timeStr => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const targetDate = new Date(now);
          targetDate.setDate(now.getDate() + day);
          targetDate.setHours(hours, minutes, 0, 0);
          
          // Só adiciona se for futuro
          if (targetDate > now) {
            timestamps.push(targetDate.getTime());
          }
        });
      }
    }
    // Se é intervalo customizado
    else if (settings.interval && settings.startTime && settings.endTime) {
      const intervalMs = settings.interval * 60 * 60 * 1000; // horas → ms
      const [startH, startM] = settings.startTime.split(':').map(Number);
      const [endH, endM] = settings.endTime.split(':').map(Number);

      for (let day = 0; day < daysAhead; day++) {
        const baseDate = new Date(now);
        baseDate.setDate(now.getDate() + day);
        baseDate.setHours(startH, startM, 0, 0);
        
        const endDate = new Date(baseDate);
        endDate.setHours(endH, endM, 0, 0);

        let currentTime = baseDate.getTime();
        while (currentTime <= endDate.getTime()) {
          // Só adiciona se for futuro
          if (currentTime > now.getTime()) {
            timestamps.push(currentTime);
          }
          currentTime += intervalMs;
        }
      }
    }

    return timestamps.sort((a, b) => a - b);
  },

  /**
   * Mensagens aleatórias para variar as notificações
   */
  getRandomMessage() {
    const messages = [
      'Como você está se sentindo agora? 💭',
      'Que tal registrar sua emoção atual? 🎯',
      'Momento de autoconhecimento! Como está? 🌟',
      'Pausa para o check-in emocional 💙',
      'Registre seu estado emocional 📝'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  },

  /**
   * Agenda notificações usando Notification Triggers API
   * @param {Object} settings - Configurações de notificação
   */
  async scheduleNotifications(settings) {
    try {
      // Verifica suporte
      if (!this.isSupported()) {
        console.warn('⚠️ Notification Triggers API não suportada. Usando fallback...');
        return this.scheduleWithFallback(settings);
      }

      // Verifica permissão
      const permission = await Notification.permission;
      if (permission !== 'granted') {
        console.warn('Permissão de notificação não concedida');
        return;
      }

      // Aguarda Service Worker estar pronto
      const registration = await navigator.serviceWorker.ready;

      // Limpa notificações agendadas antigas
      await this.clearSchedule();

      // Gera timestamps para próximas 48h
      const timestamps = this.generateTimestamps(settings, 2);
      
      console.log(`📅 Agendando ${timestamps.length} notificações para as próximas 48h`);

      // Registra cada notificação com trigger
      for (const timestamp of timestamps) {
        const showTime = new Date(timestamp);
        
        await registration.showNotification('Autoconhecimento Emocional', {
          body: this.getRandomMessage(),
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: `mood-reminder-${timestamp}`,
          requireInteraction: false,
          silent: false,
          vibrate: [200, 100, 200],
          data: {
            url: '/',
            timestamp: timestamp
          },
          // 🎯 CRITICAL: Notification Triggers API
          showTrigger: new TimestampTrigger(timestamp)
        });

        console.log(`✅ Agendada para: ${showTime.toLocaleString('pt-BR')}`);
      }

      console.log('🎉 Todas as notificações agendadas com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao agendar notificações:', error);
      // Fallback se Triggers API falhar
      this.scheduleWithFallback(settings);
    }
  },

  /**
   * Fallback: setTimeout (para navegadores sem Notification Triggers API)
   */
  scheduleWithFallback(settings) {
    console.log('⚠️ Usando fallback com setTimeout (desktop only)');
    
    if (!settings.enabled) return;

    // Limpa timers antigos
    if (window.notificationTimers) {
      window.notificationTimers.forEach(timer => clearTimeout(timer));
    }
    window.notificationTimers = [];

    const timestamps = this.generateTimestamps(settings, 1); // Apenas próximas 24h no fallback

    timestamps.forEach(timestamp => {
      const delay = timestamp - Date.now();
      if (delay > 0) {
        const timer = setTimeout(() => {
          this.sendTestNotification();
        }, delay);
        window.notificationTimers.push(timer);
      }
    });

    console.log(`⏰ ${timestamps.length} notificações agendadas via setTimeout`);
  },

  /**
   * Limpa todas as notificações agendadas
   */
  async clearSchedule() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications({
        includeTriggered: false
      });

      console.log(`🗑️ Limpando ${notifications.length} notificações agendadas`);

      for (const notification of notifications) {
        notification.close();
      }

      // Limpa timers do fallback também
      if (window.notificationTimers) {
        window.notificationTimers.forEach(timer => clearTimeout(timer));
        window.notificationTimers = [];
      }

    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
    }
  },

  /**
   * Envia notificação de teste imediata
   */
  async sendTestNotification() {
    try {
      const permission = await Notification.permission;
      if (permission !== 'granted') {
        console.warn('Permissão não concedida');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Autoconhecimento Emocional', {
        body: 'Notificação de teste! 🔔',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'test-notification',
        requireInteraction: false,
        vibrate: [200, 100, 200],
        data: { url: '/' }
      });

      console.log('✅ Notificação de teste enviada');
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
    }
  },

  /**
   * Configurações padrão (3x ao dia)
   */
  getDefaultSettings() {
    return {
      enabled: true,
      times: ['08:00', '14:00', '20:00']
    };
  },

  /**
   * Obtém status do sistema de notificações
   */
  async getStatus() {
    const status = {
      supported: this.isSupported(),
      permission: Notification.permission,
      serviceWorkerReady: false,
      scheduledCount: 0
    };

    try {
      const registration = await navigator.serviceWorker.ready;
      status.serviceWorkerReady = true;

      const notifications = await registration.getNotifications({
        includeTriggered: false
      });
      status.scheduledCount = notifications.length;
    } catch (error) {
      console.error('Erro ao obter status:', error);
    }

    return status;
  }
};

// Exporta para uso global
if (typeof window !== 'undefined') {
  window.NotificationManager = NotificationManager;
}

export default NotificationManager;
