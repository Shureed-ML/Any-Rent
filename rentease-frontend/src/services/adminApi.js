const API_URL = 'http://localhost:5000/api/admin';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Dashboard Statistics
export const getDashboardStats = async () => {
    try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch dashboard stats');
        return data;
    } catch (error) {
        throw error;
    }
};

// User Management
export const getUsers = async (page = 1, limit = 10, search = '') => {
    try {
        const params = new URLSearchParams({ page, limit, search });
        const response = await fetch(`${API_URL}/users?${params}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch users');
        return data;
    } catch (error) {
        throw error;
    }
};

export const toggleUserAdmin = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}/toggle-admin`, {
            method: 'PATCH',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to toggle admin status');
        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete user');
        return data;
    } catch (error) {
        throw error;
    }
};

// Item Management
export const getAdminItems = async (page = 1, limit = 10, search = '', category = '') => {
    try {
        const params = new URLSearchParams({ page, limit, search, category });
        const response = await fetch(`${API_URL}/items?${params}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch items');
        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteAdminItem = async (itemId) => {
    try {
        const response = await fetch(`${API_URL}/items/${itemId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete item');
        return data;
    } catch (error) {
        throw error;
    }
};

// Review Management
export const getAdminReviews = async (page = 1, limit = 10) => {
    try {
        const params = new URLSearchParams({ page, limit });
        const response = await fetch(`${API_URL}/reviews?${params}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch reviews');
        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteAdminReview = async (reviewId) => {
    try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete review');
        return data;
    } catch (error) {
        throw error;
    }
};

// Rental Management
export const getAdminRentals = async (page = 1, limit = 10, status = '') => {
    try {
        const params = new URLSearchParams({ page, limit, status });
        const response = await fetch(`${API_URL}/rentals?${params}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch rentals');
        return data;
    } catch (error) {
        throw error;
    }
};

// Enhanced User Management
export const getUserDetails = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch user details');
        return data;
    } catch (error) {
        throw error;
    }
};

export const suspendUser = async (userId, reason, duration) => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}/suspend`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ reason, duration })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to suspend user');
        return data;
    } catch (error) {
        throw error;
    }
};

export const warnUser = async (userId, reason, severity, relatedItem, relatedReview) => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}/warn`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ reason, severity, relatedItem, relatedReview })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to warn user');
        return data;
    } catch (error) {
        throw error;
    }
};

export const verifyUser = async (userId, status) => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}/verify`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to verify user');
        return data;
    } catch (error) {
        throw error;
    }
};

// Enhanced Item Management
export const getItemDetails = async (itemId) => {
    try {
        const response = await fetch(`${API_URL}/items/${itemId}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch item details');
        return data;
    } catch (error) {
        throw error;
    }
};

export const updateItemStatus = async (itemId, status, rejectionReason) => {
    try {
        const response = await fetch(`${API_URL}/items/${itemId}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status, rejectionReason })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update item status');
        return data;
    } catch (error) {
        throw error;
    }
};

export const toggleItemFeatured = async (itemId) => {
    try {
        const response = await fetch(`${API_URL}/items/${itemId}/featured`, {
            method: 'PATCH',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to toggle featured status');
        return data;
    } catch (error) {
        throw error;
    }
};

export const bulkItemOperation = async (action, itemIds, data = {}) => {
    try {
        const response = await fetch(`${API_URL}/items/bulk`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ action, itemIds, data })
        });
        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.error || 'Failed to perform bulk operation');
        return responseData;
    } catch (error) {
        throw error;
    }
};

// System Monitoring
export const getSystemLogs = async (page = 1, limit = 20, level = '', category = '') => {
    try {
        const params = new URLSearchParams({ page, limit, level, category });
        const response = await fetch(`${API_URL}/system/logs?${params}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch system logs');
        return data;
    } catch (error) {
        throw error;
    }
};

export const getUserActivity = async (page = 1, limit = 20, action = '', userId = '') => {
    try {
        const params = new URLSearchParams({ page, limit, action, userId });
        const response = await fetch(`${API_URL}/system/activity?${params}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch user activity');
        return data;
    } catch (error) {
        throw error;
    }
};

export const getSystemStats = async () => {
    try {
        const response = await fetch(`${API_URL}/system/stats`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch system stats');
        return data;
    } catch (error) {
        throw error;
    }
};

// Warnings Management
export const getWarnings = async (page = 1, limit = 10, status = '') => {
    try {
        const params = new URLSearchParams({ page, limit, status });
        const response = await fetch(`${API_URL}/warnings?${params}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch warnings');
        return data;
    } catch (error) {
        throw error;
    }
};

// Analytics
export const getUserGrowthAnalytics = async (days = 30) => {
    try {
        const response = await fetch(`${API_URL}/analytics/user-growth?days=${days}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch user growth analytics');
        return data;
    } catch (error) {
        throw error;
    }
};

export const getRevenueAnalytics = async (days = 30) => {
    try {
        const response = await fetch(`${API_URL}/analytics/revenue?days=${days}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch revenue analytics');
        return data;
    } catch (error) {
        throw error;
    }
};

// Create Admin User (for initial setup)
export const createAdminUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/create-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create admin user');
        return data;
    } catch (error) {
        throw error;
    }
};
