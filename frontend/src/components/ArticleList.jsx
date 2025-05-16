import React, { useState } from 'react';
import ArticleCard from './ArticleCard';


const ArticleList = ({ articles, onArticleClick, onDeleteArticle }) => {
  const [filter, setFilter] = useState('');
  const [author, setAuthor] = useState('');

  // Добавим отладочный вывод для проверки onDeleteArticle
  console.log('ArticleList получил onDeleteArticle:', !!onDeleteArticle);

  const filtered = articles.filter(a => {
    // Получаем название статьи безопасно
    const title = a.title ? a.title.toLowerCase() : '';
    
    // Получаем имя автора безопасно
    let authorName = '';
    if (a.author) {
      // Если author - это объект с полем username
      if (typeof a.author === 'object' && a.author.username) {
        authorName = a.author.username.toLowerCase();
      } 
      // Если author - это строка
      else if (typeof a.author === 'string') {
        authorName = a.author.toLowerCase();
      }
    }
    
    return title.includes(filter.toLowerCase()) && 
           authorName.includes(author.toLowerCase());
  });

  // Стили для компонентов фильтрации
  const filterStyles = {
    container: {
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    title: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '15px',
      color: '#333'
    },
    inputGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px',
      marginBottom: '15px'
    },
    inputWrapper: {
      flex: '1 1 200px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontSize: '14px',
      color: '#666'
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      fontSize: '14px'
    },
    clearButton: {
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '8px 15px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      color: '#666'
    }
  };

  const gridStyles = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px'
    }
  };

  // Функция очистки всех фильтров
  const clearFilters = () => {
    setFilter('');
    setAuthor('');
  };

  return (
    <div>
      {/* Секция фильтрации */}
      <div style={filterStyles.container}>
        <div style={filterStyles.title}>Фильтрация статей</div>
        
        <div style={filterStyles.inputGroup}>
          <div style={filterStyles.inputWrapper}>
            <label style={filterStyles.label} htmlFor="title-filter">Название статьи</label>
            <input
              id="title-filter"
              style={filterStyles.input}
              placeholder="Поиск по названию"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
          
          <div style={filterStyles.inputWrapper}>
            <label style={filterStyles.label} htmlFor="author-filter">Автор</label>
            <input
              id="author-filter"
              style={filterStyles.input}
              placeholder="Поиск по автору"
              value={author}
              onChange={e => setAuthor(e.target.value)}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            style={filterStyles.clearButton}
            onClick={clearFilters}
          >
            Очистить фильтры
          </button>
          
          <div style={{ fontSize: '14px', color: '#666' }}>
            Найдено статей: {filtered.length}
          </div>
        </div>
      </div>
      
      {/* Отображение статей */}
      {filtered.length > 0 ? (
        <div style={gridStyles.container}>
          {filtered.map(article => (
            <ArticleCard 
              key={article._id} 
              article={article} 
              onClick={onArticleClick} 
              onDelete={onDeleteArticle}
            />
          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px', 
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px' 
        }}>
          <div style={{ fontSize: '20px', marginBottom: '10px' }}>Статьи не найдены</div>
          <p>Попробуйте изменить параметры фильтрации или добавьте новые статьи</p>
        </div>
      )}
    </div>
  );
}

export default ArticleList;