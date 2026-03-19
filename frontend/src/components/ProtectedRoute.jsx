import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const [session, setSession] = useState(undefined); // undefined = loading

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                localStorage.setItem('supabase_session', JSON.stringify(session));
            }
        });
    }, []);

    if (session === undefined) {
        return <div className="loading-screen"><div className="spinner" /></div>;
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    const user = session.user;
    const role = user?.user_metadata?.role || user?.role;

    if (adminOnly && role !== 'admin') {
        console.warn('Unauthorized access attempt to admin route.');
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
