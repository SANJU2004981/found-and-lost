import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './ItemCard.css';

const ItemCard = ({ item }) => {
    const { id, title, description, location, location_name, image_url, type, created_at, user_id } = item;

    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const currentUserId = currentUser ? (currentUser.id || currentUser.sub) : null;
    const displayLocation = location_name || location || 'Location not specified';

    const imageUrl = image_url
        ? (image_url.startsWith('http') ? image_url : import.meta.env.VITE_API_URL + image_url)
        : null;

    const dateStr = created_at
        ? new Date(created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '';

    return (
        <div className={`item-card ${type}`}>
            {/* ── Image ── */}
            <div className="item-card-image">
                {imageUrl ? (
                    <img src={imageUrl} alt={title} loading="lazy" />
                ) : (
                    <div className="item-no-image">
                        <div className="item-no-image-inner">
                            <span>📦</span>
                            <span className="item-no-image-label">No photo available</span>
                        </div>
                    </div>
                )}
                <span className={`badge badge-${type} item-type-badge`}>{type}</span>
            </div>

            {/* ── Content ── */}
            <div className="item-card-body">
                <h3 className="item-card-title">{title}</h3>

                <p className="item-card-location">
                    <span className="location-icon">📍</span>
                    <span>{displayLocation}</span>
                </p>

                {description && (
                    <p className="item-card-desc">{description}</p>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="item-card-footer">
                <span className="item-card-date">
                    🗓 {dateStr}
                </span>

                {currentUserId && currentUserId !== user_id && (
                    <button
                        className={`btn btn-sm message-btn ${type === 'lost' ? 'btn-lost' : 'btn-found'}`}
                        style={{ opacity: 0.85 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/chat/${id}`, { state: { receiverId: user_id } });
                        }}
                    >
                        💬 Message
                    </button>
                )}
            </div>
        </div>
    );
};

export default ItemCard;
