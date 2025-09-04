import React, { useState, useEffect } from 'react';
import { updateUserProfile, changePassword, deleteAccount } from '../services/api';
import './UserSettings.css';

const UserSettings = ({ user, setUser, handleLogout }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Profile form state
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        phone: '',
        location: ''
    });

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Account deletion state
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                location: user.location || ''
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const updatedUser = await updateUserProfile(profileData);
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage('Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            setError(err.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') {
            setError('Please type "DELETE" to confirm account deletion');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await deleteAccount();
            setMessage('Account deleted successfully. You will be logged out.');
            setTimeout(() => {
                handleLogout();
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to delete account');
        } finally {
            setLoading(false);
        }
    };

    const clearMessages = () => {
        setMessage('');
        setError('');
    };

    return (
        <div className="user-settings">
            <div className="settings-container">
                <h1 className="settings-title">Account Settings</h1>
                
                <div className="settings-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('profile'); clearMessages(); }}
                    >
                        Profile Information
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('password'); clearMessages(); }}
                    >
                        Change Password
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('account'); clearMessages(); }}
                    >
                        Account Management
                    </button>
                </div>

                <div className="settings-content">
                    {message && <div className="success-message">{message}</div>}
                    {error && <div className="error-message">{error}</div>}

                    {activeTab === 'profile' && (
                        <div className="tab-content">
                            <h2>Profile Information</h2>
                            <form onSubmit={handleProfileSubmit} className="settings-form">
                                <div className="form-group">
                                    <label htmlFor="username">Username *</label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={profileData.username}
                                        onChange={handleProfileChange}
                                        required
                                        minLength="3"
                                        maxLength="20"
                                    />
                                    <small>3-20 characters, letters and numbers only</small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        required
                                    />
                                    <small>This will be used for login and notifications</small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleProfileChange}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                    <small>Optional - for contact purposes</small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="location">Location</label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={profileData.location}
                                        onChange={handleProfileChange}
                                        placeholder="City, State/Country"
                                    />
                                    <small>Optional - helps with local rentals</small>
                                </div>

                                <button 
                                    type="submit" 
                                    className="submit-button"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Profile'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'password' && (
                        <div className="tab-content">
                            <h2>Change Password</h2>
                            <form onSubmit={handlePasswordSubmit} className="settings-form">
                                <div className="form-group">
                                    <label htmlFor="currentPassword">Current Password *</label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="newPassword">New Password *</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength="6"
                                    />
                                    <small>At least 6 characters long</small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm New Password *</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength="6"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="submit-button"
                                    disabled={loading}
                                >
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="tab-content">
                            <h2>Account Management</h2>
                            
                            <div className="account-info">
                                <div className="info-card">
                                    <h3>Account Status</h3>
                                    <p><strong>Status:</strong> Active</p>
                                    <p><strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                                    <p><strong>Last login:</strong> {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="danger-zone">
                                <h3>Danger Zone</h3>
                                <p>Once you delete your account, there is no going back. Please be certain.</p>
                                <button 
                                    className="danger-button"
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Delete Account</h3>
                            <button 
                                className="close-button"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Warning:</strong> This action cannot be undone. This will permanently delete your account and remove all your data.</p>
                            <p>Type <strong>DELETE</strong> to confirm:</p>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="Type DELETE here"
                                className="confirmation-input"
                            />
                        </div>
                        <div className="modal-actions">
                            <button 
                                className="cancel-button"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="danger-button"
                                onClick={handleDeleteAccount}
                                disabled={loading || deleteConfirmation !== 'DELETE'}
                            >
                                {loading ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserSettings;
