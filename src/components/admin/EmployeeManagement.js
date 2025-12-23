import React, { useState, useEffect } from 'react';
import { 
    FaEdit, 
    FaTrash, 
    FaEye, 
    FaPlus, 
    FaSearch,
    FaDownload,
    FaUserPlus
} from 'react-icons/fa';
import axios from 'axios';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        mobile: '',
        designation: '',
        department: 'General',
        ipAddresses: [''],
        password: '',
        profilePhoto: ''
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('/admin/employees');
            if (response.data.success) {
                setEmployees(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        // Implement debounced search
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/admin/employees', formData);
            if (response.data.success) {
                setShowAddModal(false);
                setFormData({
                    username: '',
                    email: '',
                    mobile: '',
                    designation: '',
                    department: 'General',
                    ipAddresses: [''],
                    password: '',
                    profilePhoto: ''
                });
                fetchEmployees();
            }
        } catch (error) {
            console.error('Error adding employee:', error);
        }
    };

    const handleEditEmployee = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `/admin/employees/${selectedEmployee._id}`,
                formData
            );
            if (response.data.success) {
                setShowEditModal(false);
                fetchEmployees();
            }
        } catch (error) {
            console.error('Error updating employee:', error);
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this employee?')) {
            try {
                const response = await axios.delete(`/admin/employees/${id}`);
                if (response.data.success) {
                    fetchEmployees();
                }
            } catch (error) {
                console.error('Error deleting employee:', error);
            }
        }
    };

    const handleViewAttendance = async (employee) => {
        setSelectedEmployee(employee);
        try {
            const response = await axios.get(
                `/admin/employees/${employee._id}/attendance`
            );
            if (response.data.success) {
                setAttendanceData(response.data.data);
                setShowAttendanceModal(true);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const filteredEmployees = employees.filter(employee =>
        employee.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const downloadTable = (format) => {
        // Implement CSV/Excel download logic
        const data = filteredEmployees.map(emp => ({
            EmployeeID: emp.userId,
            EmployeeName: emp.username,
            Designation: emp.designation,
            Department: emp.department,
            Email: emp.email,
            Status: emp.status
        }));
        
        console.log(`Downloading ${format}:`, data);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading employees...</p>
            </div>
        );
    }

    return (
        <div className="employee-management-container">
            <div className="management-header">
                <h1>Employee Management</h1>
                <div className="header-actions">
                    <button 
                        className="btn-add"
                        onClick={() => setShowAddModal(true)}
                    >
                        <FaUserPlus /> Add Employee
                    </button>
                    <div className="download-buttons">
                        <button 
                            className="btn-download"
                            onClick={() => downloadTable('excel')}
                        >
                            <FaDownload /> Excel
                        </button>
                        <button 
                            className="btn-download"
                            onClick={() => downloadTable('csv')}
                        >
                            <FaDownload /> CSV
                        </button>
                    </div>
                </div>
            </div>

            <div className="search-container">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="employee-table">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Employee Name</th>
                            <th>Designation</th>
                            <th>Department</th>
                            <th>IP Address</th>
                            <th>Password</th>
                            <th>Current Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((employee) => (
                            <tr key={employee._id}>
                                <td>{employee.userId}</td>
                                <td>{employee.username}</td>
                                <td>{employee.designation}</td>
                                <td>{employee.department}</td>
                                <td>
                                    {employee.ipAddresses?.length > 0 
                                        ? employee.ipAddresses.join(', ')
                                        : 'Not set'}
                                </td>
                                <td>••••••••</td>
                                <td>
                                    <span className={`status-badge ${employee.status}`}>
                                        {employee.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button 
                                            className="btn-action btn-edit"
                                            onClick={() => {
                                                setSelectedEmployee(employee);
                                                setFormData({
                                                    username: employee.username,
                                                    email: employee.email,
                                                    mobile: employee.mobile || '',
                                                    designation: employee.designation,
                                                    department: employee.department,
                                                    ipAddresses: employee.ipAddresses || [''],
                                                    password: '',
                                                    profilePhoto: employee.profilePhoto || ''
                                                });
                                                setShowEditModal(true);
                                            }}
                                        >
                                            <FaEdit /> Edit
                                        </button>
                                        <button 
                                            className="btn-action btn-delete"
                                            onClick={() => handleDeleteEmployee(employee._id)}
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                        <button 
                                            className="btn-action btn-view"
                                            onClick={() => handleViewAttendance(employee)}
                                        >
                                            <FaEye /> View Attendance
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="modal-close"
                            onClick={() => setShowAddModal(false)}
                        >
                            &times;
                        </button>
                        <h2>Add New Employee</h2>
                        <form onSubmit={handleAddEmployee}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Profile Photo URL</label>
                                    <input
                                        type="text"
                                        value={formData.profilePhoto}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            profilePhoto: e.target.value
                                        })}
                                        placeholder="Enter image URL"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            username: e.target.value
                                        })}
                                        required
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            email: e.target.value
                                        })}
                                        required
                                        placeholder="Enter email"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mobile Number</label>
                                    <input
                                        type="tel"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            mobile: e.target.value
                                        })}
                                        placeholder="Enter mobile number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Designation *</label>
                                    <input
                                        type="text"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            designation: e.target.value
                                        })}
                                        required
                                        placeholder="Enter designation"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>IP Addresses (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.ipAddresses.join(', ')}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            ipAddresses: e.target.value.split(',').map(ip => ip.trim())
                                        })}
                                        placeholder="e.g., 192.168.1.1, 192.168.1.2"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            password: e.target.value
                                        })}
                                        required
                                        placeholder="Enter password"
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    Add Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Attendance Modal */}
            {showAttendanceModal && selectedEmployee && (
                <div className="modal-overlay" onClick={() => setShowAttendanceModal(false)}>
                    <div className="modal-content wide-modal" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="modal-close"
                            onClick={() => setShowAttendanceModal(false)}
                        >
                            &times;
                        </button>
                        <h2>
                            Attendance Report - {selectedEmployee.username} 
                            ({selectedEmployee.userId})
                        </h2>
                        <p className="modal-subtitle">This Month's Attendance</p>
                        
                        <div className="attendance-totals">
                            <div className="total-box">
                                <h4>Total Hours</h4>
                                <p className="total-value">
                                    {attendanceData.totals?.totalHours || 0}
                                </p>
                            </div>
                            <div className="total-box">
                                <h4>Late Count</h4>
                                <p className="total-value late">
                                    {attendanceData.totals?.lateCount || 0}
                                </p>
                            </div>
                            <div className="total-box">
                                <h4>Loss of Pay</h4>
                                <p className="total-value loss">
                                    ₹{attendanceData.totals?.lossOfPay || 0}
                                </p>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>In-Time</th>
                                        <th>Out-Time</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceData.data?.map((record) => (
                                        <tr key={record._id}>
                                            <td>{new Date(record.date).toLocaleDateString()}</td>
                                            <td>{new Date(record.checkIn).toLocaleTimeString()}</td>
                                            <td>
                                                {record.checkOut 
                                                    ? new Date(record.checkOut).toLocaleTimeString()
                                                    : 'Not checked out'}
                                            </td>
                                            <td>{record.workedHours} hours</td>
                                            <td>
                                                <span className={`status-badge ${record.status}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;