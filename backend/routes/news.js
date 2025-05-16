const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const News = require('../models/News');
const router = express.Router();

// Настройка Multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

// Настройка лимитов Multer для предотвращения ошибок превышения размера
const upload = multer({ 
  storage,
  limits: {
    fieldSize: 25 * 1024 * 1024, // 25MB для поля формы
    fileSize: 10 * 1024 * 1024,  // 10MB для размера файла
    fields: 20,                  // максимум 20 полей формы
    files: 10                    // максимум 10 файлов
  }
});

// Создание новости
router.post('/', authMiddleware, upload.fields([
  { name: 'image' }, 
  { name: 'files' }
]), async (req, res) => {
  const { title, content, isPublished } = req.body;
  
  // Проверяем обязательные поля
  if (!title || !content) {
    return res.status(400).json({ message: 'Заголовок и содержание обязательны' });
  }
  
  // Безопасно извлекаем данные о файлах
  const image = req.files && req.files.image ? req.files.image[0].path : null;
  const files = req.files && req.files.files ? req.files.files.map(file => file.path) : [];
  
  try {
    const news = new News({
      title,
      content,
      author: req.userId,
      image,
      files,
      isPublished: isPublished === 'true' || isPublished === true,
    });
    await news.save();
    
    // Отправляем уведомление, если сокет инициализирован
    if (req.io) {
      req.io.emit('newsCreated', news);
    }
    
    res.status(201).json(news);
  } catch (error) {
    console.error('Ошибка создания новости:', error);
    res.status(400).json({ message: 'Ошибка создания новости', error: error.message });
  }
});

// Обновление новости
router.put('/:id', authMiddleware, upload.fields([
  { name: 'image' }, 
  { name: 'files' }
]), async (req, res) => {
  const { title, content, isPublished, existingFiles } = req.body;
  const image = req.files && req.files.image ? req.files.image[0].path : null;
  const newFiles = req.files && req.files.files ? req.files.files.map(file => file.path) : [];

  try {
    const news = await News.findById(req.params.id);
    if (!news || news.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Нет доступа' });
    }
    
    news.title = title || news.title;
    news.content = content || news.content;
    news.isPublished = isPublished !== undefined ? isPublished : news.isPublished;
    
    // Обновляем изображение, если оно предоставлено
    if (image) {
      news.image = image;
    }
    
    // Обрабатываем файлы
    let updatedFiles = [];
    
    // Добавляем существующие файлы, если они были переданы
    if (existingFiles) {
      // Если existingFiles - это строка, преобразуем ее в массив
      const existingFilesArray = typeof existingFiles === 'string' ? [existingFiles] : existingFiles;
      updatedFiles = updatedFiles.concat(existingFilesArray);
    }
    
    // Добавляем новые файлы
    if (newFiles.length > 0) {
      updatedFiles = updatedFiles.concat(newFiles);
    }
    
    // Если массив файлов не пуст, обновляем файлы статьи
    if (updatedFiles.length > 0) {
      news.files = updatedFiles;
    }
    
    news.updatedAt = Date.now();
    await news.save();
    
    // Отправляем уведомление, если сокет инициализирован
    if (req.io) {
      req.io.emit('newsUpdated', news);
    }
    
    res.json(news);
  } catch (error) {
    console.error('Ошибка обновления новости:', error);
    res.status(400).json({ message: 'Ошибка обновления новости', error: error.message });
  }
});

// Удаление новости
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news || news.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Нет доступа' });
    }
    

    await News.deleteOne({ _id: req.params.id });
    
    req.io.emit('newsDeleted', { id: req.params.id }); // Уведомление в реальном времени
    res.json({ message: 'Новость удалена' });
  } catch (error) {
    console.error('Ошибка удаления новости:', error);
    res.status(400).json({ message: 'Ошибка удаления новости', error: error.message });
  }
});

// Получение всех новостей
router.get('/', async (req, res) => {
  try {
    const news = await News.find().populate('author', 'username');
    res.json(news);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка получения новостей', error });
  }
});

// Получение одной статьи по ID
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('author', 'username');
    
    if (!news) {
      return res.status(404).json({ message: 'Статья не найдена' });
    }
    
    res.json(news);
  } catch (error) {
    console.error('Ошибка получения статьи:', error);
    res.status(400).json({ message: 'Ошибка получения статьи', error });
  }
});

module.exports = router;