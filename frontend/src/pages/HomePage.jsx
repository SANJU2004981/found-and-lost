import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const steps = [
    { icon: '📋', step: '01', title: 'Submit a Report', desc: 'Securely list a lost or found item with photos, details, and precise location markers.' },
    { icon: '🗺️', step: '02', title: 'Explore the Map', desc: 'Search through localized reports or use the interactive map to pin down exactly where it happened.' },
    { icon: '🤝', step: '03', title: 'Start a Handover', desc: 'Connect directly through our encrypted chat to coordinate a safe and successful recovery.' },
];

const features = [
    { icon: '🔒', title: 'Secure Posting', desc: 'All items are tied to verified accounts. Your data stays private and secure.' },
    { icon: '🗺️', title: 'Map Discovery', desc: 'See items plotted on an interactive map — find what was lost near where it happened.' },
    { icon: '💬', title: 'Direct Chat', desc: 'Built-in messaging lets owners and finders connect instantly and safely.' },
    { icon: '📊', title: 'Dashboard Tracking', desc: 'Manage all your reports from one personal dashboard with real-time status.' },
];

const HomePage = () => {
    return (
        <div className="home-page">
            {/* Hero */}
            <section className="hero">
                <div className="hero-bg" aria-hidden="true">
                    <div className="hero-orb orb-1" />
                    <div className="hero-orb orb-2" />
                </div>
                <div className="hero-content">
                    <div className="hero-badge">🌟 Community-Powered Recovery</div>
                    <h1 className="hero-title">
                        Reunite People<br />with Their<br />
                        <span className="hero-gradient">Lost Belongings</span>
                    </h1>
                    <p className="hero-subtitle">
                        The simplest way to report lost items, browse found items,
                        and connect with your community to recover what matters most.
                    </p>
                    <div className="hero-cta">
                        <Link to="/report-lost" className="btn btn-lost btn-hero">
                            📋 Report Lost Item
                        </Link>
                        <Link to="/report-found" className="btn btn-found btn-hero">
                            ✅ Report Found Item
                        </Link>
                    </div>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">Real-time</span>
                            <span className="stat-label">Notifications</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat">
                            <span className="stat-number">100% Free</span>
                            <span className="stat-label">Community Tool</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat">
                            <span className="stat-number">Secure</span>
                            <span className="stat-label">Verified Auth</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section">
                <div className="container">
                    <div className="section-label">Simple Process</div>
                    <h2 className="section-title">How It Works</h2>
                    <p className="section-subtitle">Three easy steps to recover your belongings or help someone else.</p>
                    <div className="steps-grid">
                        {steps.map(s => (
                            <div className="step-card" key={s.step}>
                                <div className="step-number">{s.step}</div>
                                <div className="step-icon">{s.icon}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="section section-alt">
                <div className="container">
                    <div className="section-label">Why Choose Us</div>
                    <h2 className="section-title">Everything You Need</h2>
                    <p className="section-subtitle">Built with security, simplicity, and speed in mind.</p>
                    <div className="features-grid">
                        {features.map(f => (
                            <div className="feature-card card" key={f.title}>
                                <div className="feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="section">
                <div className="container">
                    <div className="cta-banner">
                        <div className="cta-banner-bg" aria-hidden="true" />
                        <h2>Ready to Get Started?</h2>
                        <p>Join and help your community find what's lost.</p>
                        <div className="cta-banner-btns">
                            <Link to="/items"  className="btn btn-primary">Browse Items</Link>
                            <Link to="/map"    className="btn btn-outline">View Map</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>© 2026 Found &amp; Lost. Rebuilding community trust, one item at a time.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
