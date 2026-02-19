import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const CloseContacts = ({ user, setUser }) => {
  const [contacts, setContacts] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validate phone number
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  // Validate name
  const validateName = (name) => {
    return name.trim().length >= 2 && name.trim().length <= 50;
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  // Get close contacts from backend
  const getCloseContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('No authentication token found. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await api.get('/api/v1/users/getCloseContact');
      
      if (response.data.success) {
        setContacts(response.data.contacts || {});
        setErrors({});
        setMessage('');
      } else {
        throw new Error(response.data.error || 'Failed to load contacts');
      }
    } catch (err) {
      console.error('Error getting close contacts:', err);
      if (err.response?.status === 401) {
        setMessage('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/login');
        }, 2000);
      } else {
        setMessage(err.response?.data?.error || err.message || 'Error loading contacts');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add new close contact
  const addCloseContact = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    
    if (!newContact.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!validateName(newContact.name)) {
      newErrors.name = 'Name must be between 2 and 50 characters';
    }
    
    if (!newContact.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(newContact.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check for duplicate phone number
    const existingPhone = Object.values(contacts).includes(parseInt(newContact.phone));
    if (existingPhone) {
      setErrors({ phone: 'This phone number already exists in your contacts' });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('No authentication token found. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const updatedContacts = { ...contacts, [newContact.name.trim()]: parseInt(newContact.phone) };
      
      const response = await api.post('/api/v1/users/addCloseContact', {
        closeContacts: updatedContacts
      });
      
      if (response.data.success) {
        setContacts(updatedContacts);
        setNewContact({ name: '', phone: '' });
        setShowAddForm(false);
        setErrors({});
        setMessage('Contact added successfully!');
        
        // Update user data
        if (setUser) {
          try {
            const userResponse = await api.get('/api/v1/users/me');
            if (userResponse.data.success) {
              setUser(userResponse.data.user);
            }
          } catch (userErr) {
            console.error('Error updating user data:', userErr);
          }
        }
      } else {
        throw new Error(response.data.error || 'Failed to add contact');
      }
    } catch (err) {
      console.error('Error adding close contact:', err);
      if (err.response?.status === 401) {
        setMessage('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/login');
        }, 2000);
      } else {
        setMessage(err.response?.data?.error || err.message || 'Error adding contact');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete close contact
  const deleteContact = async (name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('No authentication token found. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const updatedContacts = { ...contacts };
      delete updatedContacts[name];
      
      const response = await api.post('/api/v1/users/addCloseContact', {
        closeContacts: updatedContacts
      });
      
      if (response.data.success) {
        setContacts(updatedContacts);
        setErrors({});
        setMessage('Contact deleted successfully!');
        
        // Update user data
        if (setUser) {
          try {
            const userResponse = await api.get('/api/v1/users/me');
            if (userResponse.data.success) {
              setUser(userResponse.data.user);
            }
          } catch (userErr) {
            console.error('Error updating user data:', userErr);
          }
        }
      } else {
        throw new Error(response.data.error || 'Failed to delete contact');
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
      if (err.response?.status === 401) {
        setMessage('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/login');
        }, 2000);
      } else {
        setMessage(err.response?.data?.error || err.message || 'Error deleting contact');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setNewContact({ ...newContact, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  useEffect(() => {
    getCloseContacts();
  }, []);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <Link to="/dashboard" className="brand-link">
              <span className="brand-icon">🆘</span>
              <span className="brand-text">HelpMe</span>
            </Link>
          </div>
          <div className="navbar-menu">
            <Link to="/dashboard" className="navbar-item">
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Home</span>
            </Link>
            <Link to="/close-contacts" className="navbar-item active">
              <span className="nav-icon">👥</span>
              <span className="nav-text">Contacts</span>
            </Link>
            <Link to="/settings" className="navbar-item">
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Settings</span>
            </Link>
            <button onClick={handleLogout} className="navbar-item logout-item">
              <span className="nav-icon">🚪</span>
              <span className="nav-text">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="close-contacts">
          <div className="contacts-header">
            <h2>Close Contacts</h2>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (showAddForm) {
                  setNewContact({ name: '', phone: '' });
                  setErrors({});
                }
              }}
              disabled={loading}
            >
              {showAddForm ? 'Cancel' : 'Add Contact'}
            </button>
          </div>

          {message && (
            <div className={`message ${message.includes('Error') || message.includes('expired') || message.includes('No authentication') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          {showAddForm && (
            <div className="add-contact-form">
              <h3>Add New Contact</h3>
              <form onSubmit={addCloseContact}>
                <div className="form-group">
                  <label htmlFor="name">Name:</label>
                  <input
                    type="text"
                    id="name"
                    value={newContact.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter contact name"
                    className={errors.name ? 'error' : ''}
                    disabled={loading}
                    maxLength="50"
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number:</label>
                  <input
                    type="tel"
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit phone number"
                    className={errors.phone ? 'error' : ''}
                    disabled={loading}
                    maxLength="10"
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Contact'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewContact({ name: '', phone: '' });
                      setErrors({});
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="contacts-list">
            <h3>Your Emergency Contacts</h3>
            {loading ? (
              <div className="loading">Loading contacts...</div>
            ) : Object.keys(contacts).length > 0 ? (
              <div className="contacts-grid">
                {Object.entries(contacts).map(([name, phone]) => (
                  <div key={name} className="contact-card">
                    <div className="contact-info">
                      <h4>{name}</h4>
                      <p>{phone}</p>
                    </div>
                    <div className="contact-actions">
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteContact(name)}
                        disabled={loading}
                        title="Delete contact"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-contacts">
                <p>No close contacts added yet.</p>
                <p>Add your emergency contacts who will be notified when you need help.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddForm(true)}
                  disabled={loading}
                >
                  Add Your First Contact
                </button>
              </div>
            )}
          </div>

          <div className="emergency-info">
            <h3>Emergency Information</h3>
            <ul>
              <li>Your close contacts will receive SMS alerts when you trigger an emergency</li>
              <li>They will be notified with your current location</li>
              <li>Keep your contact information updated for faster response</li>
              <li>Add at least 2-3 trusted contacts for better safety</li>
              <li>Make sure your contacts know they are your emergency contacts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloseContacts;