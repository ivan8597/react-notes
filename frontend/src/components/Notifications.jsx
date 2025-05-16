import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';


const notificationStyles = {
  container: {
    position: 'relative',
    display: 'inline-block',
    marginRight: '20px'
  },
  bell: {
    fontSize: '24px',
    cursor: 'pointer',
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-10px',
    backgroundColor: 'red',
    color: 'white',
    borderRadius: '50%',
    padding: '3px 6px',
    fontSize: '12px'
  },
  dropdown: {
    position: 'absolute',
    top: '30px',
    right: '-15px',
    width: '300px',
    maxHeight: '400px',
    overflowY: 'auto',
    backgroundColor: 'white',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    borderRadius: '4px',
    zIndex: 1000,
    padding: '10px 0'
  },
  notification: {
    padding: '10px 15px',
    borderBottom: '1px solid #eee',
    cursor: 'pointer'
  },
  notificationTitle: {
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  notificationTime: {
    fontSize: '12px',
    color: '#888'
  },
  unread: {
    backgroundColor: '#f0f7ff'
  },
  noNotifications: {
    padding: '15px',
    textAlign: 'center',
    color: '#888'
  },
  error: {
    color: 'red',
    fontSize: '12px'
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [socketError, setSocketError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Подключение к Socket.IO при монтировании компонента
  useEffect(() => {
    console.log('Попытка подключения к Socket.IO серверу...');
    
    // Опции подключения
    const socketOptions = {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Сначала пробуем websocket, потом polling
      reconnectionAttempts: 5, // Количество попыток переподключения
      reconnectionDelay: 1000, // Задержка между попытками в мс
      timeout: 20000 // Максимальное время ожидания подключения
    };
    
    const socket = io('http://localhost:5001', socketOptions);
    
    // Обработчики соединения
    socket.on('connect', () => {
      console.log('Socket.IO подключен успешно, ID:', socket.id);
      setIsConnected(true);
      setSocketError(null);
    });
    
    socket.on('connect_error', (err) => {
      console.error('Ошибка подключения к Socket.IO:', err.message);
      setSocketError(`Ошибка соединения: ${err.message}`);
      setIsConnected(false);
    });
    
    // Обработчики событий от сервера
    socket.on('newsCreated', (news) => {
      console.log('Получено событие newsCreated:', news);
      const newNotification = {
        id: Date.now(),
        type: 'created',
        title: news.title,
        message: 'Создана новая статья',
        newsId: news._id,
        timestamp: new Date(),
        read: false
      };
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    
    socket.on('newsUpdated', (news) => {
      console.log('Получено событие newsUpdated:', news);
      const newNotification = {
        id: Date.now(),
        type: 'updated',
        title: news.title,
        message: 'Статья обновлена',
        newsId: news._id,
        timestamp: new Date(),
        read: false
      };
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    
    socket.on('newsDeleted', (data) => {
      console.log('Получено событие newsDeleted:', data);
      const newNotification = {
        id: Date.now(),
        type: 'deleted',
        message: 'Статья удалена',
        timestamp: new Date(),
        read: false
      };
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    
    // Очистка при размонтировании
    return () => {
      console.log('Отключение от Socket.IO сервера...');
      socket.disconnect();
    };
  }, []);
  
  // Обработчик клика вне выпадающего списка для его закрытия
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Открытие/закрытие выпадающего списка уведомлений
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Помечаем все уведомления как прочитанные при открытии
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      setUnreadCount(0);
    }
  };
  
  // Обработчик клика по уведомлению
  const handleNotificationClick = (notification) => {
    setIsOpen(false);
    
    // Если статья ещё существует переходим к ней
    if (notification.type !== 'deleted' && notification.newsId) {
      navigate(`/articles/${notification.newsId}`);
    }
  };
  
  // Форматирование времени для отображения
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <div style={notificationStyles.container} ref={dropdownRef}>
      <div style={notificationStyles.bell} onClick={toggleDropdown}>
        <span role="img" aria-label="Уведомления">
          {isConnected ? '🔔' : '🔕'}
        </span>
        {unreadCount > 0 && <div style={notificationStyles.badge}>{unreadCount}</div>}
      </div>
      
      {isOpen && (
        <div style={notificationStyles.dropdown}>
          <h3 style={{ padding: '0 15px', margin: '10px 0' }}>Уведомления</h3>
          
          {socketError && (
            <div style={notificationStyles.error}>
              {socketError}
            </div>
          )}
          
          {notifications.length === 0 ? (
            <div style={notificationStyles.noNotifications}>
              {isConnected ? 'Нет новых уведомлений' : 'Отключено от сервера уведомлений'}
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id}
                style={{
                  ...notificationStyles.notification,
                  ...(notification.read ? {} : notificationStyles.unread)
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div style={notificationStyles.notificationTitle}>
                  {notification.title || 'Уведомление о статье'}
                </div>
                <div>{notification.message}</div>
                <div style={notificationStyles.notificationTime}>
                  {formatTime(notification.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 

export default Notifications;