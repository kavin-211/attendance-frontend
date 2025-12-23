import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock, FaEnvelope, FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import './Login.css';

const Login = ({ onLogin, apiStatus }) => {
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordId, setForgotPasswordId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ipCheck, setIpCheck] = useState(null);
  
  const navigate = useNavigate();

  // Check IP on component mount
  React.useEffect(() => {
    checkIP();
  }, []);

  const checkIP = async () => {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      setIpCheck({
        ip: response.data.ip,
        status: 'detected'
      });
    } catch (error) {
      setIpCheck({
        ip: 'Unknown',
        status: 'failed'
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (apiStatus === 'offline') {
      setError('Backend server is offline. Please try again later.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', formData);
      
      if (response.data.success) {
        onLogin(response.data.user, response.data.token);
        navigate(response.data.user.role === 'employee' ? '/employee' : '/admin');
      } else {
        setError(response.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        // Server responded with error
        setError(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        // Request made but no response
        setError('Network error. Please check if backend server is running.');
      } else {
        // Other errors
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (apiStatus === 'offline') {
      setError('Backend server is offline. Password reset unavailable.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/auth/forgot-password', {
        userId: forgotPasswordId
      });
      
      if (response.data.success) {
        setSuccess(response.data.message);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data?.message || 'Error sending password reset');
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <FaWifi className="logo-icon" />
            <h1>WiFi Attendance System</h1>
          </div>
          <p>Secure Employee Attendance Management</p>
          
          <div className="connection-status">
            <div className={`status-indicator ${apiStatus}`}></div>
            <span>Backend: {apiStatus === 'online' ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          {ipCheck && (
            <div className="ip-info">
              <small>Your IP: {ipCheck.ip}</small>
            </div>
          )}
        </div>
        
        {!showForgotPassword ? (
          <>
            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="alert alert-error">
                  <FaExclamationTriangle /> {error}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="userId">
                  <FaUser className="input-icon" />
                  User ID / Email
                </label>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="Enter your User ID or Email"
                  required
                  disabled={apiStatus === 'offline' || loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">
                  <FaLock className="input-icon" />
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={apiStatus === 'offline' || loading}
                />
              </div>
              
              <button 
                type="submit" 
                className={`btn-login ${apiStatus === 'offline' ? 'disabled' : ''}`}
                disabled={apiStatus === 'offline' || loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
              
              <div className="login-footer">
                <button 
                  type="button"
                  className="btn-forgot"
                  onClick={() => setShowForgotPassword(true)}
                  disabled={apiStatus === 'offline'}
                >
                  Forgot Password?
                </button>
              </div>
            </form>
            
            <div className="login-info">
              <div className="demo-credentials">
                <h4>Demo Credentials:</h4>
                <div className="credential-item">
                  <strong>Custodian:</strong> UserID: 1234, Password: 1234
                </div>
                <div className="credential-item">
                  <strong>Admin:</strong> UserID: admin@company.com, Password: admin123
                </div>
                <div className="credential-item">
                  <strong>Employee:</strong> UserID: 1001, Password: employee123
                </div>
              </div>
              
              <div className="security-notice">
                <FaExclamationTriangle />
                <span>Registration requires admin WiFi connection.</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="login-header">
              <h2>Forgot Password</h2>
              <p>Enter your User ID to receive password</p>
            </div>
            
            <form onSubmit={handleForgotPassword} className="login-form">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              
              <div className="form-group">
                <label htmlFor="forgotUserId">
                  <FaEnvelope className="input-icon" />
                  User ID / Email
                </label>
                <input
                  type="text"
                  id="forgotUserId"
                  value={forgotPasswordId}
                  onChange={(e) => setForgotPasswordId(e.target.value)}
                  placeholder="Enter your User ID or Email"
                  required
                  disabled={apiStatus === 'offline' || loading}
                />
              </div>
              
              <div className="forgot-password-actions">
                <button 
                  type="submit" 
                  className={`btn-login ${apiStatus === 'offline' ? 'disabled' : ''}`}
                  disabled={apiStatus === 'offline' || loading}
                >
                  {loading ? 'Sending...' : 'Submit'}
                </button>
                
                <button 
                  type="button"
                  className="btn-back"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordId('');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Back to Login
                </button>
              </div>
            </form>
          </>
        )}
      </div>
      
      <div className="system-requirements">
        <h4>System Requirements:</h4>
        <ul>
          <li>✓ Admin WiFi required for registration</li>
          <li>✓ IP-based device authentication</li>
          <li>✓ Secure JWT authentication (24hr validity)</li>
          <li>✓ Role-based access control</li>
          <li>✓ Mobile & Desktop responsive</li>
        </ul>
      </div>
    </div>
  );
};

export default Login;