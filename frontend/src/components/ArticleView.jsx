import React from 'react';

const ArticleView = ({ article }) => {
  // Базовый URL сервера 
  const baseUrl = 'http://localhost:5001';
  
  // Получаем только имя файла из пути
  const getFileName = (filePath) => {
    return filePath.split('/').pop();
  };

  return (
    <div>
      <h2>{article.title}</h2>
      <p>Автор: {article.author && article.author.username ? article.author.username : 'Неизвестный автор'}</p>
      
      {/* Отображение изображения */}
      {article.image && (
        <div className="article-image" style={{ margin: '20px 0' }}>
          <img 
            src={`${baseUrl}/${article.image}`} 
            alt={article.title}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '500px', 
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
            }}
          />
        </div>
      )}
      
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
      {article.files && article.files.length > 0 && (
        <div>
          <h4>Файлы:</h4>
          <ul>
            {article.files.map((filePath, idx) => (
              <li key={idx}>
                <a href={`${baseUrl}/${filePath}`} target="_blank" rel="noopener noreferrer">
                  {getFileName(filePath)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ArticleView;