import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import chatService from '../services/chatService';
import authService from '../services/authService';
import lostItemService from '../services/lostItemService';
import foundItemService from '../services/foundItemService';
import MessageBubble from '../components/MessageBubble';
import './ChatPage.css';

const ChatPage = () => {
    const { itemId } = useParams();
    const location = useLocation();
    const [messages, setMessages] = useState([]);
    const [itemDetails, setItemDetails] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);

    // receiverId might come from location state
    const [receiverId, setReceiverId] = useState(location.state?.receiverId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);

        const fetchData = async () => {
            if (!itemId) return;
            try {
                // 1. Fetch Item Details (to get Title and Receiver ID if missing)
                let item = null;
                try {
                    item = await lostItemService.getLostItemById(itemId);
                } catch (e) {
                    try {
                        item = await foundItemService.getFoundItemById(itemId);
                    } catch (e2) {
                        console.error("Item not found in lost or found registries.");
                    }
                }

                if (item) {
                    setItemDetails(item);
                    if (!receiverId) setReceiverId(item.user_id);
                }

                // 2. Fetch Messages
                const data = await chatService.getMessages(itemId);
                setMessages(data || []);
            } catch (err) {
                console.error('Chat load error:', err);
            } finally {
                setLoading(false);
                setTimeout(scrollToBottom, 100);
            }
        };

        fetchData();

        const interval = setInterval(async () => {
            try {
                const data = await chatService.getMessages(itemId);
                setMessages(data || []);
            } catch (e) {}
        }, 5000);

        return () => clearInterval(interval);
    }, [itemId, receiverId]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !receiverId || sending) return;

        setSending(true);
        try {
            const sentMsg = await chatService.sendMessage(itemId, {
                receiver_id: receiverId,
                message_text: newMessage.trim()
            });
            // Handle consistent response format
            const msgData = sentMsg.messageData || sentMsg;
            setMessages(prev => [...prev, msgData]);
            setNewMessage('');
        } catch (err) {
            console.error('Send error:', err);
            alert('Unable to deliver message at this time.');
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner" /><p>Initiating secure chat session...</p></div>;

    return (
        <div className="chat-page-container">
            <div className="chat-wrapper">
                {/* Chat Header */}
                <header className="chat-header">
                    <div className="chat-header-info">
                        <div className="chat-header-avatar">{itemDetails?.type === 'lost' ? '🔍' : '📦'}</div>
                        <div>
                            <h2>{itemDetails ? itemDetails.title : "Item Inquiry"}</h2>
                            <p className="chat-header-status">
                                {itemDetails ? `Regarding ${itemDetails.location_name || itemDetails.location || "Reported Location"}` : "Secure End-to-End Chat"}
                            </p>
                        </div>
                    </div>
                    <div className="chat-header-actions">
                        <span className="secure-badge">🔒 Private</span>
                    </div>
                </header>

                {/* Messages Area */}
                <main className="chat-messages-area">
                    {messages.length === 0 ? (
                        <div className="chat-empty-state">
                            <div className="empty-chat-icon">💬</div>
                            <h3>Start the Conversation</h3>
                            <p>Send a message to coordinate the safe return of this item. Be clear about meeting locations and safety.</p>
                        </div>
                    ) : (
                        <div className="chat-bubbles-list">
                            {messages.map((msg) => (
                                <MessageBubble 
                                    key={msg.id} 
                                    message={msg} 
                                    isOwn={msg.sender_id === currentUser?.id} 
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </main>

                {/* Input Area */}
                <footer className="chat-input-area">
                    {!receiverId ? (
                        <div className="status-card error" style={{ margin: 0 }}>
                            Unable to identify the recipient for this item.
                        </div>
                    ) : (
                        <form className="chat-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                className="chat-input"
                                placeholder="Type your message here..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={sending}
                            />
                            <button 
                                type="submit" 
                                className="btn btn-primary chat-send-btn" 
                                disabled={!newMessage.trim() || sending}
                            >
                                {sending ? '...' : 'Send'}
                            </button>
                        </form>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default ChatPage;
