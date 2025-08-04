const API_URL = 'http://localhost:5000/api';

// Item related API calls
export const createItem = async (itemData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(itemData),
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
