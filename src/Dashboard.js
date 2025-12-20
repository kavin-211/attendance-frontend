import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/dashboard`);
        setMessage(response.data.message);
      } catch (error) {
        setMessage('Access denied.');
      }
    };
    checkAccess();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>{message}</p>
    </div>
  );
};

export default Dashboard;
