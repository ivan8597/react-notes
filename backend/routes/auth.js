const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Проверка минимальной длины пароля
    if (password.length < 5) {
      return res.status(400).json({ 
        message: 'Пароль должен содержать не менее 5 символов' 
      });
    }
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Пользователь с таким email или username уже существует' 
      });
    }

    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'Пользователь зарегистрирован' });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(400).json({ message: 'Ошибка регистрации', error });
  }
});

// Вход
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Попытка входа:', { email, passwordLength: password.length });
    
    // Проверка минимальной длины пароля (должен быть хотя бы 5 символов)
    if (password.length < 5) {
      console.log('Пароль слишком короткий');
      return res.status(401).json({ message: 'Пароль должен содержать не менее 5 символов' });
    }
    
    const user = await User.findOne({ $or: [{ email }, { username: email }] });
    
    if (!user) {
      console.log('Пользователь не найден');
      return res.status(401).json({ message: 'Пользователь с таким email не найден' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Неверный пароль');
      return res.status(401).json({ message: 'Неверный пароль' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Успешный вход, выдан токен');
    res.json({ token });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Ошибка входа', error });
  }
});

// Получение профиля пользователя
router.get('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения профиля', error });
  }
});

module.exports = router;