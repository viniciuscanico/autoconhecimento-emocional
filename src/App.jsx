import React, { useState, useEffect } from 'react';
import { Calendar, Activity, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import FCMManager from './firebase/fcmManager';

const MoodTracker = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [reportType, setReportType] = useState('daily');
  const [reportSubTab, setReportSubTab] = useState('frequency');
  const [graphPeriod, setGraphPeriod] = useState('daily');
  const [entries, setEntries] = useState([]);
  const [showAllEmotions, setShowAllEmotions] = useState(() => {
    try { return localStorage.getItem('showAllEmotions') === 'true'; } catch { return false; }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [clickedMood, setClickedMood] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Settings state
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(3);
  const [reminderStartTime, setReminderStartTime] = useState('08:00');
  const [reminderEndTime, setReminderEndTime] = useState('22:00');
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [notificationPreset, setNotificationPreset] = useState('3x');

  // Load entries from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('moodTrackerEntries');
      if (saved) {
        setEntries(JSON.parse(saved));
      }
      
      // Load reminder settings
      const savedSettings = localStorage.getItem('reminderSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setRemindersEnabled(settings.enabled || false);
        setReminderInterval(settings.interval || 3);
        setReminderStartTime(settings.startTime || '08:00');
        setReminderEndTime(settings.endTime || '22:00');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  // Initialize notifications on mount
useEffect(() => {
  const inicializarFCM = async () => {
    try {
      const token = await FCMManager.requestPermissionAndGetToken();
      if (token) {
        await FCMManager.saveTokenToFirestore(token);
        FCMManager.setupForegroundListener();
      }
    } catch (error) {
      console.error('Erro ao configurar FCM:', error);
    }
  };
  inicializarFCM();
}, []);

  const allMoods = [
    { id: 'pleno', emoji: '✨', name: 'Pleno(a)', value: 10, color: '#FF8C00' },
    { id: 'empolgado', emoji: '🤩', name: 'Empolgado(a)', value: 9, color: '#FFD700' },
    { id: 'orgulhoso', emoji: '😌', name: 'Orgulhoso(a)', value: 8, color: '#8A2BE2' },
    { id: 'feliz', emoji: '😊', name: 'Feliz', value: 7, color: '#F0E68C' },
    { id: 'amado', emoji: '🥰', name: 'Amado(a)', value: 6, color: '#FF00FF' },
    { id: 'moido_feliz', emoji: '😅', name: 'Moído(a) mas feliz', value: 5, color: '#32CD32' },
    { id: 'esperancoso', emoji: '🌱', name: 'Esperançoso(a)', value: 4, color: '#228B22' },
    { id: 'grato', emoji: '🙏', name: 'Grato(a)', value: 3, color: '#FFB6C1' },
    { id: 'contente', emoji: '🙂', name: 'Contente', value: 2, color: '#87CEEB' },
    { id: 'calmo', emoji: '😌', name: 'Calmo(a)', value: 1, color: '#ADD8E6' },
    { id: 'de_boa', emoji: '😶', name: 'De Boa', value: 0, color: '#D3D3D3' },
    { id: 'entediado', emoji: '🥱', name: 'Entediado(a)', value: -1, color: '#A9A9A9' },
    { id: 'cansado', emoji: '😮‍💨', name: 'Cansado(a)', value: -2, color: '#778899' },
    { id: 'com_fome', emoji: '🤤', name: 'Com Fome', value: -3, color: '#8B4513' },
    { id: 'ansioso', emoji: '😬', name: 'Ansioso(a)', value: -4, color: '#556B2F' },
    { id: 'frustrado', emoji: '😤', name: 'Frustrado(a)', value: -5, color: '#B8860B' },
    { id: 'chateado', emoji: '😕', name: 'Chateado(a)', value: -6, color: '#FF7F50' },
    { id: 'triste', emoji: '😢', name: 'Triste', value: -7, color: '#8A8D91' },
    { id: 'no_limite', emoji: '🤯', name: 'No Limite', value: -8, color: '#FF0000' },
    { id: 'com_raiva', emoji: '😡', name: 'Com Raiva', value: -9, color: '#8B0000' },
    { id: 'abatido', emoji: '🫠', name: 'Abatido(a)', value: -10, color: '#1E3A8A' },
  ];

  const mainMoodIds = ['empolgado', 'feliz', 'moido_feliz', 'calmo', 'de_boa', 'cansado', 'ansioso', 'frustrado', 'no_limite'];
  const mainMoods = mainMoodIds.map(id => allMoods.find(m => m.id === id));

  const moods = showAllEmotions ? allMoods : mainMoods;

  const handleMoodSelect = (moodId) => {
    if (isBlocked) return;
    const selectedMood = moods.find(m => m.id === moodId);
    if (!selectedMood) return;
    setClickedMood(moodId);
    setIsBlocked(true);
    setTimeout(() => {
    
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      moods: [selectedMood.emoji]
    };
    
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    
    try {
      localStorage.setItem('moodTrackerEntries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Error saving:', error);
    }
    
    setSelectedMoods([moodId]);
    setShowNotification(true);

    setTimeout(() => {
      setClickedMood(null);
      setIsBlocked(false);
      setSelectedMoods([]);
      setShowNotification(false);
    }, 1500);
  }, 1000);
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const entryDate = new Date(date);
    
    if (entryDate.toDateString() === today.toDateString()) return 'Hoje';
    if (entryDate.toDateString() === yesterday.toDateString()) return 'Ontem';
    return entryDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  };

  const formatFullDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const groupEntriesByDate = () => {
    const grouped = {};
    entries.forEach(entry => {
      const dateKey = new Date(entry.timestamp).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: formatDate(entry.timestamp),
          fullDate: formatFullDate(entry.timestamp),
          timestamp: entry.timestamp,
          entries: []
        };
      }
      grouped[dateKey].entries.push(entry);
    });

    return Object.values(grouped)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(group => ({
        ...group,
        entries: group.entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      }));
  };

  const handleClearHistory = () => {
    if (window.confirm('Tem certeza que deseja apagar todo o histórico de emoções?')) {
      setEntries([]);
      localStorage.removeItem('moodTrackerEntries');
    }
  };

  const getMoodIntensity = (emoji) => {
    const mood = allMoods.find(m => m.emoji === emoji);
    return mood ? mood.value : 0;
  };

  const getMoodName = (emoji) => {
    const mood = moods.find(m => m.emoji === emoji);
    return mood ? mood.name : '';
  };

  const getGraphFilteredEntries = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (graphPeriod) {
      case 'daily':
        return entries.filter(entry => new Date(entry.timestamp) >= today);
      case 'weekly':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entries.filter(entry => new Date(entry.timestamp) >= weekAgo);
      case 'monthly':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return entries.filter(entry => new Date(entry.timestamp) >= monthAgo);
      case 'yearly':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return entries.filter(entry => new Date(entry.timestamp) >= yearAgo);
      case 'all':
        return entries;
      default:
        return entries;
    }
  };

  const getTimelineData = () => {
    const filtered = getGraphFilteredEntries();
    if (filtered.length === 0) return [];

    const timeData = [];
    filtered.forEach((entry) => {
      const date = new Date(entry.timestamp);
      let key;
      
      if (graphPeriod === 'daily') {
        key = `${date.getHours()}h`;
      } else if (graphPeriod === 'weekly') {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        key = days[date.getDay()];
      } else if (graphPeriod === 'monthly') {
        key = `${date.getDate()}`;
      } else if (graphPeriod === 'yearly') {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        key = months[date.getMonth()];
      } else {
        key = `${date.getDate()}/${date.getMonth() + 1}`;
      }
      
      const emoji = entry.moods[0];
      const intensity = getMoodIntensity(emoji);
      
      timeData.push({
        time: key,
        intensidade: intensity,
        timestamp: entry.timestamp
      });
    });
    
    return timeData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const getFilteredEntries = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (reportType) {
      case 'daily':
        return entries.filter(entry => new Date(entry.timestamp) >= today);
      case 'weekly':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entries.filter(entry => new Date(entry.timestamp) >= weekAgo);
      case 'monthly':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return entries.filter(entry => new Date(entry.timestamp) >= monthAgo);
      case 'yearly':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return entries.filter(entry => new Date(entry.timestamp) >= yearAgo);
      case 'all':
        return entries;
      default:
        return entries;
    }
  };

  const calculateMoodFrequency = () => {
    const filtered = getFilteredEntries();
    const frequency = {};
    
    filtered.forEach(entry => {
      entry.moods.forEach(emoji => {
        frequency[emoji] = (frequency[emoji] || 0) + 1;
      });
    });
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .map(([emoji, count]) => ({ emoji, count }));
  };

  const calculateWeekdayPatterns = () => {
    const filtered = getFilteredEntries();
    const weekdays = {
      0: { name: 'Domingo', moods: {} },
      1: { name: 'Segunda', moods: {} },
      2: { name: 'Terça', moods: {} },
      3: { name: 'Quarta', moods: {} },
      4: { name: 'Quinta', moods: {} },
      5: { name: 'Sexta', moods: {} },
      6: { name: 'Sábado', moods: {} }
    };
    
    filtered.forEach(entry => {
      const day = new Date(entry.timestamp).getDay();
      entry.moods.forEach(emoji => {
        weekdays[day].moods[emoji] = (weekdays[day].moods[emoji] || 0) + 1;
      });
    });
    
    return Object.values(weekdays).map(day => ({
      name: day.name,
      topMoods: Object.entries(day.moods)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([emoji, count]) => ({ emoji, count }))
    }));
  };

  const calculateHourlyPatterns = () => {
    const filtered = getFilteredEntries();
    const hours = {};
    
    filtered.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      let period;
      
      if (hour >= 0 && hour < 6) period = 'Madrugada';
      else if (hour >= 6 && hour < 12) period = 'Manhã';
      else if (hour >= 12 && hour < 18) period = 'Tarde';
      else period = 'Noite';
      
      if (!hours[period]) hours[period] = {};
      entry.moods.forEach(emoji => {
        hours[period][emoji] = (hours[period][emoji] || 0) + 1;
      });
    });
    
    return ['Madrugada', 'Manhã', 'Tarde', 'Noite'].map(period => ({
      period,
      topMoods: hours[period] 
        ? Object.entries(hours[period])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([emoji, count]) => ({ emoji, count }))
        : []
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 font-['Space_Grotesk']">
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      
      {/* CONTAINER MESTRE (CHASSI) - Dimensões travadas, overflow hidden */}
      <div className="w-full min-h-screen bg-white overflow-hidden flex flex-col transition-all duration-300">
        
        {/* Notification Toast - Positioned absolute inside chassis */}
        {showNotification && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-[slideDown_0.3s_ease-out]">
            <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
            <span className="font-medium">Registrado!</span>
          </div>
        )}

        {/* TOPO FIXO (flex-none) - Nunca rola */}
        <div className="flex-none bg-gradient-to-r from-rose-400 to-orange-400 px-5 py-4 text-white flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold font-['DM_Serif_Display'] tracking-tight">
              Autoconhecimento Emocional
            </h1>
            <p className="text-rose-50 mt-0.5 text-xs">Registre suas emoções diárias</p>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors mb-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* CONTEÚDO CENTRAL (flex-1 + overflow-y-auto) - ÚNICA área que rola */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          
          {activeTab === 'register' && (
            <div className="p-4 bg-white min-h-full flex flex-col justify-center animate-[fadeIn_0.3s_ease-out]">
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-gray-800 text-center">
                  Como você está se sentindo aqui e agora?
                </h2>
                
                <div className="grid grid-cols-3 gap-2">
                {moods.map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => handleMoodSelect(mood.id)}
                    style={clickedMood === mood.id ? { backgroundColor: allMoods.find(m => m.id === mood.id)?.color + '44' } : {}}
                    className={`
                      border-2 rounded-xl p-2 flex flex-col items-center gap-1 transition-all duration-200
                      ${clickedMood === mood.id
                        ? 'border-current scale-95 shadow-md'
                        : selectedMoods.includes(mood.id)
                        ? 'border-current scale-95 shadow-md'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm active:scale-95'
                      }
                    `}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className={`font-medium text-xs ${clickedMood === mood.id || selectedMoods.includes(mood.id) ? 'text-gray-800' : 'text-gray-600'}`}>
                      {mood.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Expand/Collapse Button */}
              <button
                onClick={() => {
                  const next = !showAllEmotions;
                  setShowAllEmotions(next);
                  localStorage.setItem('showAllEmotions', next);
                }}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-all text-sm font-medium"
              >
                {showAllEmotions ? '− Menos emoções' : '+ Mais emoções'}
              </button>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="p-4 space-y-4 animate-[fadeIn_0.3s_ease-out] bg-white min-h-full">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Relatórios</h2>
                {entries.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-gray-500 hover:text-red-500 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {entries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-500 text-sm">
                    Nenhum registro ainda.<br />
                    Comece registrando suas emoções!
                  </p>
                </div>
              ) : (
                <>
                  {/* Sub-tabs for Reports */}
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
                    {[
                      { id: 'frequency', label: 'Frequência' },
                      { id: 'weekday', label: 'Dia da Semana' },
                      { id: 'hourly', label: 'Por Horário' },
                      { id: 'history', label: 'Histórico' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setReportSubTab(tab.id)}
                        className={`
                          flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all whitespace-nowrap
                          ${reportSubTab === tab.id
                            ? 'bg-white text-gray-800 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                          }
                        `}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Period Selector for Frequency */}
                  {reportSubTab === 'frequency' && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {[
                        { id: 'daily', label: 'Diário' },
                        { id: 'weekly', label: 'Semanal' },
                        { id: 'monthly', label: 'Mensal' },
                        { id: 'yearly', label: 'Anual' },
                        { id: 'all', label: 'Completo' }
                      ].map(type => (
                        <button
                          key={type.id}
                          onClick={() => setReportType(type.id)}
                          className={`
                            px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all
                            ${reportType === type.id
                              ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }
                          `}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Frequency Sub-tab with colored bars */}
                  {reportSubTab === 'frequency' && (
                    <div className="bg-white rounded-2xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-4">Frequência de Emoções</h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {calculateMoodFrequency().map(({ emoji, count }) => {
                          const maxCount = Math.max(...calculateMoodFrequency().map(m => m.count));
                          const percentage = (count / maxCount) * 100;
                          const mood = allMoods.find(m => m.emoji === emoji);
                          
                          // Extract color from Tailwind class (e.g., 'bg-amber-200' -> '#fbbf24')
                          const colorMap = {
                            'yellow': '#fbbf24',
                            'pink': '#ec4899',
                            'orange': '#fb923c',
                            'amber': '#fbbf24',
                            'rose': '#fb7185',
                            'teal': '#14b8a6',
                            'sky': '#38bdf8',
                            'emerald': '#10b981',
                            'green': '#22c55e',
                            'slate': '#94a3b8',
                            'stone': '#a8a29e',
                            'gray': '#9ca3af',
                            'purple': '#a855f7',
                            'fuchsia': '#d946ef',
                            'blue': '#3b82f6',
                            'red': '#ef4444',
                            'indigo': '#6366f1'
                          };
                          
                          const colorKey = mood ? mood.color.split('-')[1] : 'gray';
                          const barColor = colorMap[colorKey] || '#9ca3af';
                          
                          return (
                            <div key={emoji} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{emoji}</span>
                                  <span className="text-gray-700 font-medium text-xs">{getMoodName(emoji)}</span>
                                </div>
                                <span className="font-semibold text-gray-800 text-xs">{count}x</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${percentage}%`,
                                    backgroundColor: barColor
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Weekday Pattern Sub-tab */}
                  {reportSubTab === 'weekday' && (
                    <div className="bg-white rounded-2xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-4">Padrões por Dia da Semana</h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {calculateWeekdayPatterns().map((day, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3">
                            <p className="font-semibold text-gray-700 text-sm mb-2">{day.name}</p>
                            {day.topMoods.length > 0 ? (
                              <div className="flex gap-3">
                                {day.topMoods.map((mood, i) => (
                                  <div key={i} className="flex items-center gap-1">
                                    <span className="text-2xl">{mood.emoji}</span>
                                    <span className="text-xs text-gray-600">{mood.count}x</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400">Sem registros</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hourly Pattern Sub-tab */}
                  {reportSubTab === 'hourly' && (
                    <div className="bg-white rounded-2xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-4">Padrões por Horário</h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {calculateHourlyPatterns().map((period, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3">
                            <p className="font-semibold text-gray-700 text-sm mb-2">
                              {period.period === 'Madrugada' && '🌃 '}
                              {period.period === 'Manhã' && '🌅 '}
                              {period.period === 'Tarde' && '☀️ '}
                              {period.period === 'Noite' && '🌙 '}
                              {period.period}
                            </p>
                            {period.topMoods.length > 0 ? (
                              <div className="flex gap-3">
                                {period.topMoods.map((mood, i) => (
                                  <div key={i} className="flex items-center gap-1">
                                    <span className="text-2xl">{mood.emoji}</span>
                                    <span className="text-xs text-gray-600">{mood.count}x</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400">Sem registros</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* History Sub-tab */}
                  {reportSubTab === 'history' && (
                    <div className="bg-white rounded-2xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-4">Histórico Detalhado</h4>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {groupEntriesByDate().map((day, dayIndex) => (
                          <div key={dayIndex} className="space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-semibold text-gray-700">{day.date}</span>
                              <span className="text-gray-400">• {day.fullDate}</span>
                            </div>
                            <div className="space-y-2">
                              {day.entries.map((entry) => (
                                <div key={entry.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                  <span className="text-xs font-medium text-gray-600 min-w-[45px]">
                                    {formatTime(entry.timestamp)}
                                  </span>
                                  <div className="flex gap-1">
                                    {entry.moods.map((emoji, idx) => (
                                      <span key={idx} className="text-xl">{emoji}</span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'graphs' && (
            <div className="p-4 space-y-4 animate-[fadeIn_0.3s_ease-out] bg-white min-h-full">
              <h2 className="text-lg font-semibold text-gray-800">Gráficos</h2>

              {entries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📈</div>
                  <p className="text-gray-500 text-sm">
                    Nenhum registro ainda.<br />
                    Comece registrando suas emoções!
                  </p>
                </div>
              ) : (
                <>
                  {/* Period Selector */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {[
                      { id: 'daily', label: 'Diário' },
                      { id: 'weekly', label: 'Semanal' },
                      { id: 'monthly', label: 'Mensal' },
                      { id: 'yearly', label: 'Anual' },
                      { id: 'all', label: 'Completo' }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setGraphPeriod(type.id)}
                        className={`
                          px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all
                          ${graphPeriod === type.id
                            ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Evolution Chart */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Evolução de Humor</h4>
                    
                    <ResponsiveContainer width="100%" height={520}>
                      <LineChart data={getTimelineData()} margin={{ top: 20, right: 20, left: 85, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} />
                        <YAxis 
                          domain={[-11, 11]}
                          ticks={[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10]}
                          tick={(props) => {
                            const { x, y, payload } = props;
                            const emotionMap = {
                              10: 'Radiante', 9: 'Amado', 8: 'Alegre', 7: 'Empolgado', 6: 'Orgulhoso',
                              5: 'Feliz', 4: 'Esperançoso', 3: 'Grato', 2: 'Contente', 1: 'Calmo',
                              0: 'Neutro',
                              '-1': 'Entediado', '-2': 'Cansado', '-3': 'Confuso', '-4': 'Preocupado',
                              '-5': 'Ansioso', '-6': 'Estressado', '-7': 'Frustrado', '-8': 'Triste',
                              '-9': 'Irritado', '-10': 'Deprimido'
                            };
                            const label = emotionMap[payload.value];
                            const isNeutral = payload.value === 0;
                            
                            return (
                              <g>
                                {isNeutral && (
                                  <rect
                                    x={x - 80}
                                    y={y - 10}
                                    width={75}
                                    height={20}
                                    fill="#e5e7eb"
                                    rx={4}
                                  />
                                )}
                                <text 
                                  x={x - 5} 
                                  y={y} 
                                  textAnchor="end" 
                                  fill={isNeutral ? '#1f2937' : '#6b7280'}
                                  fontSize="8"
                                  fontWeight={isNeutral ? 'bold' : 'normal'}
                                  dominantBaseline="middle"
                                >
                                  {label}
                                </text>
                              </g>
                            );
                          }}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const value = payload[0].value;
                              const emotionMap = {
                                10: 'Radiante', 9: 'Amado', 8: 'Alegre', 7: 'Empolgado', 6: 'Orgulhoso',
                                5: 'Feliz', 4: 'Esperançoso', 3: 'Grato', 2: 'Contente', 1: 'Calmo',
                                0: 'Neutro',
                                '-1': 'Entediado', '-2': 'Cansado', '-3': 'Confuso', '-4': 'Preocupado',
                                '-5': 'Ansioso', '-6': 'Estressado', '-7': 'Frustrado', '-8': 'Triste',
                                '-9': 'Irritado', '-10': 'Deprimido'
                              };
                              return (
                                <div className="bg-white px-3 py-2 rounded-lg shadow-lg border">
                                  <p className="font-semibold text-sm">{emotionMap[Math.round(value)]}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <ReferenceLine y={0} stroke="#374151" strokeWidth={2} label="NEUTRO" />
                        <Line 
                          type="monotone"
                          dataKey="intensidade"
                          stroke="#f97316"
                          strokeWidth={2.5}
                          dot={(props) => {
                            const { cx, cy, payload } = props;
                            const color = payload.intensidade >= 0 ? '#16a34a' : '#dc2626';
                            return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />;
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>

                    <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 text-center">
                        Aqui podemos adicionar outras visualizações no futuro
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* RODAPÉ FIXO (flex-none) - Nunca rola */}
        <div className="flex-none bg-white border-t border-gray-200 px-2 py-3">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'register' ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar size={20} strokeWidth={2.5} />
              <span className="text-xs font-semibold">Registrar</span>
            </button>
            
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'reports' ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Activity size={20} strokeWidth={2.5} />
              <span className="text-xs font-semibold">Relatórios</span>
            </button>

            <button
              onClick={() => setActiveTab('graphs')}
              className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'graphs' ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={20} strokeWidth={2.5} />
              <span className="text-xs font-semibold">Gráficos</span>
            </button>
          </div>
        </div>

       {/* SETTINGS MODAL */}
        {showSettings && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[600px] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Configurações de Lembretes</h3>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <span className="text-gray-500 text-xl">×</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Status de Permissão */}
                {notificationPermission === 'denied' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      ⚠️ Notificações bloqueadas pelo navegador. 
                      Ative nas configurações do seu navegador.
                    </p>
                  </div>
                )}

                {notificationPermission === 'default' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800 mb-2">
                      📬 Precisamos da sua permissão para enviar lembretes
                    </p>
                    <button
                      onClick={async () => {
                        const granted = false; // await NotificationManager.requestPermission();
                        setNotificationPermission(granted ? 'granted' : 'denied');
                      }}
                      className="w-full py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600"
                    >
                      Permitir Notificações
                    </button>
                  </div>
                )}

                {/* Frequência de Notificações */}
                {notificationPermission === 'granted' && (
                  <>
                    <div>
                      <label className="block font-semibold text-gray-800 text-sm mb-3">
                        Frequência de Lembretes
                      </label>
                      <div className="space-y-2">
                        {/* 3x ao dia - Recomendado */}
                        <button
                          onClick={() => setNotificationPreset('3x')}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                            notificationPreset === '3x'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm">3x ao dia 🌟</div>
                              <div className="text-xs text-gray-500">Manhã (8h), Tarde (14h), Noite (20h)</div>
                            </div>
                            {notificationPreset === '3x' && (
                              <span className="text-orange-500">✓</span>
                            )}
                          </div>
                        </button>

                        {/* 2x ao dia */}
                        <button
                          onClick={() => setNotificationPreset('2x')}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                            notificationPreset === '2x'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm">2x ao dia</div>
                              <div className="text-xs text-gray-500">Meio-dia (12h), Noite (20h)</div>
                            </div>
                            {notificationPreset === '2x' && (
                              <span className="text-orange-500">✓</span>
                            )}
                          </div>
                        </button>

                        {/* 1x ao dia */}
                        <button
                          onClick={() => setNotificationPreset('1x')}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                            notificationPreset === '1x'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm">1x ao dia</div>
                              <div className="text-xs text-gray-500">Noite (20h)</div>
                            </div>
                            {notificationPreset === '1x' && (
                              <span className="text-orange-500">✓</span>
                            )}
                          </div>
                        </button>

                        {/* Personalizado */}
                        <button
                          onClick={() => setNotificationPreset('custom')}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                            notificationPreset === 'custom'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm">Personalizado ⚙️</div>
                              <div className="text-xs text-gray-500">Configure seus próprios horários</div>
                            </div>
                            {notificationPreset === 'custom' && (
                              <span className="text-orange-500">✓</span>
                            )}
                          </div>
                        </button>

                        {/* Desligado */}
                        <button
                          onClick={() => setNotificationPreset('off')}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                            notificationPreset === 'off'
                              ? 'border-gray-400 bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm">Desligado</div>
                              <div className="text-xs text-gray-500">Você pode registrar manualmente quando quiser</div>
                            </div>
                            {notificationPreset === 'off' && (
                              <span className="text-gray-500">✓</span>
                            )}
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Configuração Personalizada */}
                    {notificationPreset === 'custom' && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Horários Personalizados</p>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Intervalo entre lembretes</label>
                          <select
                            value={reminderInterval}
                            onChange={(e) => setReminderInterval(parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value={0.05}>A cada 3 minutos</option>
                            <option value={0.5}>A cada 30 minutos</option>
                            <option value={1}>A cada 1 hora</option>
                            <option value={2}>A cada 2 horas</option>
                            <option value={3}>A cada 3 horas</option>
                            <option value={4}>A cada 4 horas</option>
                            <option value={6}>A cada 6 horas</option>
                            <option value={8}>A cada 8 horas</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Início</label>
                            <input
                              type="time"
                              value={reminderStartTime}
                              onChange={(e) => setReminderStartTime(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Fim</label>
                            <input
                              type="time"
                              value={reminderEndTime}
                              onChange={(e) => setReminderEndTime(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Botão Salvar */}
 <button
                  onClick={() => {
                    // 1. Guardamos as configurações na memória do navegador
                    const dadosParaSalvar = {
                      interval: reminderInterval,
                      startTime: reminderStartTime,
                      endTime: reminderEndTime,
                      preset: notificationPreset
                    };
                    localStorage.setItem('reminderSettings', JSON.stringify(dadosParaSalvar));
                    localStorage.setItem('notificationPreset', notificationPreset);
                    localStorage.setItem('reminderInterval', reminderInterval);
localStorage.setItem('reminderStartTime', reminderStartTime);
localStorage.setItem('reminderEndTime', reminderEndTime);

                    // 2. Calculamos os horários das notificações
                    let settings;
                    if (notificationPreset === '3x') {
                      settings = { enabled: true, times: ['08:00', '14:00', '20:00'] };
                    } else if (notificationPreset === '2x') {
                      settings = { enabled: true, times: ['12:00', '20:00'] };
                    } else if (notificationPreset === '1x') {
                      settings = { enabled: true, times: ['20:00'] };
                    } else if (notificationPreset === 'custom') {
                      const times = [];
                      const [startHour, startMin] = reminderStartTime.split(':').map(Number);
                      const [endHour, endMin] = reminderEndTime.split(':').map(Number);
                      let currentMinutes = startHour * 60 + startMin;
                      const endMinutes = endHour * 60 + endMin;
                      const intervalMinutes = reminderInterval * 60;
                      while (currentMinutes <= endMinutes) {
                        const hours = Math.floor(currentMinutes / 60);
                        const mins = currentMinutes % 60;
                        times.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
                        currentMinutes += intervalMinutes;
                      }
                      settings = { enabled: true, times };
                    } else {
                      settings = { enabled: false, times: [] };
                    }

                    // 3. Ativamos os lembretes
                    if (notificationPermission === 'granted' && settings.enabled) {
                      // NotificationManager.scheduleNotifications(settings);
                    } else {
                      // NotificationManager.clearSchedule();
                    }

                    setShowSettings(false);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
                >
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

export default MoodTracker;