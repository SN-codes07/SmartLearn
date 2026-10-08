import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  IconSun, 
  IconMoon, 
  IconUser, 
  IconDashboard, 
  IconLogout, 
  IconMenu2, 
  IconX 
} from '@tabler/icons-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change or Escape key
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

      {/* Desktop Navigation Controls */}
      <div className="navbar-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Navigation links per role */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {user ? (
            isAdmin ? (
              <>
                <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin Dashboard</Link>
                <Link to="/learning-path" className={location.pathname === '/learning-path' ? 'active' : ''}>Curriculum</Link>
                <Link to="/select-assessment" className={location.pathname === '/select-assessment' ? 'active' : ''}>Assessments</Link>
              </>
            ) : (
              <>
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
                <Link to="/learning-path" className={location.pathname === '/learning-path' ? 'active' : ''}>Learning Path</Link>
                <Link to="/select-assessment" className={location.pathname === '/select-assessment' ? 'active' : ''}>Assessments</Link>
              </>
            )
          ) : (
            <>
              <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link>
              <Link to="/signup" className={location.pathname === '/signup' ? 'active' : ''}>Sign Up</Link>
            </>
          )}
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
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
          {theme === 'light' ? <IconMoon size={15} stroke={1.75} /> : <IconSun size={15} stroke={1.75} />}
          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>
            {theme === 'light' ? 'Dark' : 'Light'}
          </span>
        </button>

        {/* User Profile Dropdown Menu */}
        {user && (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="User profile menu"
              aria-expanded={dropdownOpen}
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
                color: isAdmin ? 'white' : 'var(--btn-text)',
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
                      <span className="badge" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
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
                    <IconUser size={16} stroke={1.75} /> View Profile
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
                      <IconDashboard size={16} stroke={1.75} /> Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '0.5rem',
                      border: 'none',
                      background: 'none',
                      color: 'var(--danger)',
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
                    <IconLogout size={16} stroke={1.75} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Header Actions (Trigger + Theme) */}
      <div className="navbar-mobile-actions" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          className="navbar-mobile-theme-btn"
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.45rem',
            cursor: 'pointer',
            color: 'var(--text-main)',
            backgroundColor: 'var(--card-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {theme === 'light' ? <IconMoon size={18} stroke={1.75} /> : <IconSun size={18} stroke={1.75} />}
        </button>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          className="navbar-mobile-toggle-btn"
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.45rem',
            cursor: 'pointer',
            color: 'var(--text-main)',
            backgroundColor: 'var(--card-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {mobileMenuOpen ? <IconX size={20} stroke={1.75} /> : <IconMenu2 size={20} stroke={1.75} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation Panel */}
      {mobileMenuOpen && (
        <div 
          className="navbar-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          {/* User Status Card (when logged in) */}
          {user && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isAdmin ? '#ef4444' : 'var(--primary)',
                  color: isAdmin ? 'white' : 'var(--btn-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '700'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {user.email}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                <span className={`badge ${isAdmin ? 'badge-danger' : 'badge-primary'}`}>
                  {user.role}
                </span>
                {user.studentId && (
                  <span className="badge" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-muted)' }}>
                    ID: {user.studentId}
                  </span>
                )}
                {user.department && (
                  <span className="badge" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-muted)' }}>
                    {user.department}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Navigation
            </span>
            {user ? (
              isAdmin ? (
                <>
                  <Link 
                    to="/admin" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-nav-link"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      color: location.pathname === '/admin' ? 'var(--primary)' : 'var(--text-main)',
                      backgroundColor: location.pathname === '/admin' ? 'var(--primary-light)' : 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}
                  >
                    Admin Dashboard
                  </Link>
                  <Link 
                    to="/learning-path" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-nav-link"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      color: location.pathname === '/learning-path' ? 'var(--primary)' : 'var(--text-main)',
                      backgroundColor: location.pathname === '/learning-path' ? 'var(--primary-light)' : 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}
                  >
                    Curriculum
                  </Link>
                  <Link 
                    to="/select-assessment" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-nav-link"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      color: location.pathname === '/select-assessment' ? 'var(--primary)' : 'var(--text-main)',
                      backgroundColor: location.pathname === '/select-assessment' ? 'var(--primary-light)' : 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}
                  >
                    Assessments
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-nav-link"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-main)',
                      backgroundColor: location.pathname === '/' ? 'var(--primary-light)' : 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/learning-path" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-nav-link"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      color: location.pathname === '/learning-path' ? 'var(--primary)' : 'var(--text-main)',
                      backgroundColor: location.pathname === '/learning-path' ? 'var(--primary-light)' : 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}
                  >
                    Learning Path
                  </Link>
                  <Link 
                    to="/select-assessment" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-nav-link"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      color: location.pathname === '/select-assessment' ? 'var(--primary)' : 'var(--text-main)',
                      backgroundColor: location.pathname === '/select-assessment' ? 'var(--primary-light)' : 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}
                  >
                    Assessments
                  </Link>
                </>
              )
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* User Account / Profile / Sign out */}
          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  color: 'var(--text-main)',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <IconUser size={18} stroke={1.75} /> My Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  color: 'var(--danger)',
                  borderColor: 'var(--danger)'
                }}
              >
                <IconLogout size={18} stroke={1.75} /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
