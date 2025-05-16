import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArticleEditor from '../components/ArticleEditor';
import { createArticle, getArticle, updateArticle } from '../api';
import { notify } from '../App';

const EditorPage = () => {
  const { id } = useParams();
  const [initialValue, setInitialValue] = useState('');
  const [initialTitle, setInitialTitle] = useState('');
  const [initialImage, setInitialImage] = useState(null);
  const [initialFiles, setInitialFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setLoading(true);
      getArticle(id)
        .then(article => {
          console.log('Получена статья для редактирования:', article);
          setInitialValue(article.content);
          setInitialTitle(article.title);
          setInitialImage(article.image);
          setInitialFiles(article.files || []);
          setLoading(false);
        })
        .catch(error => {
          console.error('Ошибка при загрузке статьи:', error);
          notify.error('Не удалось загрузить статью для редактирования');
          setLoading(false);
        });
    }
  }, [id]);

  const handleSave = async (data) => {
    try {
      if (!data.title) {
        notify.warning('Пожалуйста, введите заголовок статьи');
        return;
      }
      
      // Проверка контента
      if (!data.content || data.content === '<p><br></p>') {
        notify.warning('Пожалуйста, добавьте текст статьи');
        return;
      }
      
      // Показываем уведомление о сохранении
      notify.info(id ? 'Обновление статьи...' : 'Создание статьи...');
      
      
      console.log(`Отправка ${id ? 'обновлённой' : 'новой'} статьи:`, {
        title: data.title,
        contentLength: data.content?.length,
        hasImage: !!data.image,
        filesCount: data.files?.length || 0
      });
      
      let result;
      
      if (id) {
        result = await updateArticle(id, data);
        notify.success('Статья успешно обновлена!');
      } else {
        result = await createArticle(data);
        notify.success('Статья успешно создана!');
      }
      
      console.log('Результат сохранения:', result);
      
      // Перенаправляем на главную страницу
      navigate('/');
    } catch (error) {
      console.error('Ошибка при сохранении статьи:', error);
      
      let errorMessage = 'Произошла ошибка при сохранении статьи';
      
      
      if (error.response) {
        console.error('Статус ошибки:', error.response.status);
        console.error('Данные ошибки:', error.response.data);
        
        
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 500) {
          errorMessage = 'Ошибка сервера при сохранении статьи';
        } else if (error.response.status === 413) {
          errorMessage = 'Файлы слишком большие для загрузки';
        }
      }
      
      notify.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '30px' }}>
        <div>Загрузка статьи...</div>
      </div>
    );
  }

  return (
    <div>
      <h1>{id ? 'Редактировать статью' : 'Создать статью'}</h1>
      <ArticleEditor 
        initialValue={initialValue} 
        initialTitle={initialTitle}
        initialImage={initialImage}
        initialFiles={initialFiles}
        onSave={handleSave} 
      />
    </div>
  );
}

export default EditorPage;