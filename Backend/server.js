import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

// Import your configurations
import './config/Cloudinary.js'; // This just runs the config file
import { connectDB } from './config/db.js';

// Import your Routes
import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/admin', adminRoutes);

// 3. Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({ message: "Chef, the kitchen is open! 👨‍🍳" });
});

// 4. Start Database then start Listening
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is officially live at http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      console.error("Server Error:", err);
    });

  } catch (error) {
    console.error("❌ Fatal Error during startup:", error);
    process.exit(1);
  }
};

startServer();