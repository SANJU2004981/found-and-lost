import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResetRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://found-and-lost.vercel.app/reset-password',
            });

            if (resetError) throw resetError;

            setMessage('Password reset email sent. Please check your inbox.');
        } catch (err) {
            setError(err.message || 'Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-badge">✉️</div>
                <h1>Reset Password</h1>
                <p className="auth-sub">Enter your email and we'll send you a link to get back into your account.</p>

                {message && <div className="status-card success">{message}</div>}
                {error && <div className="status-card error">{error}</div>}

                <form className="auth-form" onSubmit={handleResetRequest}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="form-control"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="auth-footer">
                    Remember your password?
                    <Link to="/login">Back to Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
