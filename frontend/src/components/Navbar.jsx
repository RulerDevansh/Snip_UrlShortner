import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        location.pathname === to
          ? 'text-white'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-hero-gradient flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Snip</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              {navLink('/dashboard', 'Dashboard')}
              <div className="flex items-center gap-3 pl-4 border-l border-surface-border">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-brand-400">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-300 max-w-[120px] truncate">{user?.name}</span>
                <button onClick={logout} className="btn-ghost text-xs px-3 py-1.5">
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              {navLink('/login', 'Log in')}
              <Link to="/register" className="btn-primary text-xs px-4 py-2">
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-surface-border bg-surface-card px-4 py-4 flex flex-col gap-3 animate-in">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-300 hover:text-white">Dashboard</Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="text-sm font-medium text-red-400 hover:text-red-300 text-left">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-300 hover:text-white">Log in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm w-full text-center">Get started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
