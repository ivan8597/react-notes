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
const upload = multer({ storage });

// Создание новости
router.post('/', authMiddleware, upload.fields([{ name: 'image' }, { name: 'files' }]), async (req, res) => {
  const { title, content, isPublished } = req.body;
  const image = req.files.image ? req.files.image[0].path : null;
  const files = req.files.files ? req.files.files.map(file => file.path) : [];

  try {
    const news = new News({
      title,
      content,
      author: req.userId,
      image,
      files,
      isPublished,
    });
    await news.save();
    req.io.emit('newsCreated', news); // Уведомление в реальном времени
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка создания новости', error });
  }
});

// Обновление новости
router.put('/:id', authMiddleware, upload.fields([{ name: 'image' }, { name: 'files' }]), async (req, res) => {
  const { title, content, isPublished } = req.body;
  const image = req.files.image ? req.files.image[0].path : null;
  const files = req.files.files ? req.files.files.map(file => file.path) : [];

  try {
    const news = await News.findById(req.params.id);
    if (!news || news.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Нет доступа' });
    }
    news.title = title || news.title;
    news.content = content || news.content;
    news.isPublished = isPublished !== undefined ? isPublished : news.isPublished;
    news.image = image || news.image;
    news.files = files.length ? files : news.files;
    news.updatedAt = Date.now();
    await news.save();
    req.io.emit('newsUpdated', news); // Уведомление в реальном времени
    res.json(news);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка обновления новости', error });
  }
});

// Удаление новости
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news || news.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Нет доступа' });
    }
    await news.remove();
    req.io.emit('newsDeleted', { id: req.params.id }); // Уведомление в реальном времени
    res.json({ message: 'Новость удалена' });
  } catch (error) {
    res.status(400).json({ message: 'Ошибка удаления новости', error });
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

module.exports = router;