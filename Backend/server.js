import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http'; 
import { Server } from 'socket.io'; 

import './config/Cloudinary.js';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173', 
      'http://localhost:3000', 
      'https://kkb-kitchen-frontend.onrender.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('socketio', io);

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'https://kkb-kitchen-frontend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    message: "Chef, the kitchen is open! 👨‍🍳",
    status: "Healthy",
    timestamp: new Date().toISOString()
  });
});

// --- UPDATED SOCKET LOGIC ---
io.on("connection", (socket) => {
  console.log(`Chef connected: ${socket.id}`);

  // When a user logs in, their frontend will send their UserID to join a private room
  socket.on("join_room", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} is now ready for private notifications`);
  });

  socket.on("disconnect", () => {
    console.log(`Chef disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server + WebSockets live at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Fatal Error during startup:", error);
    process.exit(1);
  }
};

startServer();