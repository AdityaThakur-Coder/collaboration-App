import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Calendar, Filter } from 'lucide-react';
import api from '../utils/api';
import socketManager from '../utils/socket';
import TaskBoard from './TaskBoard';
import CreateTaskModal from './modals/CreateTaskModal';
import InviteModal from './modals/InviteModal';

function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProject();
    fetchTasks();
    
    // Join project room for real-time updates
    const token = localStorage.getItem('token');
    if (token) {
      socketManager.connect(token);
      socketManager.joinProject(id);
    }

    // Listen for real-time updates
    const socket = socketManager.socket;
    if (socket) {
      socket.on('task-updated', handleTaskUpdate);
      socket.on('comment-added', handleCommentAdded);
    }

    return () => {
      if (socket) {
        socket.off('task-updated', handleTaskUpdate);
        socket.off('comment-added', handleCommentAdded);
      }
      socketManager.leaveProject(id);
    };
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/project/${id}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = (data) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === data.task._id ? data.task : task
      )
    );
  };

  const handleCommentAdded = (data) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task._id === data.taskId) {
          return {
            ...task,
            comments: [...task.comments, data.comment]
          };
        }
        return task;
      })
    );
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await api.post('/tasks', {
        ...taskData,
        project: id
      });
      setTasks([...tasks, response.data]);
      setShowCreateTaskModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? response.data : task
        )
      );
      
      // Emit real-time update
      socketManager.emitTaskUpdate(id, response.data);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Project not found</h3>
        <Link to="/" className="btn btn-primary mt-4">
          <ArrowLeft size={20} />
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="btn btn-outline">
          <ArrowLeft size={20} />
          Back
        </Link>
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: project.color }}
        />
        <h1 className="text-2xl font-bold">{project.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="card-title">Description</h3>
            <p className="text-gray-600">
              {project.description || 'No description provided'}
            </p>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title mb-4">Project Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`badge ${project.status === 'active' ? 'badge-in-progress' : 'badge-completed'}`}>
                {project.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Priority:</span>
              <span className={`badge badge-${project.priority}`}>
                {project.priority}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Members:</span>
              <span>{project.members.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn btn-secondary w-full"
            >
              <Users size={20} />
              Invite Members
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="card-title">Tasks</h3>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Tasks</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="btn btn-primary"
            >
              <Plus size={20} />
              Add Task
            </button>
          </div>
        </div>

        <TaskBoard
          tasks={filteredTasks}
          onStatusChange={handleTaskStatusChange}
          projectMembers={project.members}
        />
      </div>

      {showCreateTaskModal && (
        <CreateTaskModal
          projectMembers={project.members}
          onClose={() => setShowCreateTaskModal(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {showInviteModal && (
        <InviteModal
          project={project}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}

export default ProjectDetail;