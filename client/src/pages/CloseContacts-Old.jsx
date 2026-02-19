import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CloseContacts = ({ user, setUser }) => {
  const [contacts, setContacts] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [message, setMessage] = useState('');

  // Get close contacts from backend
  const getCloseContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/users/getCloseContact', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setContacts(response.data.contacts || {});
      }
    } catch (err) {
      console.error('Error getting close contacts:', err);
      setMessage('Error loading contacts');
    } finally {
      setLoading(false);
    }
  };

  // Add new close contact
  const addCloseContact = async (e) => {
    e.preventDefault();
    
    if (!newContact.name || !newContact.phone) {
      setMessage('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const updatedContacts = { ...contacts, [newContact.name]: parseInt(newContact.phone) };
      
      const response = await axios.post('/api/v1/users/addCloseContact', {
        closeContacts: updatedContacts
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setContacts(updatedContacts);
        setNewContact({ name: '', phone: '' });
        setShowAddForm(false);
        setMessage('Contact added successfully!');
        
        // Update user data
        const userResponse = await axios.get('/api/v1/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userResponse.data.success) {
          setUser(userResponse.data.user);
        }
      }
    } catch (err) {
      console.error('Error adding close contact:', err);
      setMessage('Error adding contact');
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
      const updatedContacts = { ...contacts };
      delete updatedContacts[name];
      
      const response = await axios.post('/api/v1/users/addCloseContact', {
        closeContacts: updatedContacts
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setContacts(updatedContacts);
        setMessage('Contact deleted successfully!');
        
        // Update user data
        const userResponse = await axios.get('/api/v1/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userResponse.data.success) {
          setUser(userResponse.data.user);
        }
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
      setMessage('Error deleting contact');
    } finally {
      setLoading(false);
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
    <div className="close-contacts">
      <div className="contacts-header">
        <h2>Close Contacts</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add Contact'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
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
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Enter contact name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number:</label>
              <input
                type="tel"
                id="phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="Enter phone number"
                pattern="[0-9]{10}"
                required
              />
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
                }}
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
        </ul>
      </div>
    </div>
  );
};

export default CloseContacts;
