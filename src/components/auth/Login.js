import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import Login from './components/auth/Login';
import Dashboard from './components/admin/Dashboard';
import EmployeeManagement from './components/admin/EmployeeManagement';
import AttendanceControl from './components/admin/AttendanceControl';
import AttendanceHistory from './components/admin/AttendanceHistory';
import ShiftSettings from './components/admin/ShiftSettings';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Set axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            verifyToken();
        } else {
            setLoading(false);
        }
    }, []);

    const verifyToken = async () => {
        try {
            const response = await axios.get('/auth/verify');
            setUser(response.data.user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (userData, token) => {
        setUser(userData);
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <Router>
            <div className="App">
                {user && <Navbar user={user} onLogout={handleLogout} />}
                
                <Routes>
                    <Route path="/login" element={
                        user ? <Navigate to={user.role === 'employee' ? '/employee' : '/admin'} /> : 
                        <Login onLogin={handleLogin} />
                    } />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute user={user} allowedRoles={['admin', 'custodian']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/employees" element={
                        <ProtectedRoute user={user} allowedRoles={['admin', 'custodian']}>
                            <EmployeeManagement />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/attendance-control" element={
                        <ProtectedRoute user={user} allowedRoles={['admin', 'custodian']}>
                            <AttendanceControl />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/attendance-history" element={
                        <ProtectedRoute user={user} allowedRoles={['admin', 'custodian']}>
                            <AttendanceHistory />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/shift-settings" element={
                        <ProtectedRoute user={user} allowedRoles={['admin']}>
                            <ShiftSettings />
                        </ProtectedRoute>
                    } />
                    
                    {/* Employee Routes */}
                    <Route path="/employee" element={
                        <ProtectedRoute user={user} allowedRoles={['employee']}>
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/" element={
                        <Navigate to={user ? (user.role === 'employee' ? '/employee' : '/admin') : '/login'} />
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;