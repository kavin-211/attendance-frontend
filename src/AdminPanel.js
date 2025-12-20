import React, { useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [ip, setIp] = useState('');
  const [message, setMessage] = useState('');

  const handleAddIP = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/add-ip`, { ip });
      setMessage(response.data.message);
      localStorage.setItem('allowedIPs', JSON.stringify(response.data.allowedIPs));
    } catch (error) {
      setMessage('Error adding IP');
    }
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <input
        type="text"
        placeholder="Enter IP address"
        value={ip}
        onChange={(e) => setIp(e.target.value)}
      />
      <button onClick={handleAddIP}>Add IP</button>
      <p>{message}</p>
    </div>
  );
};

export default AdminPanel;
