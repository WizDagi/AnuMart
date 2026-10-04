import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, Package, Sun, Moon, Bell, Heart, X, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

const Navbar = () => {
  const { cartCount, setIsCartOpen, wishlistItems, theme, toggleTheme, isSidebarOpen, setIsSidebarOpen } = useApp();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    const load = () => api.getNotifications()
      .then(l => setNotifications(Array.isArray(l) ? l.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)) : []))
      .catch(() => {});
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const formatTime = (d) => {
    try {
      const m = Math.floor((Date.now() - new Date(d)) / 60000);
      if (m < 1) return 'Just now';
      if (m < 60) return `${m}m ago`;
      if (m < 1440) return `${Math.floor(m / 60)}h ago`;
      return new Date(d).toLocaleDateString();
    } catch { return ''; }
  };

  const formatNotif = (n) => {
    try {
      const d = JSON.parse(n.payload);
      if (n.eventType === 'ORDER_PLACED') return `Order #${d.orderId?.substring(0, 8)} placed — $${d.totalAmount || '0.00'}`;
    } catch {}
    return `${n.eventType}: ${n.payload}`;
  };

  const iconBtnStyle = {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius-sm)',
    display: 'flex', alignItems: 'center', position: 'relative', transition: 'var(--transition)',
  };

  const dropdownStyle = {
    position: 'absolute', top: '48px', right: 0,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 1100,
  };

  return (
    <nav className="glass-nav">
      <div className="container" style={{ height: '72px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        
        {/* Hamburger menu — always visible, toggles sidebar */}
        <button 
          onClick={() => setIsSidebarOpen(v => !v)} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-main)', 
            cursor: 'pointer', 
            padding: '0.5rem', 
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Menu size={22} />
        </button>

        {/* Logo — always visible in header */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <Package size={24} color="var(--primary)" />
          <span style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            AnuMart<span style={{ color: 'var(--primary)' }}>.</span>
          </span>
        </Link>

        {/* Search - visible on desktop and mobile */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '400px', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', gap: '0.5rem' }}>
          <Search size={16} color="var(--text-muted)" />
          <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '0.88rem', width: '100%' }} />
          {searchQuery && <button type="button" onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><X size={14} /></button>}
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto', flexShrink: 0 }}>
          {/* Theme */}
          <button onClick={toggleTheme} style={iconBtnStyle}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" style={{ ...iconBtnStyle, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <Heart size={20} />
            {wishlistItems.length > 0 && (
              <span className="badge" style={{ position: 'absolute', top: 0, right: 0, fontSize: '9px', padding: '1px 4px', background: 'var(--error)' }}>
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button onClick={() => setShowNotifications(v => !v)} style={iconBtnStyle}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="badge" style={{ position: 'absolute', top: 0, right: 0, fontSize: '9px', padding: '1px 4px' }}>
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="animate-slide-up" style={{ ...dropdownStyle, width: '320px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Activity Log</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => api.getNotifications().then(l => setNotifications(Array.isArray(l) ? l : [])).catch(() => {})}>Refresh</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
                  {notifications.length === 0
                    ? <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>No notifications yet</p>
                    : notifications.slice(0, 6).map((n, i) => (
                      <div key={n.id || i} style={{ fontSize: '0.85rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border)' }}>
                        <p style={{ color: 'var(--text-main)', marginBottom: '0.2rem', lineHeight: 1.3 }}>{formatNotif(n)}</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(n.receivedAt)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <button onClick={() => setIsCartOpen(true)} style={iconBtnStyle}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="badge" style={{ position: 'absolute', top: 0, right: 0, fontSize: '9px', padding: '1px 4px' }}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
