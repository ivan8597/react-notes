// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticlePage from './pages/ArticlePage';
import EditorPage from './pages/EditorPage';
import ProtectedRoute from './components/ProtectedRoute';
import Logout from './components/Logout';
import Notifications from './components/Notifications';
import { isAuthenticated } from './utils/auth';

// Стили для React-Toastify
import './toast-styles.css';

// Утилита для уведомлений
export const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast.info(message),
  warning: (message) => toast.warning(message),
  
  // Для отображения  подтверждения
  confirm: ({ title, message, onConfirm, onCancel }) => {
    const toastId = "confirm-" + Date.now();
    
    toast(
      <div>
        {title && <h4 style={{ marginBottom: '8px', marginTop: 0 }}>{title}</h4>}
        <p style={{ marginBottom: '12px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              toast.dismiss(toastId);
              if (onCancel) onCancel();
            }}
            style={{
              backgroundColor: '#e0e0e0',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Отмена
          </button>
          <button
            onClick={() => {
              toast.dismiss(toastId);
              if (onConfirm) onConfirm();
            }}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Подтвердить
          </button>
        </div>
      </div>,
      {
        toastId,
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
        position: "top-center",
        className: 'confirmation-toast'
      }
    );
  }
};

export default function App() {
  const isLoggedIn = isAuthenticated();
  console.log('Статус авторизации в App:', isLoggedIn);

  return (
    <div>
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '10px 20px',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd'
      }}>
        <div>
          <a href="/" style={{ marginRight: '15px', textDecoration: 'none', color: '#333' }}>Статьи</a>
          <a href="/editor" style={{ textDecoration: 'none', color: '#333' }}>Редактор</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isLoggedIn && <Notifications />}
          <Logout />
        </div>
      </nav>
      
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<ArticlePage />} />
          
          {/* Защищенные маршруты для авторизованных пользователей */}
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/articles/:id/edit"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* Добавляем контейнер для уведомлений */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}