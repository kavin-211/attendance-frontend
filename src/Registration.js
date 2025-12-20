import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Registration = () => {
  const [access, setAccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/check-access`);
        const { hasAccess, onWifi } = response.data;
        if (hasAccess && onWifi) {
          setAccess(true);
          setMessage('Access granted. You can register.');
        } else {
          setMessage('Access denied. Check your connection.');
        }
      } catch (error) {
        setMessage('Error checking access');
      }
    };
    checkAccess();
  }, []);

  const handleRegister = () => {
    if (access) {
      setMessage('Attendance registered successfully!');
    }
  };

  return (
    <div>
      <h2>Registration</h2>
      <p>{message}</p>
      {access && <button onClick={handleRegister}>Register Attendance</button>}
    </div>
  );
};

export default Registration;
