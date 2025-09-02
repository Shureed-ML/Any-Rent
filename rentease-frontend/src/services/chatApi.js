const API_URL = 'http://localhost:5000/api';

export const sendMessage = async (receiverId, content, itemId = null) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId, content, itemId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send message');
    return data;
};

export const getMessages = async (otherUserId, itemId = null) => {
    const token = localStorage.getItem('token');
    const query = itemId ? `?itemId=${itemId}` : '';
    const response = await fetch(`${API_URL}/chat/messages/${otherUserId}${query}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get messages');
    return data;
};

export const getInbox = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/chat/inbox`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch inbox');
    return data;
};
