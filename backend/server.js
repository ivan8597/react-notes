const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // URL фронтенда
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Подключение к MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Раздача файлов
app.use((req, res, next) => {
  req.io = io; // Привязка Socket.IO к запросу
  next();
});

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);

// Socket.IO для уведомлений
io.on('connection', (socket) => {
  console.log('Пользователь подключен:', socket.id);
  socket.on('disconnect', () => console.log('Пользователь отключен:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));