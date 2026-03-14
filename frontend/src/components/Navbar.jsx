import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import './Navbar.css';

const Navbar = () => {
    const [user, setUser] = useState(authService.getCurrentUser());
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Sync state with auth changes on navigation or refresh
    useEffect(() => {
        setUser(authService.getCurrentUser());
        
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        setMobileOpen(false);
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;
    const role = user?.user_metadata?.role || user?.role;

    return (
        <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-inner">
                {/* Logo Section */}
                <Link to="/" className="navbar-brand" onClick={() => setMobileOpen(false)}>
                    <span className="brand-logo-icon">🔍</span>
                    <span className="brand-text">Found<span className="brand-amp"> & </span>Lost</span>
                </Link>

                {/* Primary Navigation */}
                <div className="navbar-links">
                    <Link to="/"          className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
                    <Link to="/items"     className={`nav-link ${isActive('/items') ? 'active' : ''}`}>Registry</Link>
                    <Link to="/map"       className={`nav-link ${isActive('/map') ? 'active' : ''}`}>Map View</Link>
                    <div className="nav-divider" />
                    <Link to="/report-lost"  className={`nav-link nav-link-lost ${isActive('/report-lost') ? 'active' : ''}`}>Report Lost</Link>
                    <Link to="/report-found" className={`nav-link nav-link-found ${isActive('/report-found') ? 'active' : ''}`}>Report Found</Link>
                </div>

                {/* User Utility Actions */}
                <div className="navbar-auth">
                    {user ? (
                        <>
                            {role === 'admin' && (
                                <Link to="/admin" className={`nav-link nav-link-admin ${isActive('/admin') ? 'active' : ''}`}>
                                    ⚙️ Admin Console
                                </Link>
                            )}
                            <Link to="/dashboard" className={`nav-link nav-link-dashboard ${isActive('/dashboard') ? 'active' : ''}`}>
                                My Dashboard
                            </Link>
                            <button className="btn btn-sm nav-logout-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link nav-login-link">Sign In</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Join Community</Link>
                        </>
                    )}
                </div>

                {/* Navigation Toggle (Mobile Only) */}
                <button
                    className={`navbar-toggle ${mobileOpen ? 'open' : ''}`}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation"
                >
                    <span/><span/><span/>
                </button>
            </div>

            {/* Mobile Navigation Dropdown */}
            {mobileOpen && (
                <div className="navbar-mobile">
                    <Link to="/"             className="mobile-link" onClick={() => setMobileOpen(false)}>Home</Link>
                    <Link to="/items"        className="mobile-link" onClick={() => setMobileOpen(false)}>Registry</Link>
                    <Link to="/map"          className="mobile-link" onClick={() => setMobileOpen(false)}>Map View</Link>
                    <div className="mobile-divider" />
                    <Link to="/report-lost"  className="mobile-link mobile-lost"  onClick={() => setMobileOpen(false)}>File Lost Report</Link>
                    <Link to="/report-found" className="mobile-link mobile-found" onClick={() => setMobileOpen(false)}>File Found Report</Link>
                    <div className="mobile-divider" />
                    {user ? (
                        <>
                            {role === 'admin' && (
                                <Link to="/admin" className="mobile-link mobile-admin" onClick={() => setMobileOpen(false)}>⚙️ Admin Console</Link>
                            )}
                            <Link to="/dashboard" className="mobile-link" onClick={() => setMobileOpen(false)}>My Dashboard</Link>
                            <button className="mobile-link mobile-logout" onClick={handleLogout}>Sign Out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login"    className="mobile-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
                            <Link to="/register" className="mobile-link mobile-register" onClick={() => setMobileOpen(false)}>Join Community</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
