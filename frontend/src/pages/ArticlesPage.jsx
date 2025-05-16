import React, { useEffect, useState } from 'react';
import ArticleList from '../components/ArticleList';
import { getArticles } from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { notify } from '../App';

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = isAuthenticated();
  console.log('Статус авторизации в ArticlesPage:', isLoggedIn);

  // Функция загрузки статей
  const loadArticles = () => {
    setLoading(true);
    setError(null);
    
    getArticles()
      .then(data => {
        console.log('Полученные статьи:', data);
        setArticles(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Ошибка при получении статей:', error);
        const errorMessage = error.response?.data?.message || 'Не удалось загрузить статьи. Пожалуйста, попробуйте позже.';
        setError(errorMessage);
        notify.error(errorMessage);
        setLoading(false);
      });
  };

  // Загрузка статей при монтировании компонента и при возвращении на эту страницу
  useEffect(() => {
    loadArticles();
  }, [location.key]); // location.key изменяется при навигации

  // Обработчик удаления статьи
  const handleDeleteArticle = (articleId) => {
    console.log('Вызван handleDeleteArticle с id:', articleId);
    // Удаляем статью из локального состояния
    setArticles(articles.filter(article => article._id !== articleId));
    console.log('Статья успешно удалена:', articleId);
  };

  // Стили для компонентов страницы
  const styles = {
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      borderBottom: '1px solid #eaeaea',
      paddingBottom: '20px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#333',
      margin: 0
    },
    subtitle: {
      fontSize: '16px',
      color: '#666',
      marginTop: '5px'
    },
    addButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '10px 20px',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'background-color 0.2s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    refreshButton: {
      backgroundColor: '#2196F3',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '8px 15px',
      fontSize: '14px',
      cursor: 'pointer',
      marginRight: '10px',
      display: 'flex',
      alignItems: 'center'
    },
    icon: {
      marginRight: '8px',
      fontSize: '16px'
    },
    loadingContainer: {
      textAlign: 'center', 
      padding: '50px',
      color: '#666'
    },
    errorContainer: {
      backgroundColor: '#ffebee',
      color: '#d32f2f',
      padding: '15px',
      borderRadius: '4px',
      marginBottom: '20px'
    }
  };

  return (
    <div>
      {/* Заголовок и кнопка добавления */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Список статей</h1>
          <div style={styles.subtitle}>
            Всего статей: {articles.length}
          </div>
        </div>
        
        <div style={{ display: 'flex' }}>
          <button 
            onClick={loadArticles}
            style={styles.refreshButton}
            title="Обновить список статей"
          >
            <span style={styles.icon}>🔄</span>
            Обновить
          </button>
          
          <button 
            onClick={() => {
              if (isLoggedIn) {
                navigate('/editor');
              } else {
                notify.warning('Для добавления статьи необходимо авторизоваться');
                navigate('/login');
              }
            }} 
            style={styles.addButton}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#43a047'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
          >
            <span style={styles.icon}>+</span>
            Добавить статью
          </button>
        </div>
      </div>
      
      {/* Отображение ошибки */}
      {error && (
        <div style={styles.errorContainer}>
          {error}
        </div>
      )}
      
    
      {loading ? (
        <div style={styles.loadingContainer}>
          <div>Загрузка статей...</div>
        </div>
      ) : (
        /* Список статей */
        <ArticleList
          articles={articles}
          onArticleClick={article => navigate(`/articles/${article._id}`)}
          onDeleteArticle={handleDeleteArticle}
        />
      )}
    </div>
  );
}

export default ArticlesPage;