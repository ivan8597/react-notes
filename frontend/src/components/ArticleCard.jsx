import React from 'react';
import { isAuthenticated } from '../utils/auth';
import { deleteArticle } from '../api';
import { notify } from '../App';

const ArticleCard = ({ article, onClick, onDelete }) => {
  // Проверяем авторизацию
  const isLoggedIn = isAuthenticated();
  console.log('Статус авторизации в ArticleCard:', isLoggedIn);
  console.log('Наличие функции onDelete:', !!onDelete);
  
  // Проверяем, является ли автор объектом или строкой
  const authorName = article.author && typeof article.author === 'object' 
    ? article.author.username 
    : article.author;
    
  // Вычисляем дату публикации
  const publishDate = article.createdAt 
    ? new Date(article.createdAt).toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : '';
    
  // Очищаем HTML теги из контента для превью
  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };
  
  // Создаем превью текста
  const contentPreview = article.summary || 
    (article.content ? stripHtml(article.content).substring(0, 150) + '...' : '');
    
  // Определяем URL изображения 
  const imageUrl = article.image 
    ? `http://localhost:5001/${article.image}` 
    : '/no-image.jpg'; // Локальная заглушка
    
  // Функция для создания заглушки изображения с текстом "Нет изображения"
  const createPlaceholderBackground = () => {
    if (article.image) {
      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    } else {
      return {
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontSize: '16px',
        fontWeight: 'normal'
      };
    }
  };
  
  // Функция выполнения удаления
  const executeDelete = () => {

    notify.info('Удаление статьи...');
    
    deleteArticle(article._id)
      .then(() => {
        
        notify.success('Статья успешно удалена!');
        
        // Вызываем обработчик удаления
        if (onDelete) {
          onDelete(article._id);
        }
      })
      .catch(error => {
        console.error('Ошибка при удалении статьи:', error);
        
       
        notify.error(
          error.response?.data?.message || 
          'Не удалось удалить статью. Проверьте права доступа.'
        );
      });
  };
     
  // Обработчик удаления статьи с toast-уведомлением 
  const handleDelete = (e) => {
    e.stopPropagation(); 
    
    try {
      notify.confirm({
        title: 'Подтверждение удаления',
        message: `Вы уверены, что хотите удалить статью "${article.title}"?`,
        onConfirm: executeDelete,
        onCancel: () => console.log('Удаление отменено')
      });
    } catch (error) {
      console.error('Ошибка при показе диалога подтверждения:', error);
      

      if (window.confirm(`Вы уверены, что хотите удалить статью "${article.title}"?`)) {
        executeDelete();
      }
    }
  };

  const placeholderStyle = createPlaceholderBackground();

  return (
    <div
      className="article-card"
      onClick={() => onClick(article)}
      style={{
        border: '1px solid #eaeaea',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      }}
    >
      <div 
        style={{ 
          height: '200px',
          borderBottom: '1px solid #eaeaea',
          ...placeholderStyle
        }}
      >
        {!article.image && "Нет изображения"}
      </div>
      
      <div style={{ padding: '16px' }}>
        <h3 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#333' 
        }}>
          {article.title}
        </h3>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: '10px',
          fontSize: '14px',
          color: '#666'
        }}>
          <span style={{ 
            backgroundColor: '#f0f0f0', 
            padding: '3px 8px', 
            borderRadius: '12px',
            marginRight: '10px'
          }}>
            {authorName || 'Неизвестный автор'}
          </span>
          <span>{publishDate}</span>
          
          {/* Индикатор наличия файлов */}
          {article.files && article.files.length > 0 && (
            <span style={{ 
              marginLeft: '10px',
              display: 'flex',
              alignItems: 'center',
              color: '#0066cc',
              fontSize: '13px'
            }}>
              <span role="img" aria-label="Файлы" style={{ marginRight: '4px' }}>📎</span>
              {article.files.length} {article.files.length === 1 ? 'файл' : 
                (article.files.length >= 2 && article.files.length <= 4) ? 'файла' : 'файлов'}
            </span>
          )}
        </div>
        
        <p style={{ 
          margin: '0', 
          fontSize: '14px', 
          color: '#666',
          lineHeight: '1.5'
        }}>
          {contentPreview}
        </p>
        
        <div style={{
          marginTop: '15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontSize: '13px', 
            color: '#0066cc', 
            fontWeight: '500'
          }}>
            Читать далее →
          </span>
          
          {isLoggedIn && (
            <button
              onClick={handleDelete}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.stopPropagation();
                e.currentTarget.style.backgroundColor = '#d32f2f';
              }}
              onMouseOut={(e) => {
                e.stopPropagation();
                e.currentTarget.style.backgroundColor = '#f44336';
              }}
            >
              Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArticleCard;