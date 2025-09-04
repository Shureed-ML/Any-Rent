import React, { useState, useEffect } from 'react';
import { getSystemLogs, getUserActivity, getSystemStats } from '../../services/adminApi';
import './SystemMonitoring.css';

const SystemMonitoring = () => {
    const [activeTab, setActiveTab] = useState('stats');
    const [systemStats, setSystemStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        logLevel: '',
        logCategory: '',
        activityAction: '',
        activityUserId: ''
    });

    useEffect(() => {
        if (activeTab === 'stats') {
            fetchSystemStats();
        } else if (activeTab === 'logs') {
            fetchLogs();
        } else if (activeTab === 'activity') {
            fetchActivity();
        }
    }, [activeTab]);

    const fetchSystemStats = async () => {
        try {
            setLoading(true);
            const data = await getSystemStats();
            setSystemStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await getSystemLogs(1, 50, filters.logLevel, filters.logCategory);
            setLogs(data.logs);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchActivity = async () => {
        try {
            setLoading(true);
            const data = await getUserActivity(1, 50, filters.activityAction, filters.activityUserId);
            setActivities(data.activities);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        if (activeTab === 'logs') {
            fetchLogs();
        } else if (activeTab === 'activity') {
            fetchActivity();
        }
    };

    const getLogLevelClass = (level) => {
        switch (level) {
            case 'error': return 'log-error';
            case 'warning': return 'log-warning';
            case 'critical': return 'log-critical';
            default: return 'log-info';
        }
    };

    const renderStats = () => {
        if (!systemStats) return null;

        return (
            <div className="system-stats">
                <div className="stats-section">
                    <h3>Today's Activity</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-number">{systemStats.dailyStats.users}</span>
                            <span className="stat-label">New Users</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{systemStats.dailyStats.items}</span>
                            <span className="stat-label">New Items</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{systemStats.dailyStats.rentals}</span>
                            <span className="stat-label">New Rentals</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{systemStats.dailyStats.logins}</span>
                            <span className="stat-label">User Logins</span>
                        </div>
                    </div>
                </div>

                <div className="stats-section">
                    <h3>System Health</h3>
                    <div className="health-grid">
                        <div className="health-item">
                            <span className="health-label">Suspended Users</span>
                            <span className={`health-value ${systemStats.systemHealth.suspendedUsers > 0 ? 'warning' : 'good'}`}>
                                {systemStats.systemHealth.suspendedUsers}
                            </span>
                        </div>
                        <div className="health-item">
                            <span className="health-label">Pending Items</span>
                            <span className="health-value">{systemStats.systemHealth.pendingItems}</span>
                        </div>
                        <div className="health-item">
                            <span className="health-label">Active Warnings</span>
                            <span className={`health-value ${systemStats.systemHealth.activeWarnings > 0 ? 'warning' : 'good'}`}>
                                {systemStats.systemHealth.activeWarnings}
                            </span>
                        </div>
                        <div className="health-item">
                            <span className="health-label">Error Logs Today</span>
                            <span className={`health-value ${systemStats.systemHealth.errorLogs > 0 ? 'error' : 'good'}`}>
                                {systemStats.systemHealth.errorLogs}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="stats-section">
                    <h3>Weekly Trends</h3>
                    <div className="trends-grid">
                        <div className="trend-item">
                            <span className="trend-label">Users</span>
                            <span className="trend-value">{systemStats.weeklyStats.users}</span>
                        </div>
                        <div className="trend-item">
                            <span className="trend-label">Items</span>
                            <span className="trend-value">{systemStats.weeklyStats.items}</span>
                        </div>
                        <div className="trend-item">
                            <span className="trend-label">Rentals</span>
                            <span className="trend-value">{systemStats.weeklyStats.rentals}</span>
                        </div>
                        <div className="trend-item">
                            <span className="trend-label">Reviews</span>
                            <span className="trend-value">{systemStats.weeklyStats.reviews}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderLogs = () => (
        <div className="system-logs">
            <div className="logs-filters">
                <select
                    value={filters.logLevel}
                    onChange={(e) => handleFilterChange('logLevel', e.target.value)}
                >
                    <option value="">All Levels</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                </select>
                <select
                    value={filters.logCategory}
                    onChange={(e) => handleFilterChange('logCategory', e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="auth">Auth</option>
                    <option value="user">User</option>
                    <option value="item">Item</option>
                    <option value="rental">Rental</option>
                    <option value="system">System</option>
                    <option value="security">Security</option>
                </select>
                <button onClick={applyFilters} className="apply-filters-btn">Apply Filters</button>
            </div>
            
            <div className="logs-list">
                {logs.map(log => (
                    <div key={log._id} className={`log-item ${getLogLevelClass(log.level)}`}>
                        <div className="log-header">
                            <span className="log-level">{log.level.toUpperCase()}</span>
                            <span className="log-category">{log.category}</span>
                            <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="log-message">{log.message}</div>
                        {log.details && (
                            <div className="log-details">
                                <pre>{JSON.stringify(log.details, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderActivity = () => (
        <div className="user-activity">
            <div className="activity-filters">
                <select
                    value={filters.activityAction}
                    onChange={(e) => handleFilterChange('activityAction', e.target.value)}
                >
                    <option value="">All Actions</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="item_create">Item Create</option>
                    <option value="item_update">Item Update</option>
                    <option value="rental_create">Rental Create</option>
                    <option value="review_create">Review Create</option>
                </select>
                <input
                    type="text"
                    placeholder="User ID"
                    value={filters.activityUserId}
                    onChange={(e) => handleFilterChange('activityUserId', e.target.value)}
                />
                <button onClick={applyFilters} className="apply-filters-btn">Apply Filters</button>
            </div>
            
            <div className="activity-list">
                {activities.map(activity => (
                    <div key={activity._id} className="activity-item">
                        <div className="activity-header">
                            <span className="activity-user">
                                {activity.userId?.username || 'Unknown User'}
                            </span>
                            <span className="activity-action">{activity.action}</span>
                            <span className="activity-time">
                                {new Date(activity.timestamp).toLocaleString()}
                            </span>
                        </div>
                        {activity.details && (
                            <div className="activity-details">
                                <pre>{JSON.stringify(activity.details, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="system-monitoring">
            <div className="monitoring-header">
                <h1>System Monitoring</h1>
                <div className="tab-buttons">
                    <button
                        className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        Statistics
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('logs')}
                    >
                        System Logs
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
                        onClick={() => setActiveTab('activity')}
                    >
                        User Activity
                    </button>
                </div>
            </div>

            {error && <div className="admin-error">{error}</div>}
            
            {loading ? (
                <div className="admin-loading">Loading...</div>
            ) : (
                <div className="monitoring-content">
                    {activeTab === 'stats' && renderStats()}
                    {activeTab === 'logs' && renderLogs()}
                    {activeTab === 'activity' && renderActivity()}
                </div>
            )}
        </div>
    );
};

export default SystemMonitoring;
