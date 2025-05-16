import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticle } from '../api';
import ArticleView from '../components/ArticleView';

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    getArticle(id)
      .then(data => {
        console.log('Получена статья:', data);
        setArticle(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка при получении статьи:', err);
        setError('Не удалось загрузить статью. Возможно, она была удалена или у вас нет к ней доступа.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!article) return <div>Статья не найдена</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)}>Назад</button>
      <ArticleView article={article} />
      <button onClick={() => navigate(`/articles/${id}/edit`)}>Редактировать</button>
    </div>
  );
};

export default ArticlePage;