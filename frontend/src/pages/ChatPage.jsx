import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import chatService from '../services/chatService';
import { supabase } from '../services/supabaseClient';
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
    const [receiverId, setReceiverId] = useState(location.state?.receiverId || null);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);
    // Use a ref so the polling interval always sees the latest item type
    const itemTypeRef = useRef(location.state?.itemType || null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        let interval;

        const init = async () => {
            if (!itemId) return;

            // 1. Get fresh session
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user || null;
            setCurrentUser(user);
            const uId = user?.id;

            try {
                // 2. Resolve item type and details
                let item = null;
                let actualType = itemTypeRef.current;

                if (!actualType) {
                    // Probe lost first, then found
                    try {
                        item = await lostItemService.getLostItemById(itemId);
                        actualType = 'lost';
                    } catch {
                        try {
                            item = await foundItemService.getFoundItemById(itemId);
                            actualType = 'found';
                        } catch {
                            console.error('[CHAT] Item not found in either registry.');
                        }
                    }
                } else {
                    try {
                        item = actualType === 'lost'
                            ? await lostItemService.getLostItemById(itemId)
                            : await foundItemService.getFoundItemById(itemId);
                    } catch {
                        console.error('[CHAT] Failed to fetch item with known type:', actualType);
                    }
                }

                if (!item) {
                    setError('Could not load this conversation. The item may not exist.');
                    return;
                }

                item.type = actualType;
                itemTypeRef.current = actualType;
                setItemDetails(item);

                // 3. Fetch messages
                const messagesData = await chatService.getMessages(itemId, actualType);
                setMessages(messagesData || []);

                // 4. Resolve receiver
                let resolvedReceiver = receiverId;
                if (!resolvedReceiver && uId) {
                    if (uId === item.user_id) {
                        // Current user is the item owner — find the other participant in message history
                        const otherMsg = [...(messagesData || [])].reverse().find(
                            m => m.sender_id !== uId && m.sender_id != null
                        );
                        if (otherMsg) {
                            resolvedReceiver = otherMsg.sender_id;
                            console.log('[CHAT] Owner mode: resolved other participant:', resolvedReceiver);
                        } else {
                            console.warn('[CHAT] Owner mode: no messages yet, no receiver available yet.');
                        }
                    } else {
                        resolvedReceiver = item.user_id;
                        console.log('[CHAT] Non-owner mode: receiver = item owner:', resolvedReceiver);
                    }
                }
                setReceiverId(resolvedReceiver);

            } catch (err) {
                console.error('[CHAT] Init error:', err);
                setError('Failed to load conversation.');
            } finally {
                setLoading(false);
                setTimeout(scrollToBottom, 100);
            }
        };

        init();

        // Polling — uses ref so it always has the latest item type
        interval = setInterval(async () => {
            const type = itemTypeRef.current;
            if (!type) return;
            try {
                const data = await chatService.getMessages(itemId, type);
                setMessages(data || []);
            } catch (e) {
                console.warn('[CHAT] Polling error:', e?.message);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [itemId]); // Only re-run if itemId changes

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        if (!receiverId) {
            setError('Cannot send message: recipient could not be determined. Please refresh.');
            return;
        }
        if (sending) return;

        setSending(true);
        setError('');
        const payload = {
            receiver_id: receiverId,
            message_text: newMessage.trim(),
            item_type: itemTypeRef.current || 'lost'
        };

        try {
            const sentMsg = await chatService.sendMessage(itemId, payload);
            const msgData = sentMsg.messageData || sentMsg;
            setMessages(prev => [...prev, msgData]);
            setNewMessage('');
        } catch (err) {
            console.error('[CHAT] Send error:', err);
            setError(err.error || 'Message could not be delivered. Please try again.');
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
                    {error && (
                        <div className="status-card error" style={{ margin: '0 0 8px 0', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    )}
                    {!receiverId && !error ? (
                        <div className="status-card error" style={{ margin: 0 }}>
                            Waiting for conversation history to identify recipient...
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
                                disabled={!newMessage.trim() || sending || !receiverId}
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


