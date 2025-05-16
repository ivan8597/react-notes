import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { saveToken } from '../utils/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      
      console.log('Отправляем запрос авторизации:', { email, passwordLength: password.length });
      
      const response = await login({ email, password });
      console.log('Ответ сервера:', response);
      
      if (response.token) {
        console.log('Токен получен:', response.token.substring(0, 15) + '...');
        
        // Сохраняем токен
        saveToken(response.token);
        
        // Проверяем сохранение
        const savedToken = localStorage.getItem('token');
        console.log('Токен в localStorage после сохранения:', 
          savedToken ? savedToken.substring(0, 15) + '...' : 'токен не сохранен!');
        
        // Добавляем небольшую задержку перед редиректом
        setTimeout(() => {
          navigate('/editor'); // Указываем куда перенаправлять
        }, 100);
      } else {
        console.error('Токен отсутствует в ответе:', response);
        setError('Ошибка авторизации. Токен не получен.');
      }
    } catch (error) {
      console.error('Ошибка при попытке входа:', error);
      setError(error.response?.data?.message || 'Ошибка входа в систему');
    } finally {
      setLoading(false);
    }
  };


  const styles = {
    container: {
      maxWidth: '400px',
      margin: '40px auto',
      padding: '30px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#333'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#555'
    },
    input: {
      padding: '12px 16px',
      fontSize: '16px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      transition: 'border-color 0.2s',
      outline: 'none'
    },
    button: {
      padding: '12px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      marginTop: '10px'
    },
    error: {
      backgroundColor: '#ffebee',
      color: '#d32f2f',
      padding: '12px',
      borderRadius: '4px',
      fontSize: '14px',
      marginBottom: '20px'
    },
    footer: {
      marginTop: '30px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#666'
    },
    link: {
      color: '#4CAF50',
      textDecoration: 'none',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Вход в систему</h2>
        <p style={{ color: '#666', marginTop: '10px' }}>
          Войдите в свой аккаунт для доступа к вашим статьям
        </p>
      </div>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="Введите ваш email"
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="Введите ваш пароль"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Выполняется вход...' : 'Войти'}
        </button>
      </form>
      
      <div style={styles.footer}>
        Ещё нет аккаунта? <Link to="/register" style={styles.link}>Зарегистрироваться</Link>
      </div>
    </div>
  );
}


export default LoginPage;