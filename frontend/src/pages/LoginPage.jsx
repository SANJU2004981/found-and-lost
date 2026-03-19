import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

    // Redirect whenever a valid session appears — covers both:
    //  (a) user was already logged in (page refresh / direct nav to /login)
    //  (b) user just logged in and onAuthStateChange fired, updating AuthContext
    useEffect(() => {
        if (!loading && session) {
            console.log('[LOGIN-PAGE] Session detected → navigating to /dashboard');
            navigate('/dashboard', { replace: true });
        }
    }, [session, loading, navigate]);

    // While hydrating, show a spinner
    if (loading) {
        return <div className="loading-screen"><div className="spinner" /></div>;
    }

    // Already redirecting (session exists) — don't flash the form
    if (session) return null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);
        try {
            console.log('[LOGIN-PAGE] Calling authService.login...');
            await authService.login(email, password);
            console.log('[LOGIN-PAGE] authService.login resolved. Waiting for AuthContext to update...');
            setSuccess('Login successful! Redirecting...');
            // Navigate is driven by the useEffect above watching `session`.
            // authService.login calls supabase.auth.setSession() which fires
            // onAuthStateChange → AuthContext.session becomes non-null → useEffect runs → navigate().
        } catch (err) {
            console.error('[LOGIN-PAGE] Login error:', err);
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
