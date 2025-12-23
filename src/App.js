import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [ipList, setIpList] = useState([]);
  const [newIp, setNewIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://attendance-backend-drab.vercel.app';

  useEffect(() => {
    checkBackendConnection();
    fetchIPs();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/health`);
      setBackendStatus({
        connected: true,
        data: response.data
      });
      setMessage('✅ Backend connection successful!');
    } catch (error) {
      setBackendStatus({
        connected: false,
        error: error.message
      });
      setMessage('❌ Failed to connect to backend');
    }
  };

  const fetchIPs = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/ips`);
      setIpList(response.data.allowedIPs || []);
    } catch (error) {
      console.error('Error fetching IPs:', error);
    }
  };

  const handleAddIP = async (e) => {
    e.preventDefault();
    if (!newIp.trim()) {
      setMessage('❌ Please enter a valid IP address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/add-ip`, {
        ip: newIp.trim()
      });
      setIpList(response.data.allowedIPs || []);
      setMessage(`✅ IP ${newIp} added successfully! Total IPs: ${response.data.count}`);
      setNewIp('');
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎯 Attendance Management System</h1>
        
        {/* Backend Status */}
        <div className="status-card">
          <h2>Backend Connection Status</h2>
          {backendStatus ? (
            <>
              <p className={backendStatus.connected ? 'connected' : 'disconnected'}>
                Status: {backendStatus.connected ? '✅ CONNECTED' : '❌ DISCONNECTED'}
              </p>
              {backendStatus.connected && (
                <div className="status-details">
                  <p>Service: {backendStatus.data?.service}</p>
                  <p>Version: {backendStatus.data?.version}</p>
                  <p>Uptime: {Math.floor(backendStatus.data?.uptime || 0)} seconds</p>
                </div>
              )}
            </>
          ) : (
            <p>Checking connection...</p>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* IP Management Section */}
        <div className="ip-section">
          <h2>📋 Manage Allowed IPs</h2>
          
          {/* Add IP Form */}
          <form onSubmit={handleAddIP} className="ip-form">
            <input
              type="text"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Adding...' : '➕ Add IP'}
            </button>
          </form>

          {/* IP List */}
          <div className="ip-list">
            <h3>Current Allowed IPs ({ipList.length})</h3>
            {ipList.length === 0 ? (
              <p className="empty-list">No IPs added yet. Add your first IP above!</p>
            ) : (
              <ul>
                {ipList.map((ip, index) => (
                  <li key={index}>
                    <span className="ip-number">{index + 1}.</span>
                    <span className="ip-address">{ip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Refresh Button */}
          <button 
            onClick={() => {
              checkBackendConnection();
              fetchIPs();
              setMessage('🔄 Refreshing data...');
            }} 
            className="refresh-btn"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Connection Info */}
        <div className="connection-info">
          <h3>🔗 Connection Information</h3>
          <p><strong>Frontend URL:</strong> {window.location.origin}</p>
          <p><strong>Backend URL:</strong> {BACKEND_URL}</p>
        </div>
      </header>
    </div>
  );
}

export default App;