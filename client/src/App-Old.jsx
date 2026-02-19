import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CloseContacts from './pages/CloseContacts';
import EmergencyAlert from './components/EmergencyAlert';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>Help-me</h1>
          <p>Emergency Assistance Platform</p>
        </header>
        
        <main className="app-main">
          <Routes>
            <Route path="/" element={
              isAuthenticated ? 
              <Dashboard user={user} setUser={setUser} setIsAuthenticated={setIsAuthenticated} /> : 
              <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
            } />
            <Route path="/register" element={
              <Register setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
            } />
            <Route path="/dashboard" element={
              <Dashboard user={user} setUser={setUser} setIsAuthenticated={setIsAuthenticated} />
            } />
            <Route path="/close-contacts" element={
              <CloseContacts user={user} setUser={setUser} />
            } />
          </Routes>
        </main>
        
        {isAuthenticated && <EmergencyAlert user={user} />}
      </div>
    </Router>
  );
}

export default App;