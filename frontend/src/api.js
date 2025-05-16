import axios from 'axios';
import { getToken } from './utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL
});

// Добавляем перехватчик запросов для автоматического добавления токена
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    if (token) {
      // Проверяем что токен передается правильно
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Запрос к ${config.url} с токеном авторизации`);
    } else {
      console.warn(`Запрос к ${config.url} без токена авторизации!`);
    }
    
    return config;
  },
  (error) => {
    console.error('Ошибка в перехватчике запросов:', error);
    return Promise.reject(error);
  }
);

// Регистрация нового пользователя
export const register = async (userData) => {
  const res = await api.post('/auth/register', userData);
  return res.data;
};

// Авторизация пользователя
export const login = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  return res.data;
};

// Получение профиля пользователя
export const getUserProfile = async () => {
  const res = await api.get('/auth/profile');
  return res.data;
};

// Работа с новостями  используем  добавленный токен
export const createArticle = async (data) => {
  console.log('Создание статьи:', {
    title: data.title,
    contentLength: data.content?.length || 0,
    hasImage: !!data.image,
    filesCount: data.files?.length || 0
  });

  try {
    // Если есть файлы используем FormData
    if (data.files && data.files.length > 0 || data.image) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      
      // Если есть изображение обложки
      if (data.image) {
        formData.append('image', data.image);
      }
      
      // Добавляем все файлы
      if (data.files && data.files.length > 0) {
        data.files.forEach(file => {
          formData.append('files', file);
        });
      }
      
      console.log('Отправка FormData для создания статьи');
      
      const res = await api.post('/news', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    } 
    // Если файлов нет отправляем как JSON
    else {
      console.log('Отправка JSON для создания статьи');
      const res = await api.post('/news', data);
      return res.data;
    }
  } catch (error) {
    console.error('Ошибка при создании статьи:', error);
    if (error.response) {
      console.error('Статус ошибки:', error.response.status);
      console.error('Данные ошибки:', error.response.data);
    }
    throw error;
  }
};

export const updateArticle = async (id, data) => {
  console.log('Обновление статьи:', {
    id,
    title: data.title,
    contentLength: data.content?.length || 0,
    hasImage: !!data.image,
    filesCount: data.files?.length || 0
  });

  try {
    // Если есть файлы или изображение используем FormData
    if ((data.files && data.files.length > 0) || data.image) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      
      // Если есть изображение
      if (data.image) {
        formData.append('image', data.image);
        console.log('Добавлено изображение в FormData');
      }
      
      // Добавляем все файлы
      if (data.files && data.files.length > 0) {
        data.files.forEach(file => {
          // Проверяем, является ли файл строкой (путь) или объектом File
          if (typeof file === 'string') {
            // Существующий путь к файлу добавляем его как строку
            formData.append('existingFiles', file);
            console.log('Добавлен существующий файл:', file);
          } else {
            formData.append('files', file);
            console.log('Добавлен новый файл:', file.name);
          }
        });
      }
      
      console.log('Отправка данных с файлами для обновления статьи');
      
      const res = await api.put(`/news/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    } 
    // Если файлов нет отправляем как JSON
    else {
      console.log('Отправка данных как JSON для обновления статьи');
      const res = await api.put(`/news/${id}`, data);
      return res.data;
    }
  } catch (error) {
    console.error('Ошибка при обновлении статьи:', error);
    
    
    if (error.response) {
      console.error('Статус ошибки:', error.response.status);
      console.error('Данные ошибки:', error.response.data);
    }
    
    throw error; 
  }
};

export const deleteArticle = async (id) => {
  const res = await api.delete(`/news/${id}`);
  return res.data;
};

export const getArticles = async (params) => {
  const res = await api.get('/news', { params });
  return res.data;
};

export const getArticle = async (id) => {
  const res = await api.get(`/news/${id}`);
  return res.data;
};