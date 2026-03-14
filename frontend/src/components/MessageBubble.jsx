import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ message, isCurrentUser }) => {
    const { message_text, created_at } = message;

    const timeStr = created_at
        ? new Date(created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <div className={`message-bubble-wrapper ${isCurrentUser ? 'sent' : 'received'}`}>
            <div className="message-bubble">
                {message_text}
            </div>
            {timeStr && <span className="message-time">{timeStr}</span>}
        </div>
    );
};

export default MessageBubble;
