import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import lostItemService  from '../services/lostItemService';
import foundItemService from '../services/foundItemService';
import ItemCard from '../components/ItemCard';
import './ItemsPage.css';

const ItemsPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        setLoading(true);
        setError('');
        try {
            const [lostItems, foundItems] = await Promise.all([
                lostItemService.getAllLostItems().catch(() => []),
                foundItemService.getAllFoundItems().catch(() => []),
            ]);
            const fl = (lostItems  || []).map(i => ({ ...i, type: 'lost' }));
            const ff = (foundItems || []).map(i => ({ ...i, type: 'found' }));
            const combined = [...fl, ...ff].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setItems(combined);
        } catch {
            setError('We are unable to sync the global item database at this time.');
        } finally {
            setLoading(false);
        }
    };

    const lostItems  = items.filter(i => i.type === 'lost');
    const foundItems = items.filter(i => i.type === 'found');

    const renderGrid = (list, type) => (
        list.length === 0 ? (
            <div className="empty-state">
                <div className="empty-state-icon">{type === 'lost' ? '🔍' : '📦'}</div>
                <h3>No active {type} reports</h3>
                <p>There are currently no {type} items listed in the registry. Be the first to report one in your community.</p>
                <Link to={`/report-${type}`} className={`btn btn-${type} btn-sm`} style={{ marginTop: '8px' }}>
                    + Report {type === 'lost' ? 'Lost' : 'Found'} Item
                </Link>
            </div>
        ) : (
            <div className="items-grid">
                {list.map(item => <ItemCard key={`${item.type}-${item.id}`} item={item} />)}
            </div>
        )
    );

    return (
        <div className="page-wrapper">
            {/* ── Header ── */}
            <div className="page-header">
                <h1>Browse Registry</h1>
                <p>Search and explore the global registry of lost and found belongings.</p>
            </div>

            {/* ── Stat Summary ── */}
            {!loading && !error && (
                <div className="items-stats">
                    <div className="items-stat-card">
                        <span className="stat-icon">📋</span>
                        <div className="stat-info">
                            <span className="stat-number all-num">{items.length}</span>
                            <span className="stat-label">Total Listings</span>
                        </div>
                    </div>
                    <div className="items-stat-card">
                        <span className="stat-icon">🔍</span>
                        <div className="stat-info">
                            <span className="stat-number lost-num">{lostItems.length}</span>
                            <span className="stat-label">Lost Reports</span>
                        </div>
                    </div>
                    <div className="items-stat-card">
                        <span className="stat-icon">📦</span>
                        <div className="stat-info">
                            <span className="stat-number found-num">{foundItems.length}</span>
                            <span className="stat-label">Found Reports</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tabs ── */}
            <div className="items-tabs">
                {[
                    { id: 'all',   label: `All Items`,   count: items.length },
                    { id: 'lost',  label: `🔍 Lost`,     count: lostItems.length },
                    { id: 'found', label: `📦 Found`,    count: foundItems.length },
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`items-tab ${activeTab === tab.id ? 'active' : ''} ${tab.id !== 'all' ? tab.id : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                        {!loading && <span className="tab-count-pill">({tab.count})</span>}
                    </button>
                ))}
            </div>

            {/* ── Content ── */}
            {loading ? (
                <div className="loading-screen">
                    <div className="spinner" />
                    <p>Fetching latest registry data...</p>
                </div>
            ) : error ? (
                <div className="status-card error">{error}</div>
            ) : (
                <>
                    {(activeTab === 'all' || activeTab === 'lost') && (
                        <section className={`items-section ${activeTab === 'lost' ? 'lost' : ''}`}>
                            <div className="section-heading lost">
                                <span className="dot" />
                                Recent Lost Reports
                                <span className="section-count">{lostItems.length}</span>
                            </div>
                            {renderGrid(lostItems, 'lost')}
                        </section>
                    )}

                    {(activeTab === 'all' || activeTab === 'found') && (
                        <section className={`items-section ${activeTab === 'found' ? 'found' : ''}`}>
                            <div className="section-heading found">
                                <span className="dot" />
                                Recent Found Reports
                                <span className="section-count">{foundItems.length}</span>
                            </div>
                            {renderGrid(foundItems, 'found')}
                        </section>
                    )}
                </>
            )}
        </div>
    );
};

export default ItemsPage;
