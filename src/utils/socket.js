import io from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io('http://localhost:5000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinProject(projectId) {
    if (this.socket) {
      this.socket.emit('join-project', projectId);
    }
  }

  leaveProject(projectId) {
    if (this.socket) {
      this.socket.emit('leave-project', projectId);
    }
  }

  emitTaskUpdate(projectId, task) {
    if (this.socket) {
      this.socket.emit('task-updated', { projectId, task });
    }
  }

  emitComment(projectId, taskId, comment) {
    if (this.socket) {
      this.socket.emit('comment-added', { projectId, taskId, comment });
    }
  }

  emitTyping(projectId, taskId) {
    if (this.socket) {
      this.socket.emit('typing', { projectId, taskId });
    }
  }

  emitStopTyping(projectId, taskId) {
    if (this.socket) {
      this.socket.emit('stop-typing', { projectId, taskId });
    }
  }
}

export default new SocketManager();