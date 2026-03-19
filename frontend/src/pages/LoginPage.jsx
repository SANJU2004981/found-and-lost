import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import '../styles/Auth.css';

const LoginPage = () => {
    const { session, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    console.log('[LOGIN-PAGE] loading:', loading, '| session:', session ? `user=${session.user.id}` : 'null');

    // Still hydrating — hold on before deciding to redirect
    if (loading) {
        return <div className="loading-screen"><div className="spinner" /></div>;
    }

    // Already logged in — redirect immediately
    if (session) {
        console.log('[LOGIN-PAGE] Session found, redirecting to /dashboard');
        return <Navigate to="/dashboard" replace />;
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);
        try {
            await authService.login(email, password);
            setSuccess('Login successful! Redirecting...');
            // onAuthStateChange in AuthContext will update session state automatically.
            // Navigate after a short delay so the success message is visible.
            setTimeout(() => navigate('/dashboard'), 800);
        } catch (err) {
            setError(err.error || 'Login failed. Please check your credentials.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-badge">🔑</div>
                <h1>Welcome Back</h1>
                <p className="auth-sub">Sign in to your Found &amp; Lost account</p>

                {error   && <div className="status-card error">{error}</div>}
                {success && <div className="status-card success">{success}</div>}

                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="form-control"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: '600' }}>
                                Forgot Password?
                            </Link>
                        </div>
                        <input
                            id="password"
                            type="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account?
                    <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
