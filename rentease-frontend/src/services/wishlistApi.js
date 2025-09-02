const API_URL = 'http://localhost:5000/api';

export const getWishlist = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/wishlist`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch wishlist');
    return data;
};

export const addToWishlist = async (itemId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/wishlist/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to add to wishlist');
    return data;
};

export const removeFromWishlist = async (itemId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/wishlist/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to remove from wishlist');
    return data;
};

export const checkWishlistStatus = async (itemId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/wishlist/check/${itemId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to check wishlist status');
    return data.inWishlist;
};
