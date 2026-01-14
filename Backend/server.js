import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http'; // 1. Import HTTP
import { Server } from 'socket.io';  // 2. Import Socket.io

// Import your configurations
import './config/Cloudinary.js';
import { connectDB } from './config/db.js';

// Import your Routes
import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 3. Create the HTTP Server
const httpServer = createServer(app);

// 4. Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: [
      'https://kkb-kitchen-frontend.onrender.com',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST']
  }
});

// 5. Make 'io' accessible in your controllers via req.app.get('socketio')
app.set('socketio', io);

// Middleware
app.use(cors({
  origin: [
    'https://kkb-kitchen-frontend.onrender.com',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Chef, the kitchen is open! 👨‍🍳",
    status: "Healthy",
    timestamp: new Date().toISOString()
  });
});

// Socket connection log (optional, for debugging)
io.on("connection", (socket) => {
  console.log(`Chef connected: ${socket.id}`);
});

// 6. Start Database then start Listening using httpServer
const startServer = async () => {
  try {
    await connectDB();

    // NOTE: We use httpServer.listen, NOT app.listen
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server + WebSockets live at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Fatal Error during startup:", error);
    process.exit(1);
  }
};

startServer();