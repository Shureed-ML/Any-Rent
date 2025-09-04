import React, { useState, useEffect } from 'react';
import { getUsers, toggleUserAdmin, deleteUser } from '../../services/adminApi';
import UserDetails from './UserDetails';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchTerm]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers(currentPage, 10, searchTerm);
            setUsers(data.users);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (userId) => {
        try {
            setActionLoading(prev => ({ ...prev, [userId]: true }));
            await toggleUserAdmin(userId);
            fetchUsers(); // Refresh the list
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            setActionLoading(prev => ({ ...prev, [userId]: true }));
            await deleteUser(userId);
            fetchUsers(); // Refresh the list
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    if (loading) return <div className="admin-loading">Loading users...</div>;

    return (
        <div className="user-management">
            <div className="management-header">
                <h1>User Management</h1>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search users by username or email..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Admin</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>
                                    <button
                                        onClick={() => setSelectedUserId(user._id)}
                                        className="username-link"
                                    >
                                        {user.username}
                                    </button>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`admin-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                                        {user.isAdmin ? 'Admin' : 'User'}
                                    </span>
                                    {user.isSuspended && (
                                        <span className="admin-badge suspended">Suspended</span>
                                    )}
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="actions-cell">
                                    <button
                                        onClick={() => handleToggleAdmin(user._id)}
                                        disabled={actionLoading[user._id]}
                                        className={`action-btn ${user.isAdmin ? 'demote' : 'promote'}`}
                                    >
                                        {actionLoading[user._id] ? 'Loading...' : 
                                         user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user._id)}
                                        disabled={actionLoading[user._id]}
                                        className="action-btn delete"
                                    >
                                        {actionLoading[user._id] ? 'Loading...' : 'Delete'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                </div>
            )}

            {selectedUserId && (
                <UserDetails
                    userId={selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                />
            )}
        </div>
    );
};

export default UserManagement;
