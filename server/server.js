const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

// ============================================================
// Register ALL Mongoose models at the very START of the app.
// This defines every model upfront so MongoDB creates the
// corresponding collections automatically as soon as the
// application starts storing data.
// ============================================================
require('./models'); // -> loads User, Post, Comment, Conversation, Message, Notification, Report

const connectDB = require('./config/db');
const initCollections = require('./config/initCollections');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Connect to database and init collections
// (models are already registered above, so collections are created automatically)
connectDB()
  .then(() => initCollections())
  .catch((err) => {
    // DB retry loop runs in background in db.js; server keeps accepting requests
    console.error(`[DB] Initial connection failed: ${err.message}. Will keep retrying in background.`);
  });

// Middleware
// helmet() by default sets Cross-Origin-Resource-Policy (CORP) to 'same-origin',
// which blocks browsers from loading media (images/videos) served from this API
// when the frontend runs on a different origin (port 3000). We disable that header.
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: 'Too many requests, please try again later.',
});
app.use('/api', limiter);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Codfel Social Media API is running' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Error handling
app.use(notFound);
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});
const { setupSocket } = require('./sockets');
setupSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 MongoDB Atlas connected`);
  console.log(`🔌 Socket.IO ready`);
});
