import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { session, loading } = useAuth();

    console.log('[PROTECTED-ROUTE] loading:', loading, '| session:', session ? `user=${session.user.id}` : 'null');

    // Still resolving the initial session — show a spinner, do NOT redirect yet
    if (loading) {
        return <div className="loading-screen"><div className="spinner" /></div>;
    }

    // Definitively no session → go to login
    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // Optional admin-only guard
    const role = session.user?.user_metadata?.role || session.user?.role;
    if (adminOnly && role !== 'admin') {
        console.warn('[PROTECTED-ROUTE] Non-admin tried to access admin route.');
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
