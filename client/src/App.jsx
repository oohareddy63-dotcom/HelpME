import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api.js';
import './App.css';

// Import components
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import CloseContacts from './pages/CloseContacts';
import Settings from './pages/Settings';
import TestLogin from './components/TestLogin';
import ConnectionStatus from './components/ConnectionStatus';
import MapTestPage from './pages/MapTestPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (token && userId) {
      // Verify token with backend
      api.get('/v1/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => {
        if (response.data.success) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <SignUp setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <SignUp setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
            } 
          />
          <Route path="/test-login" element={<TestLogin />} />
          <Route path="/connection" element={<ConnectionStatus />} />
          <Route path="/map-test" element={<MapTestPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard 
                user={user} 
                setUser={setUser} 
                setIsAuthenticated={setIsAuthenticated} 
              /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/close-contacts" 
            element={
              isAuthenticated ? 
              <CloseContacts user={user} setUser={setUser} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/settings" 
            element={
              isAuthenticated ? 
              <Settings user={user} setUser={setUser} /> : 
              <Navigate to="/login" />
            } 
          />
          
          {/* Default Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;