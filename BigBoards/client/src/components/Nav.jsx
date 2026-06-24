import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-orange-400' : 'text-gray-300 hover:text-white'}`;

  return (
    <nav className="bg-navy-800 border-b border-navy-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-orange-500 text-xl font-black tracking-tight">BigBoards</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/leaderboard" className={linkClass}>Leaderboard</NavLink>
              <NavLink to="/draft-classes" className={linkClass}>Draft Classes</NavLink>
              <NavLink to="/true-value" className={linkClass}>True Value</NavLink>
              <NavLink to="/scoring-rules" className={linkClass}>Scoring</NavLink>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NavLink to="/upload" className="hidden sm:block bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3 py-1.5 rounded-md transition-colors">
                  Upload Board
                </NavLink>
                <div className="relative">
                  <button onClick={() => setOpen(!open)} className="text-sm text-gray-300 hover:text-white flex items-center gap-1">
                    {user.username}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {open && (
                    <div className="absolute right-0 mt-2 w-44 bg-navy-700 border border-navy-600 rounded-lg shadow-xl">
                      <Link to={`/authors/${user.id}`} className="block px-4 py-2 text-sm text-gray-200 hover:bg-navy-600" onClick={() => setOpen(false)}>My Profile</Link>
                      <NavLink to="/upload" className="block px-4 py-2 text-sm text-gray-200 hover:bg-navy-600 sm:hidden" onClick={() => setOpen(false)}>Upload Board</NavLink>
                      {user.is_admin && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-orange-400 hover:bg-navy-600" onClick={() => setOpen(false)}>Admin</Link>
                      )}
                      <button onClick={() => { setOpen(false); handleLogout(); }} className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-navy-600">Sign Out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>Sign In</NavLink>
                <NavLink to="/register" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3 py-1.5 rounded-md transition-colors">Sign Up</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
