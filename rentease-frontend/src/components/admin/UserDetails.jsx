import React, { useState, useEffect } from 'react';
import { getUserDetails, suspendUser, warnUser, verifyUser } from '../../services/adminApi';
import './UserDetails.css';

const UserDetails = ({ userId, onClose }) => {
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showWarningForm, setShowWarningForm] = useState(false);
    const [warningData, setWarningData] = useState({
        reason: '',
        severity: 'medium'
    });

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const data = await getUserDetails(userId);
            setUserDetails(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async () => {
        const reason = prompt('Enter suspension reason:');
        if (!reason) return;

        try {
            setActionLoading(true);
            await suspendUser(userId, reason);
            fetchUserDetails();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleWarn = async () => {
        try {
            setActionLoading(true);
            await warnUser(userId, warningData.reason, warningData.severity);
            setShowWarningForm(false);
            setWarningData({ reason: '', severity: 'medium' });
            fetchUserDetails();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerify = async (status) => {
        try {
            setActionLoading(true);
            await verifyUser(userId, status);
            fetchUserDetails();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="user-details-loading">Loading user details...</div>;
    if (error) return <div className="user-details-error">Error: {error}</div>;
    if (!userDetails) return null;

    const { user, statistics, recentActivity, warnings } = userDetails;

    return (
        <div className="user-details-overlay">
            <div className="user-details-modal">
                <div className="user-details-header">
                    <h2>User Details: {user.username}</h2>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <div className="user-details-content">
                    <div className="user-info-section">
                        <h3>Basic Information</h3>
                        <div className="user-info-grid">
                            <div className="info-item">
                                <label>Username:</label>
                                <span>{user.username}</span>
                            </div>
                            <div className="info-item">
                                <label>Email:</label>
                                <span>{user.email}</span>
                            </div>
                            <div className="info-item">
                                <label>Status:</label>
                                <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="info-item">
                                <label>Suspended:</label>
                                <span className={`status-badge ${user.isSuspended ? 'suspended' : 'normal'}`}>
                                    {user.isSuspended ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="info-item">
                                <label>Verification:</label>
                                <span className={`verification-badge ${user.verificationStatus}`}>
                                    {user.verificationStatus}
                                </span>
                            </div>
                            <div className="info-item">
                                <label>Warnings:</label>
                                <span className="warning-count">{user.warningsCount || 0}</span>
                            </div>
                            <div className="info-item">
                                <label>Joined:</label>
                                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="info-item">
                                <label>Last Login:</label>
                                <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="statistics-section">
                        <h3>Statistics</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-number">{statistics.itemsCount}</span>
                                <span className="stat-label">Items Listed</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{statistics.reviewsCount}</span>
                                <span className="stat-label">Reviews Written</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{statistics.rentalsAsRenter}</span>
                                <span className="stat-label">Items Rented</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{statistics.rentalsAsOwner}</span>
                                <span className="stat-label">Items Rented Out</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{statistics.messagesCount}</span>
                                <span className="stat-label">Messages</span>
                            </div>
                        </div>
                    </div>

                    <div className="actions-section">
                        <h3>Actions</h3>
                        <div className="action-buttons">
                            <button
                                onClick={handleSuspend}
                                disabled={actionLoading}
                                className={`action-btn ${user.isSuspended ? 'unsuspend' : 'suspend'}`}
                            >
                                {user.isSuspended ? 'Unsuspend' : 'Suspend'} User
                            </button>
                            <button
                                onClick={() => setShowWarningForm(true)}
                                disabled={actionLoading}
                                className="action-btn warn"
                            >
                                Issue Warning
                            </button>
                            {user.verificationStatus === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleVerify('verified')}
                                        disabled={actionLoading}
                                        className="action-btn verify"
                                    >
                                        Verify User
                                    </button>
                                    <button
                                        onClick={() => handleVerify('rejected')}
                                        disabled={actionLoading}
                                        className="action-btn reject"
                                    >
                                        Reject Verification
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {warnings.length > 0 && (
                        <div className="warnings-section">
                            <h3>Recent Warnings</h3>
                            <div className="warnings-list">
                                {warnings.map(warning => (
                                    <div key={warning._id} className="warning-item">
                                        <div className="warning-header">
                                            <span className={`severity-badge ${warning.severity}`}>
                                                {warning.severity}
                                            </span>
                                            <span className="warning-date">
                                                {new Date(warning.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="warning-reason">{warning.reason}</div>
                                        <div className="warning-issuer">
                                            Issued by: {warning.issuedBy?.username}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {recentActivity.length > 0 && (
                        <div className="activity-section">
                            <h3>Recent Activity</h3>
                            <div className="activity-list">
                                {recentActivity.slice(0, 10).map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <span className="activity-action">{activity.action}</span>
                                        <span className="activity-time">
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {showWarningForm && (
                    <div className="warning-form-overlay">
                        <div className="warning-form">
                            <h3>Issue Warning</h3>
                            <div className="form-group">
                                <label>Reason:</label>
                                <textarea
                                    value={warningData.reason}
                                    onChange={(e) => setWarningData({...warningData, reason: e.target.value})}
                                    placeholder="Enter warning reason..."
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Severity:</label>
                                <select
                                    value={warningData.severity}
                                    onChange={(e) => setWarningData({...warningData, severity: e.target.value})}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button onClick={handleWarn} disabled={actionLoading || !warningData.reason}>
                                    Issue Warning
                                </button>
                                <button onClick={() => setShowWarningForm(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDetails;
