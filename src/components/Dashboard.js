import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import CreateProjectModal from './modals/CreateProjectModal';
import InviteModal from './modals/InviteModal';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      setProjects([response.data, ...projects]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleInvite = (project) => {
    setSelectedProject(project);
    setShowInviteModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Projects</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">Create your first project to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <div className="flex gap-2">
                  <span className={`badge ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`badge ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2">
                <Link 
                  to={`/project/${project._id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {project.name}
                </Link>
              </h3>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {project.description || 'No description'}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  {project.members.length} members
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/project/${project._id}`}
                  className="btn btn-outline flex-1 text-sm"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleInvite(project)}
                  className="btn btn-secondary text-sm"
                >
                  Invite
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {showInviteModal && selectedProject && (
        <InviteModal
          project={selectedProject}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;