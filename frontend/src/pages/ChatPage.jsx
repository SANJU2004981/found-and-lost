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
        console.log('[DEBUG-CHAT] Current User State:', user);
        setCurrentUser(user);

        const fetchData = async () => {
            if (!itemId) return;
            console.log('[DEBUG-CHAT] Initiating data fetch for item:', itemId);
            try {
                // 1. Fetch Item Details
                let item = null;
                let actualType = '';
                
                try {
                    console.log('[DEBUG-CHAT] Attempting to find item in LOST registry...');
                    item = await lostItemService.getLostItemById(itemId);
                    actualType = 'lost';
                } catch (e) {
                    try {
                        console.log('[DEBUG-CHAT] Not found in LOST. Attempting FOUND registry...');
                        item = await foundItemService.getFoundItemById(itemId);
                        actualType = 'found';
                    } catch (e2) {
                        console.error("[DEBUG-CHAT] Item resolution failed in both registries.");
                    }
                }

                if (item) {
                    item.type = actualType; // Force correct type
                    console.log('[DEBUG-CHAT] Item Resolved:', item);
                    setItemDetails(item);
                    
                    const resolvedReceiver = receiverId || item.user_id;
                    setReceiverId(resolvedReceiver);
                    console.log('[DEBUG-CHAT] Resolved Receiver ID:', resolvedReceiver);

                    // 2. Fetch Messages
                    console.log(`[DEBUG-CHAT] Fetching items for type: ${actualType}`);
                    const data = await chatService.getMessages(itemId, actualType);
                    setMessages(data || []);
                }
            } catch (err) {
                console.error('[DEBUG-CHAT] Data fetch catch block error:', err);
            } finally {
                setLoading(false);
                setTimeout(scrollToBottom, 100);
            }
        };

        fetchData();

        const interval = setInterval(async () => {
            if (!itemDetails?.type) return;
            try {
                const data = await chatService.getMessages(itemId, itemDetails.type);
                setMessages(data || []);
            } catch (e) {}
        }, 5000);

        return () => clearInterval(interval);
    }, [itemId, receiverId, itemDetails?.type]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !receiverId || sending) {
            console.warn('[DEBUG-CHAT] Send blocked:', { hasMsg: !!newMessage.trim(), hasReceiver: !!receiverId, isSending: sending });
            return;
        }

        setSending(true);
        const payload = {
            receiver_id: receiverId,
            message_text: newMessage.trim(),
            item_type: itemDetails?.type || 'found'
        };
        console.log('[DEBUG-CHAT] Dispatching Send Message Payload:', payload);

        try {
            const sentMsg = await chatService.sendMessage(itemId, payload);
            const msgData = sentMsg.messageData || sentMsg;
            setMessages(prev => [...prev, msgData]);
            setNewMessage('');
        } catch (err) {
            console.error('[DEBUG-CHAT] Message delivery failure:', err);
            alert(`Delivery Failed: ${err.error || 'The message could not be sent.'}`);
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner" /><p>Initiating secure chat session...</p></div>;

    return (
        <div className="chat-page-container">
            <div className="chat-wrapper">
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
                </header>

                <main className="chat-messages-area">
                    {messages.length === 0 ? (
                        <div className="chat-empty-state">
                            <div className="empty-chat-icon">💬</div>
                            <h3>Start the Conversation</h3>
                            <p>Send a message to coordinate the safe return of this item.</p>
                        </div>
                    ) : (
                        <div className="chat-bubbles-list">
                            {messages.map((msg) => (
                                <MessageBubble 
                                    key={msg.id} 
                                    message={msg} 
                                    isCurrentUser={msg.sender_id === currentUser?.id} 
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </main>

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
