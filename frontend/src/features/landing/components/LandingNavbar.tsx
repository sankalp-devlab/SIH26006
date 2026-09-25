import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, ArrowUpRight, Compass, Play } from 'lucide-react';

interface LandingNavbarProps {
  onOpenSearch?: () => void;
  onOpenDemo?: () => void;
}

export function LandingNavbar({ onOpenSearch, onOpenDemo }: LandingNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string, tabName: string) => {
    setActiveTab(tabName);
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`oceanlens-navbar ${isScrolled ? 'scrolled' : ''}`} role="banner">
      <div className="navbar-inner-container">
        {/* Brand Logo */}
        <Link
          to="/"
          className="navbar-brand-link"
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="OceanLens Home"
        >
          <div className="navbar-logo-icon" aria-hidden="true">
            <Compass size={20} strokeWidth={2.2} />
          </div>
          <div className="navbar-brand-text">
            <span className="navbar-brand-name">OceanLens</span>
            <span className="navbar-brand-tagline">Maritime Intelligence</span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="navbar-center-nav" aria-label="Primary Navigation">
          <ul className="navbar-center-menu">
            <li className={`navbar-menu-item ${activeTab === 'home' ? 'active' : ''}`}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Home
              </button>
            </li>
            <li className={`navbar-menu-item ${activeTab === 'features' ? 'active' : ''}`}>
              <button
                type="button"
                onClick={() => scrollToSection('features', 'features')}
              >
                Features
              </button>
            </li>
            <li className={`navbar-menu-item ${activeTab === 'market' ? 'active' : ''}`}>
              <button
                type="button"
                onClick={() => scrollToSection('market-data', 'market')}
              >
                Market Data
              </button>
            </li>
            <li className={`navbar-menu-item ${activeTab === 'fleets' ? 'active' : ''}`}>
              <button
                type="button"
                onClick={() => scrollToSection('fleet-intelligence', 'fleets')}
              >
                Fleet Analytics
              </button>
            </li>
            <li className={`navbar-menu-item ${activeTab === 'about' ? 'active' : ''}`}>
              <button
                type="button"
                onClick={() => scrollToSection('enterprise-trust', 'about')}
              >
                Enterprise
              </button>
            </li>
          </ul>
        </nav>

        {/* Right Action Buttons */}
        <div className="navbar-right-actions">
          <button
            type="button"
            className="navbar-search-btn"
            onClick={onOpenSearch}
            aria-label="Open search"
            title="Search vessels, ports, market indices"
          >
            <Search size={16} aria-hidden="true" />
          </button>

          {onOpenDemo && (
            <button
              type="button"
              className="navbar-demo-btn"
              onClick={onOpenDemo}
              aria-label="Watch interactive demo"
              title="Watch interactive platform demo"
            >
              <Play size={13} fill="currentColor" />
              <span>Watch Demo</span>
            </button>
          )}

          <Link to="/dashboard" className="navbar-login-btn">
            Log In
          </Link>

          <Link to="/dashboard" className="navbar-get-started-btn">
            <span>Explore Platform</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>

          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Accessible Responsive Mobile Drawer */}
      <div
        className={`navbar-mobile-drawer ${mobileOpen ? 'open' : ''}`}
        role="dialog"
        aria-label="Mobile Navigation"
        aria-hidden={!mobileOpen}
      >
        <ul className="mobile-menu-links">
          <li>
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setMobileOpen(false);
              }}
            >
              Home
            </button>
          </li>
          <li>
            <button type="button" onClick={() => scrollToSection('features', 'features')}>
              Features
            </button>
          </li>
          <li>
            <button type="button" onClick={() => scrollToSection('market-data', 'market')}>
              Market Data
            </button>
          </li>
          <li>
            <button type="button" onClick={() => scrollToSection('fleet-intelligence', 'fleets')}>
              Fleet Analytics
            </button>
          </li>
          <li>
            <button type="button" onClick={() => scrollToSection('enterprise-trust', 'about')}>
              Enterprise Trust
            </button>
          </li>
        </ul>

        <div className="mobile-drawer-footer">
          {onOpenDemo && (
            <button
              type="button"
              className="navbar-demo-btn mobile-full"
              style={{ justifyContent: 'center', padding: '0.65rem', marginBottom: '0.5rem' }}
              onClick={() => {
                setMobileOpen(false);
                onOpenDemo();
              }}
            >
              <Play size={14} fill="currentColor" />
              <span>Watch Demo</span>
            </button>
          )}
          <Link
            to="/dashboard"
            className="navbar-get-started-btn mobile-full"
            onClick={() => setMobileOpen(false)}
          >
            Launch Platform
          </Link>
          <Link
            to="/dashboard"
            className="navbar-login-btn mobile-full"
            onClick={() => setMobileOpen(false)}
          >
            Log In
          </Link>
        </div>
      </div>
    </header>
  );
}
