import React, { useState, useEffect } from 'react';
import { 
    FaUsers, 
    FaCheckCircle, 
    FaTimesCircle, 
    FaClock,
    FaChartPie,
    FaDownload
} from 'react-icons/fa';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        present: 0,
        absent: 0,
        late: 0
    });
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(null);
    const [attendanceReport, setAttendanceReport] = useState([]);
    const [recentLogs, setRecentLogs] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        fetchAttendanceReport();
        fetchRecentLogs();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/admin/dashboard/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceReport = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await axios.get(`/attendance/report?date=${today}`);
            if (response.data.success) {
                setAttendanceReport(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching attendance report:', error);
        }
    };

    const fetchRecentLogs = async () => {
        try {
            const response = await axios.get('/attendance/recent?limit=10');
            if (response.data.success) {
                setRecentLogs(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching recent logs:', error);
        }
    };

    const statCards = [
        {
            id: 'total',
            title: 'Total Employees',
            value: stats.totalEmployees,
            icon: <FaUsers />,
            color: '#4e73df',
            data: stats
        },
        {
            id: 'present',
            title: 'Total Present',
            value: stats.present,
            icon: <FaCheckCircle />,
            color: '#1cc88a',
            data: { present: stats.present }
        },
        {
            id: 'absent',
            title: 'Total Absent',
            value: stats.absent,
            icon: <FaTimesCircle />,
            color: '#e74a3b',
            data: { absent: stats.absent }
        },
        {
            id: 'late',
            title: 'Late Comers',
            value: stats.late,
            icon: <FaClock />,
            color: '#f6c23e',
            data: { late: stats.late }
        }
    ];

    const handleCardClick = (card) => {
        setShowDialog(card);
    };

    const downloadReport = (format) => {
        // Implement CSV/Excel download logic
        console.log(`Downloading ${format} report`);
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <div className="quick-links">
                    <button 
                        className="btn-quick-link"
                        onClick={() => setShowDialog('attendance-report')}
                    >
                        <FaChartPie /> Attendance Report
                    </button>
                    <button 
                        className="btn-quick-link"
                        onClick={() => setShowDialog('recent-logs')}
                    >
                        <FaChartPie /> Recent Logs
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                {statCards.map((card) => (
                    <div 
                        key={card.id}
                        className="stat-card"
                        style={{ borderTop: `4px solid ${card.color}` }}
                        onClick={() => handleCardClick(card)}
                    >
                        <div className="stat-icon" style={{ color: card.color }}>
                            {card.icon}
                        </div>
                        <div className="stat-content">
                            <h3>{card.title}</h3>
                            <p className="stat-value">{card.value}</p>
                            <p className="stat-subtitle">Today's count</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dialog Modals */}
            {showDialog && (
                <div className="dialog-overlay" onClick={() => setShowDialog(null)}>
                    <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="dialog-close"
                            onClick={() => setShowDialog(null)}
                        >
                            &times;
                        </button>
                        
                        {showDialog.id === 'attendance-report' ? (
                            <div className="attendance-report-dialog">
                                <h3>Today's Attendance Report</h3>
                                <div className="dialog-actions">
                                    <button 
                                        className="btn-download"
                                        onClick={() => downloadReport('excel')}
                                    >
                                        <FaDownload /> Download Excel
                                    </button>
                                    <button 
                                        className="btn-download"
                                        onClick={() => downloadReport('csv')}
                                    >
                                        <FaDownload /> Download CSV
                                    </button>
                                </div>
                                <div className="table-responsive">
                                    <table className="attendance-table">
                                        <thead>
                                            <tr>
                                                <th>Employee ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Designation</th>
                                                <th>Check-in Time</th>
                                                <th>Check-out Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendanceReport.map((record) => (
                                                <tr key={record._id}>
                                                    <td>{record.employeeId}</td>
                                                    <td>{record.employeeName}</td>
                                                    <td>{record.employeeEmail}</td>
                                                    <td>{record.designation}</td>
                                                    <td>{new Date(record.checkIn).toLocaleTimeString()}</td>
                                                    <td>
                                                        {record.checkOut 
                                                            ? new Date(record.checkOut).toLocaleTimeString()
                                                            : 'Not checked out'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : showDialog.id === 'recent-logs' ? (
                            <div className="recent-logs-dialog">
                                <h3>Recent Attendance Logs</h3>
                                <div className="table-responsive">
                                    <table className="attendance-table">
                                        <thead>
                                            <tr>
                                                <th>User ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Designation</th>
                                                <th>Check-in Time</th>
                                                <th>Check-out Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentLogs.map((log) => (
                                                <tr key={log._id}>
                                                    <td>{log.userId}</td>
                                                    <td>{log.username}</td>
                                                    <td>{log.email}</td>
                                                    <td>{log.designation}</td>
                                                    <td>{new Date(log.checkIn).toLocaleString()}</td>
                                                    <td>
                                                        {log.checkOut 
                                                            ? new Date(log.checkOut).toLocaleString()
                                                            : 'Not checked out'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="stat-dialog">
                                <h3>{showDialog.title} Details</h3>
                                <div className="stat-chart">
                                    {/* Add pie chart here */}
                                    <div className="pie-chart-placeholder">
                                        <div 
                                            className="pie-chart"
                                            style={{
                                                background: `conic-gradient(${showDialog.color} 0% ${(showDialog.value / stats.totalEmployees) * 100}%, #eee 0% 100%)`
                                            }}
                                        ></div>
                                        <p>{showDialog.value} out of {stats.totalEmployees}</p>
                                    </div>
                                </div>
                                <p>Percentage: {((showDialog.value / stats.totalEmployees) * 100).toFixed(1)}%</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;