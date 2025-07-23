import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FolderOpen, Users, Settings, LogOut, Menu, X } from 'lucide-react';

function Layout({ children, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="text-xl font-bold text-gray-900">CollabApp</h2>
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-menu">
          <Link 
            to="/" 
            className={`sidebar-item ${isActive('/') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FolderOpen size={20} />
            Projects
          </Link>
          
          <Link 
            to="/team" 
            className={`sidebar-item ${isActive('/team') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Users size={20} />
            Team
          </Link>
          
          <Link 
            to="/settings" 
            className={`sidebar-item ${isActive('/settings') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Settings size={20} />
            Settings
          </Link>
        </nav>

        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="font-medium">{user.firstName} {user.lastName}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="sidebar-item w-full text-left text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        <header className="header">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.firstName}!
            </h1>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

export default Layout;