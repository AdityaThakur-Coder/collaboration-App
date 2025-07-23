import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import userRoutes from './routes/users.js';
import inviteRoutes from './routes/invites.js';
import taskRoutes from './routes/tasks.js';
import logRoutes from './routes/logs.js';
import { authenticateToken } from './middleware/auth.js';
import { setupSocket } from './socket/socketHandlers.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboration-app')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', authenticateToken, projectRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/invites', authenticateToken, inviteRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);
app.use('/api/logs', authenticateToken, logRoutes);

// Socket.IO setup
setupSocket(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});