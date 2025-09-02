import React, { useEffect, useState } from 'react';
import { getInbox } from '../services/chatApi';
import './Inbox.css';
import { Link } from 'react-router-dom';

const Inbox = ({ user }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadInbox();
        // Refresh inbox every 10 seconds
        const interval = setInterval(loadInbox, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadInbox = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getInbox();
            setConversations(data);
        } catch (err) {
            console.error('Error loading inbox:', err);
            setError('Failed to load inbox');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="inbox-loading">Loading inbox...</div>;
    if (error) return <div className="inbox-error">{error}</div>;

    return (
        <div className="inbox-container">
            <h2>Your Messages</h2>
            {conversations.length === 0 ? (
                <p>No conversations yet.</p>
            ) : (
                <ul className="conversation-list">
                    {conversations.map((c) => (
                        <li key={c.partner._id} className="conversation-item">
                            <div className="conv-info">
                                <div className="conv-name">{c.partner.username || c.partner.email}</div>
                                <div className="conv-last">{c.lastMessage.content}</div>
                            </div>
                            <div className="conv-meta">
                                <div className="conv-time">{new Date(c.lastMessage.timestamp).toLocaleString()}</div>
                                <Link 
                                    to={c.lastMessage.itemId ? `/chat/${c.partner._id}/${c.lastMessage.itemId}` : `/chat/${c.partner._id}`}
                                    className="conv-open"
                                >
                                    Open Chat
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Inbox;
