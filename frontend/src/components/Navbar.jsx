import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <nav className="navbar">
      <Link to={isAdmin ? "/admin" : "/"} className="navbar-brand">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l10 6.5-10 6.5-10-6.5z"/><path d="M12 22v-7.5"/><path d="M22 8.5v7.5l-10 6.5-10-6.5v-7.5"/>
        </svg>
        <span>SmartLearn</span>
        {isAdmin && (
          <span style={{
            fontSize: '0.65rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            fontWeight: '700',
            letterSpacing: '0.5px'
          }}>
            ADMIN
          </span>
        )}
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Navigation links per role */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {user ? (
            isAdmin ? (
              <>
                <Link to="/admin">Admin Dashboard</Link>
                <Link to="/learning-path">Curriculum</Link>
                <Link to="/select-assessment">Assessments</Link>
              </>
            ) : (
              <>
                <Link to="/">Dashboard</Link>
                <Link to="/learning-path">Learning Path</Link>
                <Link to="/select-assessment">Assessments</Link>
              </>
            )
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: '2rem',
            padding: '0.35rem 0.75rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-main)',
            backgroundColor: 'var(--card-bg)'
          }}
        >
          <span>{theme === 'light' ? '🌙' : '☀️'}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>
            {theme === 'light' ? 'Dark' : 'Light'}
          </span>
        </button>

        {/* User Profile Dropdown Menu */}
        {user && (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'none',
                border: '1px solid var(--border-color)',
                borderRadius: '2rem',
                padding: '0.35rem 0.8rem',
                cursor: 'pointer',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-main)'
              }}
            >
              <span style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: isAdmin ? '#ef4444' : 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: '700'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                {user.name ? user.name.split(' ')[0] : 'User'}
              </span>
              <span style={{ fontSize: '0.7rem' }}>▼</span>
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                width: '260px',
                backgroundColor: 'var(--card-bg)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-color)',
                padding: '1rem',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {/* User Info Header */}
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {user.email}
                  </div>
                  <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span className={`badge ${isAdmin ? 'badge-danger' : 'badge-primary'}`}>
                      {user.role}
                    </span>
                    {user.studentId && (
                      <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                        ID: {user.studentId}
                      </span>
                    )}
                  </div>
                  {user.department && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      {user.department} {user.academicYear && `• ${user.academicYear}`}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      padding: '0.5rem',
                      textDecoration: 'none',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span>👤</span> View Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        padding: '0.5rem',
                        textDecoration: 'none',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span>📊</span> Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '0.5rem',
                      border: 'none',
                      background: 'none',
                      color: '#ef4444',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textAlign: 'left'
                    }}
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
