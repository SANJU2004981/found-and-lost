import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import API_CLIENT from '../services/api';
import './AdminPage.css';

const ADMIN_API = '/api/admin';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [lostItems, setLostItems] = useState([]);
    const [foundItems, setFoundItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const [confirmDelete, setConfirmDelete] = useState(null); // { id, type }
    const navigate = useNavigate();

    // Headers are handled by api.js interceptor


    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) { navigate('/login'); return; }

        const fetchAll = async () => {
            try {
                const [u, l, f] = await Promise.all([
                    API_CLIENT.get(`${ADMIN_API}/users`),
                    API_CLIENT.get(`${ADMIN_API}/lost-items`),
                    API_CLIENT.get(`${ADMIN_API}/found-items`),
                ]);
                setUsers(u.data || []);
                setLostItems(l.data || []);
                setFoundItems(f.data || []);
            } catch (err) {
                if (err.response?.status === 403) {
                    setError('Access denied. Admin privileges required.');
                } else {
                    setError('Failed to load admin data.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [navigate]);

    const handleDelete = async () => {
        if (!confirmDelete) return;
        const { id, type } = confirmDelete;
        const endpoint = type === 'lost' ? `${ADMIN_API}/lost-items/${id}` : `${ADMIN_API}/found-items/${id}`;
        try {
            await API_CLIENT.delete(endpoint);
            if (type === 'lost')  setLostItems(prev => prev.filter(i => i.id !== id));
            if (type === 'found') setFoundItems(prev => prev.filter(i => i.id !== id));
            setConfirmDelete(null);
        } catch (err) {
            alert('Failed to delete item.');
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner" /><p>Accessing secure console...</p></div>;

    if (error) return (
        <div className="page-wrapper">
            <div className="status-card error" style={{ marginTop: '2rem' }}>
                <span>🚫</span> {error}
            </div>
        </div>
    );

    const tabs = [
        { id: 'users',  label: `Users (${users.length})`,       icon: '👥' },
        { id: 'lost',   label: `Lost Items (${lostItems.length})`,  icon: '🔍' },
        { id: 'found',  label: `Found Items (${foundItems.length})`, icon: '📦' },
    ];

    return (
        <div className="page-wrapper">
            {/* Header */}
            <div className="admin-header">
                <div className="admin-badge">⚙️</div>
                <div>
                    <h1>Administrative Control</h1>
                    <p>Global oversight and management of platform users and reported items.</p>
                </div>
                <div className="admin-stats">
                    <div className="admin-stat"><span>{users.length}</span><label>Total Users</label></div>
                    <div className="admin-stat"><span className="lost-col">{lostItems.length}</span><label>Lost Reports</label></div>
                    <div className="admin-stat"><span className="found-col">{foundItems.length}</span><label>Found Reports</label></div>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        className={`admin-tab ${activeTab === t.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.id)}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Table Area */}
            <div className="admin-content-card">
                {activeTab === 'users' && (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email Address</th>
                                    <th>Account Status</th>
                                    <th>Join Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 && (
                                    <tr><td colSpan={4}><div className="empty-state" style={{padding:'2rem'}}>No registered users found.</div></td></tr>
                                )}
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.name || '—'}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                                                {u.role || 'user'}
                                            </span>
                                        </td>
                                        <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {(activeTab === 'lost' || activeTab === 'found') && (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Item Title</th>
                                    <th>Location Reported</th>
                                    <th>Posted Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                { (activeTab === 'lost' ? lostItems : foundItems).length === 0 && (
                                    <tr><td colSpan={4}><div className="empty-state" style={{padding:'2rem'}}>No {activeTab} reports currently active.</div></td></tr>
                                )}
                                {(activeTab === 'lost' ? lostItems : foundItems).map(item => (
                                    <tr key={item.id}>
                                        <td>{item.title}</td>
                                        <td>{item.location || '—'}</td>
                                        <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete({ id: item.id, type: activeTab })}>
                                                Remove Item
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Confirmation Modal Overlay */}
            {confirmDelete && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <span className="modal-icon">⚠️</span>
                            <h3>Confirm Deletion</h3>
                        </div>
                        <p className="modal-body">
                            Are you sure you want to permanently remove this {confirmDelete.type} item? 
                            This action cannot be undone.
                        </p>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Keep Item</button>
                            <button className="btn btn-primary btn-primary-red" onClick={handleDelete}>Yes, Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
