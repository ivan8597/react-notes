import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';
import { notify } from '../App';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    
    if (password.length < 5) {
      setError('Пароль должен содержать не менее 5 символов');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register({ username, email, password });
      notify.success('Регистрация успешно завершена! Теперь вы можете войти в систему.');
      navigate('/login'); // Перенаправление на страницу входа
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка регистрации');
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
    },
    passwordRequirements: {
      fontSize: '12px',
      color: '#666',
      marginTop: '5px',
      fontStyle: 'italic'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Регистрация</h2>
        <p style={{ color: '#666', marginTop: '10px' }}>
          Создайте аккаунт для доступа к платформе
        </p>
      </div>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Имя пользователя:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
            placeholder="Введите имя пользователя"
          />
        </div>
        
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
            placeholder="Введите пароль"
          />
          <div style={styles.passwordRequirements}>
            Пароль должен содержать минимум 5 символов
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Подтвердите пароль:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="Повторите пароль"
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
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
      
      <div style={styles.footer}>
        Уже есть аккаунт? <Link to="/login" style={styles.link}>Войти</Link>
      </div>
    </div>
  );
}

export default RegisterPage;