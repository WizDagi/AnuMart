import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ClipboardList, LayoutDashboard, Settings, LogOut, User, X, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Sidebar = () => {
  const { user, logout, isSidebarOpen, setIsSidebarOpen } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const close = () => setIsSidebarOpen(false);

  // Close sidebar on route change (mobile UX)
  useEffect(() => { close(); }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const menuItems = [
    { label: 'Home',            path: '/',       icon: <Home size={20} /> },
    { label: 'Shop',            path: '/shop',   icon: <ShoppingBag size={20} /> },
    { label: 'My Orders',       path: '/orders', icon: <ClipboardList size={20} /> },
    { label: 'Dashboard',       path: '/admin',  icon: <LayoutDashboard size={20} /> },
    { label: 'Profile Settings',path: '/profile',icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Backdrop — shown over page when sidebar is open */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={close} />
      )}

      {/* Sidebar panel */}
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <Link to="/" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={28} color="var(--primary)" />
            <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
              AnuMart<span style={{ color: 'var(--primary)' }}>.</span>
            </span>
          </Link>
          <button
            onClick={close}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', borderRadius: 'var(--radius-sm)', transition: 'var(--transition)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={close}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Footer — user info or login */}
        <div className="sidebar-footer">
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.25rem 0.5rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--gradient-primary)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', fontWeight: '700', color: 'white', flexShrink: 0,
                }}>
                  {(user.username || 'U')[0].toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user.username}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user.email || 'User Session'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { logout(); close(); navigate('/login'); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', color: 'var(--error)', fontSize: '0.88rem',
                  background: 'var(--error-bg)', border: 'none', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', fontWeight: '600', transition: 'var(--transition)',
                }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={close}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: 'var(--gradient-primary)', color: 'white', padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)', fontSize: '0.88rem', fontWeight: '600',
                transition: 'var(--transition)', width: '100%',
              }}
            >
              <User size={18} />
              <span>Login / Register</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
