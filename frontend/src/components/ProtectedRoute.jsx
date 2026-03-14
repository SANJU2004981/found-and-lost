import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication or specific roles.
 * 
 * @param {boolean} adminOnly - If true, only users with 'admin' role can access.
 * @param {React.ReactNode} children - The component to render if access is granted.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const user = authService.getCurrentUser();
    const isLoggedIn = !!user;
    const role = user?.role || 'user';

    // 1. If not logged in, redirect to login
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // 2. If adminOnly is true and user is not an admin, redirect to dashboard
    if (adminOnly && role !== 'admin') {
        console.warn('Unauthorized access attempt to admin route.');
        return <Navigate to="/dashboard" replace />;
    }

    // 3. Otherwise, render the requested content
    return children;
};

export default ProtectedRoute;
