import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItem } from '../services/api';
import { sendMessage, getMessages } from '../services/chatApi';
import './ChatPage.css';
//This is the change
const ChatPage = ({ user }) => {
    const { otherUserId, itemId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const messagesEndRef = useRef(null);
    const pollInterval = useRef(null);

    useEffect(() => {
        if (!user || !user._id) {
            setError('User not authenticated');
            return;
        }

        if (itemId) {
            getItem(itemId).then(itemData => {
                setItem(itemData);
                // Set other user as item owner if current user is not the owner
                if (itemData.owner && itemData.owner._id !== user._id) {
                    setOtherUser(itemData.owner);
                }
            }).catch(err => {
                console.error('Error fetching item:', err);
                setError('Failed to load item details');
            });
        }
    }, [itemId, user]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!user || !user._id || !otherUserId) {
                setError('Missing required information');
                setLoading(false);
                return;
            }

            try {
                const response = await getMessages(otherUserId, itemId);
                setMessages(prevMessages => {
                    // Only update if messages are different
                    if (JSON.stringify(prevMessages) !== JSON.stringify(response)) {
                        return response;
                    }
                    return prevMessages;
                });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching messages:', err);
                setError('Failed to load messages');
                setLoading(false);
            }
        };

        fetchMessages();
        pollInterval.current = setInterval(fetchMessages, 3000);

        return () => {
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
            }
        };
    }, [otherUserId, itemId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const message = await sendMessage(otherUserId, newMessage.trim(), itemId);
            setMessages(prev => [...prev, message]);
            setNewMessage('');
        } catch (err) {
            setError('Failed to send message');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (loading) return <div className="chat-loading">Loading chat...</div>;
    if (error) return <div className="chat-error">Error: {error}</div>;

    return (
        <div className="chat-page">
            <div className="chat-header">
                <button onClick={() => navigate('/inbox')} className="back-button">
                    ← Back to Inbox
                </button>
                {item && (
                    <div className="chat-item-info">
                        <h3>Chat about: {item.title}</h3>
                        <p>Price: ${parseFloat(item.price).toFixed(2)} / day</p>
                    </div>
                )}
            </div>
            
            <div className="messages-container">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`message ${msg.senderId === user._id ? 'sent' : 'received'}`}
                    >
                        <div className="message-content">{msg.content}</div>
                        <div className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="message-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                />
                <button type="submit" className="send-button">Send</button>
            </form>
        </div>
    );
};

export default ChatPage;
