import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-orange-400' : 'text-gray-300 hover:text-white'}`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-3 text-sm font-medium border-b border-navy-700 transition-colors ${isActive ? 'text-orange-400' : 'text-gray-300 hover:text-white hover:bg-navy-700'}`;

  const navLinks = [
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/draft-classes', label: 'Draft Classes' },
    { to: '/true-value', label: 'True Value' },
    { to: '/scoring-rules', label: 'Scoring' },
  ];

  return (
    <nav className="bg-navy-800 border-b border-navy-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo + desktop links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-orange-500 text-xl font-black tracking-tight">BigBoards</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(({ to, label }) => (
                <NavLink key={to} to={to} className={linkClass}>{label}</NavLink>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NavLink to="/upload" className="hidden sm:block bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3 py-1.5 rounded-md transition-colors">
                  Upload Board
                </NavLink>
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(o => !o)} className="text-sm text-gray-300 hover:text-white flex items-center gap-1">
                    {user.username}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-navy-700 border border-navy-600 rounded-lg shadow-xl">
                      <Link to={`/authors/${user.id}`} className="block px-4 py-2 text-sm text-gray-200 hover:bg-navy-600" onClick={() => setUserMenuOpen(false)}>My Profile</Link>
                      {user.is_admin && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-orange-400 hover:bg-navy-600" onClick={() => setUserMenuOpen(false)}>Admin</Link>
                      )}
                      <button onClick={() => { setUserMenuOpen(false); handleLogout(); }} className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-navy-600">Sign Out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <NavLink to="/login" className={linkClass}>Sign In</NavLink>
                <NavLink to="/register" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3 py-1.5 rounded-md transition-colors">Sign Up</NavLink>
              </div>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-navy-700 bg-navy-800">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} className={mobileLinkClass}>{label}</NavLink>
          ))}
          {user ? (
            <>
              <NavLink to="/upload" className={mobileLinkClass}>Upload Board</NavLink>
              <NavLink to={`/authors/${user.id}`} className={mobileLinkClass}>My Profile</NavLink>
              {user.is_admin && (
                <NavLink to="/admin" className={({ isActive }) => `block px-4 py-3 text-sm font-medium border-b border-navy-700 transition-colors ${isActive ? 'text-orange-400' : 'text-orange-400 hover:text-orange-300 hover:bg-navy-700'}`}>Admin</NavLink>
              )}
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-navy-700">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={mobileLinkClass}>Sign In</NavLink>
              <NavLink to="/register" className={mobileLinkClass}>Sign Up</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
