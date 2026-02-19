import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      {/* Navigation */}
      <nav className="home-navbar">
        <div className="home-navbar-container">
          <div className="home-brand">
            <span className="home-brand-icon">🆘</span>
            <span className="home-brand-text">Help-me</span>
          </div>
          <div className="home-nav-menu">
            <a href="#features" className="home-nav-link">Features</a>
            <a href="#how-it-works" className="home-nav-link">How it works</a>
            <a href="#about" className="home-nav-link">About</a>
            <Link to="/login" className="home-nav-link">Log In</Link>
            <Link to="/signup" className="home-btn home-btn-primary">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-container">
          <div className="home-hero-content">
            <div className="home-hero-text">
              <span className="home-hero-badge">🚨 EMERGENCY SAFETY PLATFORM</span>
              <h1 className="home-hero-title">
                Your safety, <br />
                <span className="home-hero-highlight">one tap</span> <br />
                away
              </h1>
              <p className="home-hero-description">
                Trigger an emergency alert instantly. Your real-time location is shared with trusted contacts and nearby users — no manual steps needed.
              </p>
              <div className="home-hero-actions">
                <Link to="/signup" className="home-btn home-btn-primary home-btn-large">
                  Get Started →
                </Link>
                <a href="#how-it-works" className="home-btn home-btn-secondary">
                  See how it works
                </a>
              </div>
            </div>
            <div className="home-hero-visual">
              <div className="home-phone-mockup">
                <div className="home-phone-screen">
                  <div className="home-phone-header">
                    <span className="home-phone-time">9:41</span>
                  </div>
                  <div className="home-phone-content">
                    <div className="home-alert-status">
                      <span className="home-status-dot"></span>
                      Alert sent in 0.3s
                    </div>
                    <div className="home-user-card">
                      <div className="home-user-greeting">Hi, John 👋</div>
                      <div className="home-user-status">You're protected</div>
                      <div className="home-sos-button">
                        <span className="home-sos-text">SOS</span>
                      </div>
                      <div className="home-contacts-info">
                        <div className="home-contacts-avatars">
                          <div className="home-avatar home-avatar-1"></div>
                          <div className="home-avatar home-avatar-2"></div>
                          <div className="home-avatar home-avatar-3"></div>
                          <div className="home-avatar-count">+2</div>
                        </div>
                        <div className="home-notification-badge">
                          📍 3 contacts notified
                        </div>
                        <div className="home-location-status">
                          📍 Live location active
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="home-about">
        <div className="home-about-container">
          <div className="home-about-content">
            <span className="home-section-badge">ABOUT</span>
            <h2 className="home-section-title">
              Built for the moments that matter most
            </h2>
            <p className="home-section-description">
              Help-me is an emergency safety platform that eliminates the friction of calling for help. By automating alerts and location sharing, we reduce response time when every second counts.
            </p>
            <p className="home-section-description">
              Powered by Node.js, MongoDB, Firebase Cloud Messaging, and Twilio — built to be fast, reliable, and always available.
            </p>
            <Link to="/signup" className="home-btn home-btn-primary">
              Join Help-me →
            </Link>
          </div>
          <div className="home-stats">
            <div className="home-stat-card">
              <div className="home-stat-number">0.3s</div>
              <div className="home-stat-label">Average alert delivery time</div>
            </div>
            <div className="home-stat-card">
              <div className="home-stat-number">3</div>
              <div className="home-stat-label">Channels notified simultaneously</div>
            </div>
            <div className="home-stat-card">
              <div className="home-stat-number">100%</div>
              <div className="home-stat-label">Automated — no manual steps</div>
            </div>
            <div className="home-stat-card home-stat-highlight">
              <div className="home-stat-number">24/7</div>
              <div className="home-stat-label">Always on protection</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="home-features">
        <div className="home-features-container">
          <div className="home-features-header">
            <h2 className="home-section-title">
              Everything you need to stay safe
            </h2>
            <p className="home-section-subtitle">
              One platform. Instant response. Zero manual steps.
            </p>
          </div>
          <div className="home-features-grid">
            <div className="home-feature-card">
              <div className="home-feature-icon home-feature-icon-sos">🆘</div>
              <h3 className="home-feature-title">One-Tap SOS</h3>
              <p className="home-feature-description">
                A single press triggers a full emergency alert — no typing, no dialing, no delay.
              </p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon home-feature-icon-gps">📍</div>
              <h3 className="home-feature-title">Live GPS Tracking</h3>
              <p className="home-feature-description">
                Real-time location shared with contacts and visible on an interactive map.
              </p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon home-feature-icon-sms">💬</div>
              <h3 className="home-feature-title">Instant SMS</h3>
              <p className="home-feature-description">
                Twilio-powered SMS alerts fired immediately to all emergency contacts.
              </p>
            </div>
          </div>
          <div className="home-network-feature">
            <div className="home-network-card">
              <div className="home-network-icon">👥</div>
              <h3 className="home-network-title">Nearby User Network</h3>
              <p className="home-network-description">
                Alert nearby Help-me users who can physically respond while contacts are en route.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-container">
          <div className="home-footer-brand">
            <span className="home-brand-icon">🆘</span>
            <span className="home-brand-text">Help-me</span>
          </div>
          <div className="home-footer-content">
            <span className="home-footer-text">© 2026 Help-me. Your safety is our priority.</span>
            <div className="home-footer-links">
              <a href="#privacy" className="home-footer-link">Privacy</a>
              <a href="#terms" className="home-footer-link">Terms</a>
              <a href="#contact" className="home-footer-link">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;