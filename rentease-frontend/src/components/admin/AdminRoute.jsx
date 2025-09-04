import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ user, children }) => {
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (!user.isAdmin) {
        return (
            <div style={{ 
                padding: '2rem', 
                textAlign: 'center',
                color: '#e74c3c'
            }}>
                <h2>Access Denied</h2>
                <p>You don't have admin privileges to access this page.</p>
            </div>
        );
    }
    
    return children;
};

export default AdminRoute;
