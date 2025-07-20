import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/global.css';

function Account() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [newUsername, setNewUsername] = useState(localStorage.getItem('username') || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('Please log in to view your account');
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
        });

        if (response.data.user?.username) {
          const fetchedUsername = response.data.user.username;
          setUsername(fetchedUsername);
          setNewUsername(fetchedUsername);
          localStorage.setItem('username', fetchedUsername);
          setError('');
        } else {
          throw new Error('No username in response');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setUsername(localStorage.getItem('username') || '');
        setNewUsername(localStorage.getItem('username') || '');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          navigate('/login');
        }
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      setNewUsername(storedUsername);
    }

    fetchProfile();
  }, [navigate, token]);

  const handleChangeUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }
    try {
      const response = await axios.put(
        '/api/auth/profile',
        { username: newUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsername(newUsername);
      setNewUsername(newUsername);
      localStorage.setItem('username', newUsername);
      setSuccess(response.data.message || 'Username updated successfully');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update username');
      setSuccess('');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setError('Both current and new passwords are required');
      return;
    }
    try {
      const response = await axios.put(
        '/api/auth/password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(response.data.message || 'Password changed successfully');
      setError('');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
      setSuccess('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const getInitials = (name) =>
    name ? name.split(' ').map((part) => part[0]).join('').toUpperCase() : 'U';

  return (
    <div className="account-page">
      {/* Header removed */}
      <div className="account-container">
        <div className="sidebar">
          <div className="profile-pic">
            <span className="initials">{getInitials(username)}</span>
          </div>
        </div>

        <div className="main-content">
          {isLoading ? (
            <p>Loading profile...</p>
          ) : !token ? (
            <div className="auth-options">
              <h3>Welcome</h3>
              <p>Please log in or sign up to access your account.</p>
              <Link to="/login">
                <button className="btn-primary">Sign In</button>
              </Link>
              <Link to="/signup">
                <button className="btn-primary">Sign Up</button>
              </Link>
            </div>
          ) : (
            <div className="profile-section">
              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}

              <div className="profile-info">
                <p>
                  <strong>Username:</strong> {username || 'Not set'}
                </p>
              </div>

              <form onSubmit={handleChangeUsername} className="auth-form">
                <h3>{username ? 'Change Username' : 'Set Username'}</h3>
                <div className="form-group">
                  <label>Username:</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">
                  {username ? 'Change Username' : 'Set Username'}
                </button>
              </form>

              <form onSubmit={handleChangePassword} className="auth-form">
                <h3>Change Password</h3>
                <div className="form-group">
                  <label>Current Password:</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">Change Password</button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Big Logout at bottom */}
      {token && (
        <div className="account-logout">
          <button onClick={handleLogout}>Log Out</button>
        </div>
      )}
    </div>
  );
}

export default Account;
