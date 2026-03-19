import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import lostItemService from '../services/lostItemService';
import foundItemService from '../services/foundItemService';
import ItemCard from '../components/ItemCard';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user } = useAuth(); // Guaranteed non-null by ProtectedRoute
    const [lostItems, setLostItems] = useState([]);
    const [foundItems, setFoundItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [modal, setModal] = useState({ show: false, type: '', itemId: null, itemType: '' });
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const [myLost, myFound] = await Promise.all([
                dashboardService.getMyLostItems().catch(() => []),
                dashboardService.getMyFoundItems().catch(() => []),
            ]);
            setLostItems((myLost || []).filter(i => i.status !== 'recovered').map(i => ({ ...i, type: 'lost', location_name: i.location || i.location_name })));
            setFoundItems((myFound || []).map(i => ({ ...i, type: 'found', location_name: i.location || i.location_name })));
        } catch (err) {
            console.error('Dashboard error:', err);
            setError('We encountered an issue synchronizing your dashboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const handleAction = (type, itemId, itemType) => {
        setModal({ show: true, type, itemId, itemType });
    };

    const confirmAction = async () => {
        const { type, itemId, itemType } = modal;
        setModal({ ...modal, show: false });
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            if (type === 'delete') {
                if (itemType === 'lost') {
                    await lostItemService.deleteLostItem(itemId);
                    setLostItems(prev => prev.filter(i => i.id !== itemId));
                } else {
                    await foundItemService.deleteFoundItem(itemId);
                    setFoundItems(prev => prev.filter(i => i.id !== itemId));
                }
                setSuccess('Post removed successfully.');
            } else if (type === 'recovered') {
                await lostItemService.markAsRecovered(itemId);
                // User wants recovered items to disappear from the active reports list
                setLostItems(prev => prev.filter(i => i.id !== itemId));
                setSuccess('Congratulations! Item marked as recovered.');
            }
            // Optional: await fetchDashboardData(); // Keeping as extra sync
        } catch (err) {
            console.error('Action error:', err);
            setError(err.error || 'The requested action could not be completed at this time.');
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(''), 4000);
        }
    };

    const displayName = user?.user_metadata?.name || user?.username || user?.email?.split('@')[0] || 'Member';

    const renderSection = (items, type) => (
        items.length === 0 ? (
            <div className="empty-state dash-empty">
                <div className="empty-state-icon">{type === 'lost' ? '🔍' : '📦'}</div>
                <h3>No active {type} reports</h3>
                <Link to={`/report-${type}`} className={`btn btn-${type} btn-sm`} style={{ marginTop: '8px' }}>
                    + File New {type === 'lost' ? 'Lost' : 'Found'} Report
                </Link>
            </div>
        ) : (
            <div className="items-grid">
                {items.map(item => (
                    <div className="dashboard-item-wrapper" key={`dashboard-${item.type}-${item.id}`}>
                        <ItemCard item={item} />
                        <div className="item-actions">
                            <button className="btn btn-sm btn-edit" onClick={() => navigate(`/edit/${item.type}/${item.id}`)}>
                                ✏️ Edit
                            </button>
                            <button className="btn btn-sm btn-chat" onClick={() => navigate(`/chat/${item.id}`)}>
                                💬 Messages
                            </button>
                            {item.type === 'lost' && item.status !== 'recovered' && (
                                <button className="btn btn-sm btn-recovered" onClick={() => handleAction('recovered', item.id, 'lost')}>
                                    ✅ Recovered
                                </button>
                            )}
                            <button className="btn btn-sm btn-delete" onClick={() => handleAction('delete', item.id, item.type)}>
                                🗑️ Delete
                            </button>
                        </div>
                        {item.status === 'recovered' && <div className="recovered-overlay">RECOVERED</div>}
                    </div>
                ))}
            </div>
        )
    );

    if (loading && !modal.show && lostItems.length === 0) {
        return <div className="loading-screen"><div className="spinner" /><p>Loading Dashboard...</p></div>;
    }

    return (
        <div className="page-wrapper">
            <div className="dashboard-hero">
                <div className="dashboard-avatar">{displayName.charAt(0).toUpperCase()}</div>
                <div className="dashboard-hero-info">
                    <span className="hero-welcome">Account Overview</span>
                    <h1>Welcome back, {displayName}</h1>
                    <p className="hero-email">{user?.email}</p>
                </div>
                <div className="dashboard-stats">
                    <div className="dash-stat">
                        <span className="dash-stat-num lost-num">{lostItems.length}</span>
                        <span className="dash-stat-label">Lost Reports</span>
                    </div>
                    <div className="dash-stat">
                        <span className="dash-stat-num found-num">{foundItems.length}</span>
                        <span className="dash-stat-label">Found Reports</span>
                    </div>
                </div>
            </div>

            {error && <div className="status-card error dash-error-card">{error}</div>}
            {success && <div className="status-card success dash-success-card">✅ {success}</div>}

            <section className="dashboard-section">
                <div className="section-heading lost">
                    <span className="dot" /> My Lost Item Reports
                </div>
                {renderSection(lostItems, 'lost')}
            </section>

            <section className="dashboard-section">
                <div className="section-heading found">
                    <span className="dot" /> My Found Item Reports
                </div>
                {renderSection(foundItems, 'found')}
            </section>

            {/* Confirmation Modal */}
            {modal.show && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3>Confirm Action</h3>
                        <p>Are you sure you want to {modal.type === 'delete' ? 'permanently delete' : 'mark as recovered'} this item?</p>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setModal({ show: false })}>Cancel</button>
                            <button className={`btn ${modal.type === 'delete' ? 'btn-danger' : 'btn-success'}`} onClick={confirmAction}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
