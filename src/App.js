import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import InviteAccept from './components/InviteAccept';
import Layout from './components/Layout';
import api from './utils/api';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const handleLogin = (userData) => {
    setUser(userData.user);
    localStorage.setItem('token', userData.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/register" 
            element={
              user ? <Navigate to="/" /> : <Register onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/invite/:token" 
            element={
              user ? <InviteAccept /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/" 
            element={
              user ? (
                <Layout user={user} onLogout={handleLogout}>
                  <Dashboard />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/project/:id" 
            element={
              user ? (
                <Layout user={user} onLogout={handleLogout}>
                  <ProjectDetail />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;