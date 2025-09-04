import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/adminApi';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await getDashboardStats();
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="admin-loading">Loading dashboard...</div>;
    if (error) return <div className="admin-error">Error: {error}</div>;

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <div className="stat-number">{stats.totalUsers}</div>
                    <div className="stat-subtitle">+{stats.newUsersThisMonth} this month</div>
                </div>
                
                <div className="stat-card">
                    <h3>Total Items</h3>
                    <div className="stat-number">{stats.totalItems}</div>
                    <div className="stat-subtitle">+{stats.newItemsThisMonth} this month</div>
                </div>
                
                <div className="stat-card">
                    <h3>Total Rentals</h3>
                    <div className="stat-number">{stats.totalRentals}</div>
                    <div className="stat-subtitle">+{stats.newRentalsThisMonth} this month</div>
                </div>
                
                <div className="stat-card">
                    <h3>Active Rentals</h3>
                    <div className="stat-number">{stats.activeRentals}</div>
                    <div className="stat-subtitle">Currently ongoing</div>
                </div>
                
                <div className="stat-card">
                    <h3>Total Reviews</h3>
                    <div className="stat-number">{stats.totalReviews}</div>
                    <div className="stat-subtitle">User feedback</div>
                </div>
                
                <div className="stat-card">
                    <h3>Total Messages</h3>
                    <div className="stat-number">{stats.totalMessages}</div>
                    <div className="stat-subtitle">Platform communication</div>
                </div>
            </div>

            <div className="dashboard-section">
                <h2>Top Categories</h2>
                <div className="categories-list">
                    {stats.topCategories.map((category, index) => (
                        <div key={category._id} className="category-item">
                            <span className="category-rank">#{index + 1}</span>
                            <span className="category-name">{category._id}</span>
                            <span className="category-count">{category.count} items</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dashboard-actions">
                <button onClick={fetchStats} className="refresh-btn">
                    Refresh Data
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
