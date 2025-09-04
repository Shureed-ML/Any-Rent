import React, { useState, useEffect } from 'react';
import { getUserGrowthAnalytics, getRevenueAnalytics, getDashboardStats } from '../../services/adminApi';
import './Analytics.css';

const Analytics = () => {
    const [userGrowth, setUserGrowth] = useState([]);
    const [revenue, setRevenue] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState(30);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [userGrowthData, revenueData, statsData] = await Promise.all([
                getUserGrowthAnalytics(timeRange),
                getRevenueAnalytics(timeRange),
                getDashboardStats()
            ]);
            
            setUserGrowth(userGrowthData);
            setRevenue(revenueData);
            setDashboardStats(statsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateObj) => {
        return `${dateObj._id.year}-${String(dateObj._id.month).padStart(2, '0')}-${String(dateObj._id.day).padStart(2, '0')}`;
    };

    const calculateGrowthRate = (data) => {
        if (data.length < 2) return 0;
        const recent = data.slice(-7).reduce((sum, item) => sum + item.count, 0);
        const previous = data.slice(-14, -7).reduce((sum, item) => sum + item.count, 0);
        if (previous === 0) return recent > 0 ? 100 : 0;
        return ((recent - previous) / previous * 100).toFixed(1);
    };

    const calculateTotalRevenue = (data) => {
        return data.reduce((sum, item) => sum + item.totalRevenue, 0).toFixed(2);
    };

    const exportData = (data, filename) => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Date,Count,Revenue\n"
            + data.map(item => `${formatDate(item)},${item.count || 0},${item.totalRevenue || 0}`).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}_${timeRange}days.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="admin-loading">Loading analytics...</div>;
    if (error) return <div className="admin-error">Error: {error}</div>;

    const userGrowthRate = calculateGrowthRate(userGrowth);
    const totalRevenue = calculateTotalRevenue(revenue);

    return (
        <div className="analytics">
            <div className="analytics-header">
                <h1>Analytics & Reports</h1>
                <div className="time-range-selector">
                    <label>Time Range:</label>
                    <select value={timeRange} onChange={(e) => setTimeRange(parseInt(e.target.value))}>
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                        <option value={365}>Last year</option>
                    </select>
                </div>
            </div>

            <div className="analytics-overview">
                <div className="overview-card">
                    <h3>User Growth Rate</h3>
                    <div className="overview-value">
                        <span className={`growth-rate ${userGrowthRate >= 0 ? 'positive' : 'negative'}`}>
                            {userGrowthRate >= 0 ? '+' : ''}{userGrowthRate}%
                        </span>
                        <span className="overview-label">vs previous period</span>
                    </div>
                </div>
                
                <div className="overview-card">
                    <h3>Total Revenue</h3>
                    <div className="overview-value">
                        <span className="revenue-amount">${totalRevenue}</span>
                        <span className="overview-label">last {timeRange} days</span>
                    </div>
                </div>
                
                <div className="overview-card">
                    <h3>Average Daily Users</h3>
                    <div className="overview-value">
                        <span className="daily-average">
                            {userGrowth.length > 0 ? Math.round(userGrowth.reduce((sum, item) => sum + item.count, 0) / userGrowth.length) : 0}
                        </span>
                        <span className="overview-label">new users/day</span>
                    </div>
                </div>
                
                <div className="overview-card">
                    <h3>Platform Health</h3>
                    <div className="overview-value">
                        <span className="health-score">
                            {dashboardStats ? Math.round((dashboardStats.totalUsers / (dashboardStats.totalUsers + dashboardStats.activeRentals)) * 100) : 0}%
                        </span>
                        <span className="overview-label">engagement score</span>
                    </div>
                </div>
            </div>

            <div className="charts-section">
                <div className="chart-container">
                    <div className="chart-header">
                        <h3>User Registration Trend</h3>
                        <button onClick={() => exportData(userGrowth, 'user_growth')} className="export-btn">
                            Export CSV
                        </button>
                    </div>
                    <div className="simple-chart">
                        {userGrowth.length > 0 ? (
                            <div className="chart-bars">
                                {userGrowth.slice(-14).map((item, index) => (
                                    <div key={index} className="chart-bar-container">
                                        <div 
                                            className="chart-bar" 
                                            style={{ 
                                                height: `${Math.max((item.count / Math.max(...userGrowth.map(i => i.count))) * 100, 5)}%` 
                                            }}
                                        ></div>
                                        <span className="chart-label">{formatDate(item).slice(-5)}</span>
                                        <span className="chart-value">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data">No user growth data available</div>
                        )}
                    </div>
                </div>

                <div className="chart-container">
                    <div className="chart-header">
                        <h3>Revenue Trend</h3>
                        <button onClick={() => exportData(revenue, 'revenue')} className="export-btn">
                            Export CSV
                        </button>
                    </div>
                    <div className="simple-chart">
                        {revenue.length > 0 ? (
                            <div className="chart-bars">
                                {revenue.slice(-14).map((item, index) => (
                                    <div key={index} className="chart-bar-container">
                                        <div 
                                            className="chart-bar revenue-bar" 
                                            style={{ 
                                                height: `${Math.max((item.totalRevenue / Math.max(...revenue.map(i => i.totalRevenue))) * 100, 5)}%` 
                                            }}
                                        ></div>
                                        <span className="chart-label">{formatDate(item).slice(-5)}</span>
                                        <span className="chart-value">${item.totalRevenue}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data">No revenue data available</div>
                        )}
                    </div>
                </div>
            </div>

            {dashboardStats && (
                <div className="detailed-stats">
                    <h3>Detailed Platform Statistics</h3>
                    <div className="stats-table">
                        <div className="stats-row">
                            <span className="stats-label">Total Users:</span>
                            <span className="stats-value">{dashboardStats.totalUsers}</span>
                        </div>
                        <div className="stats-row">
                            <span className="stats-label">Total Items:</span>
                            <span className="stats-value">{dashboardStats.totalItems}</span>
                        </div>
                        <div className="stats-row">
                            <span className="stats-label">Total Rentals:</span>
                            <span className="stats-value">{dashboardStats.totalRentals}</span>
                        </div>
                        <div className="stats-row">
                            <span className="stats-label">Active Rentals:</span>
                            <span className="stats-value">{dashboardStats.activeRentals}</span>
                        </div>
                        <div className="stats-row">
                            <span className="stats-label">Total Reviews:</span>
                            <span className="stats-value">{dashboardStats.totalReviews}</span>
                        </div>
                        <div className="stats-row">
                            <span className="stats-label">Total Messages:</span>
                            <span className="stats-value">{dashboardStats.totalMessages}</span>
                        </div>
                        <div className="stats-row">
                            <span className="stats-label">New Users This Month:</span>
                            <span className="stats-value highlight">{dashboardStats.newUsersThisMonth}</span>
                        </div>
                        <div className="stats-row">
                            <span className="stats-label">New Items This Month:</span>
                            <span className="stats-value highlight">{dashboardStats.newItemsThisMonth}</span>
                        </div>
                        <div className="stats-row">
                            <span className="stats-label">New Rentals This Month:</span>
                            <span className="stats-value highlight">{dashboardStats.newRentalsThisMonth}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="analytics-actions">
                <button onClick={fetchAnalytics} className="refresh-btn">
                    Refresh Data
                </button>
                <button onClick={() => window.print()} className="print-btn">
                    Print Report
                </button>
            </div>
        </div>
    );
};

export default Analytics;
