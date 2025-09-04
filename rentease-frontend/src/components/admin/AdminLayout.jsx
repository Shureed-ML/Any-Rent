import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import ItemManagement from './ItemManagement';
import ReviewManagement from './ReviewManagement';
import RentalManagement from './RentalManagement';
import SystemMonitoring from './SystemMonitoring';
import Analytics from './Analytics';
import './AdminLayout.css';

const AdminLayout = ({ user, handleLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboard />;
            case 'users':
                return <UserManagement />;
            case 'items':
                return <ItemManagement />;
            case 'reviews':
                return <ReviewManagement />;
            case 'rentals':
                return <RentalManagement />;
            case 'monitoring':
                return <SystemMonitoring />;
            case 'analytics':
                return <Analytics />;
            default:
                return <AdminDashboard />;
        }
    };

    return (
        <div className="admin-layout">
            <div className="admin-sidebar">
                <div className="admin-header">
                    <h2>Admin Panel</h2>
                    <div className="admin-user-info">
                        Welcome, {user.username}
                    </div>
                </div>
                
                <nav className="admin-nav">
                    <button
                        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 Users
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'items' ? 'active' : ''}`}
                        onClick={() => setActiveTab('items')}
                    >
                        📦 Items
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        ⭐ Reviews
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'rentals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rentals')}
                    >
                        🏠 Rentals
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'monitoring' ? 'active' : ''}`}
                        onClick={() => setActiveTab('monitoring')}
                    >
                        🔍 Monitoring
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        📊 Analytics
                    </button>
                </nav>

                <div className="admin-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        🚪 Logout
                    </button>
                </div>
            </div>

            <div className="admin-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminLayout;
