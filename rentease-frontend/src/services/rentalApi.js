const API_URL = 'http://localhost:5000/api';

export const rentItem = async (itemId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/rentals/rent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to rent item');
    return data;
};

export const returnItem = async (rentalId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/rentals/return`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rentalId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to return item');
    return data;
};

export const getRentedItems = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/rentals/rented`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch rented items');
    return data;
};

export const getRentalHistory = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/rentals/history`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch rental history');
    return data;
};

export const getRentedOutItems = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/rentals/rented-out`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch rented out items');
    return data;
};

export const checkRentalStatus = async (itemId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/rentals/check/${itemId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to check rental status');
    return data;
};
