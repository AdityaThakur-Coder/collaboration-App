import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const setupSocket = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Join project rooms
    socket.on('join-project', (projectId) => {
      socket.join(`project-${projectId}`);
      console.log(`User ${socket.user.username} joined project ${projectId}`);
    });

    // Leave project rooms
    socket.on('leave-project', (projectId) => {
      socket.leave(`project-${projectId}`);
      console.log(`User ${socket.user.username} left project ${projectId}`);
    });

    // Real-time task updates
    socket.on('task-updated', (data) => {
      socket.to(`project-${data.projectId}`).emit('task-updated', {
        task: data.task,
        updatedBy: {
          id: socket.user._id,
          username: socket.user.username,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName
        }
      });
    });

    // Real-time comments
    socket.on('comment-added', (data) => {
      socket.to(`project-${data.projectId}`).emit('comment-added', {
        taskId: data.taskId,
        comment: data.comment,
        author: {
          id: socket.user._id,
          username: socket.user.username,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName
        }
      });
    });

    // User typing indicator
    socket.on('typing', (data) => {
      socket.to(`project-${data.projectId}`).emit('user-typing', {
        userId: socket.user._id,
        username: socket.user.username,
        taskId: data.taskId
      });
    });

    socket.on('stop-typing', (data) => {
      socket.to(`project-${data.projectId}`).emit('user-stop-typing', {
        userId: socket.user._id,
        taskId: data.taskId
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`);
    });
  });
};