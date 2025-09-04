const API_URL = 'http://localhost:5000/api';

// Chat related API calls
export const createChatRoom = async (otherUserId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/chat/room`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ otherUserId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create chat room');
        return data;
    } catch (error) {
        throw error;
    }
};

export const sendMessage = async (roomId, message) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ roomId, message }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to send message');
        return data;
    } catch (error) {
        throw error;
    }
};

export const getMessages = async (roomId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/chat/messages/${roomId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to get messages');
        return data;
    } catch (error) {
        throw error;
    }
};

// Item related API calls
export const createItem = async (formData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create item');
        return data;
    } catch (error) {
        throw error;
    }
};

export const getAllItems = async () => {
    try {
        const response = await fetch(`${API_URL}/items`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch items');
        return data;
    } catch (error) {
        throw error;
    }
};
    // Get a single item by ID
    export const getItem = async (id) => {
        try {
            const response = await fetch(`${API_URL}/items/${id}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch item');
            return data;
        } catch (error) {
            throw error;
        }
    };

export const getUserItems = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/items/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch user items');
        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteItem = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        let data;
        try {
            data = await response.json();
        } catch (e) {
            if (response.ok) {
                // Not JSON, but status is OK
                return { message: 'Item deleted successfully' };
            } else {
                throw new Error('Failed to delete item');
            }
        }
        if (!response.ok) throw new Error(data.error || 'Failed to delete item');
        return data;
    } catch (error) {
        throw error;
    }
};

    export const getInbox = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/chat/inbox`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch inbox');
            return data;
        } catch (error) {
            throw error;
        }
    };

export const updateItem = async (id, itemData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(itemData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update item');
        return data;
    } catch (error) {
        throw error;
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Registration failed');
        return data;
    } catch (error) {
        throw error;
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        return data;
    } catch (error) {
        throw error;
    }
};

// Review related API calls
export const createReview = async (itemId, reviewData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                itemId,
                ...reviewData
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create review');
        return data;
    } catch (error) {
        throw error;
    }
};

export const getItemReviews = async (itemId) => {
    try {
        const response = await fetch(`${API_URL}/reviews/item/${itemId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch reviews');
        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteReview = async (reviewId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete review');
        return data;
    } catch (error) {
        throw error;
    }
};

// User profile management
export const updateUserProfile = async (profileData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update profile');
        return data;
    } catch (error) {
        throw error;
    }
};

export const changePassword = async (passwordData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(passwordData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to change password');
        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteAccount = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/account`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete account');
        return data;
    } catch (error) {
        throw error;
    }
};
