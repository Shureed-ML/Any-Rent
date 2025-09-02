import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getMessages } from '../services/chatApi';
import './Chat.css';

const Chat = ({ user, otherUserId, itemId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const pollInterval = useRef(null);

    // Function to filter messages for this conversation
    const filterMessages = (allMessages) => {
        return allMessages.filter(msg => 
            // Show message if:
            // Current user is sender AND other user is receiver OR
            // Current user is receiver AND other user is sender
            (msg.senderId === user._id && msg.receiverId === otherUserId) ||
            (msg.senderId === otherUserId && msg.receiverId === user._id)
        );
    };

    useEffect(() => {
        const getMessages = async () => {
            await fetchMessages();
        };
        
        getMessages();
        
        // Set up polling for new messages
        pollInterval.current = setInterval(getMessages, 3000);
        
        return () => {
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
            }
        };
    }, [otherUserId, itemId]);

    const fetchMessages = async () => {
        try {
            setError(null);
            const allMessages = await getMessages(otherUserId, itemId);
            
            // Filter messages for this specific conversation
            const conversationMessages = filterMessages(allMessages);
            
            // Only update if we have new or different messages
            setMessages(prevMessages => {
                if (!prevMessages.length) return conversationMessages;
                if (prevMessages.length !== conversationMessages.length) return conversationMessages;
                if (JSON.stringify(prevMessages) !== JSON.stringify(conversationMessages)) return conversationMessages;
                return prevMessages;
            });
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to load messages. Please try again later.');
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const message = await sendMessage(otherUserId, newMessage.trim(), itemId);
            setMessages(prev => [...prev, message]);
            setNewMessage('');
            setError(null);
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message. Please try again.');
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
        <div className="chat-container">
            <div className="messages-container">
                {messages.map((msg) => {
                    // normalize sender id and message fields coming from backend
                    const senderId = msg.senderId? (msg.senderId._id || msg.senderId) : (msg.sender || msg.senderId);
                    const text = msg.content || msg.message || '';
                    const time = msg.timestamp || msg.createdAt;
                    const isSent = String(senderId) === String(user._id || user.id);

                    return (
                        <div
                            key={msg._id || `${senderId}-${time}`}
                            className={`message ${isSent ? 'sent' : 'received'}`}
                        >
                            <div className="message-content">
                                {text}
                            </div>
                            <div className="message-time">
                                {time ? new Date(time).toLocaleTimeString() : ''}
                            </div>
                        </div>
                    );
                })}
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

export default Chat;
