import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Github, Twitter, Instagram, Linkedin, Mail, Sparkles, Check, Heart, Lock, CreditCard, Rocket } from 'lucide-react';

const LINKS = {
  Shop:    [{ label: 'All Products', to: '/shop' }, { label: 'New Arrivals', to: '/shop' }, { label: 'Best Sellers', to: '/shop' }, { label: 'Wishlist', to: '/wishlist' }],
  Account: [{ label: 'My Orders', to: '/orders' }, { label: 'Profile', to: '/profile' }, { label: 'Login', to: '/login' }, { label: 'Register', to: '/register' }],
  Support: [{ label: 'FAQ', to: '/' }, { label: 'Shipping Info', to: '/' }, { label: 'Returns', to: '/' }, { label: 'Contact Us', to: '/' }],
  Legal:   [{ label: 'Privacy Policy', to: '/' }, { label: 'Terms of Service', to: '/' }, { label: 'Cookie Policy', to: '/' }],
};

const SOCIALS = [
  { icon: <Twitter size={18} />, href: '#' },
  { icon: <Instagram size={18} />, href: '#' },
  { icon: <Github size={18} />, href: '#' },
  { icon: <Linkedin size={18} />, href: '#' },
];

const Footer = () => {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

  return (
    <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', marginTop: '6rem' }}>
      {/* Newsletter bar */}
      <div style={{ background: 'var(--primary-glow)', borderBottom: '1px solid var(--border)', padding: '2.5rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
              Stay in the Loop <Sparkles size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '0.3rem' }} />
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Get exclusive deals, new arrivals and insider news.
            </p>
          </div>
          {subscribed ? (
            <div style={{ color: 'var(--success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={16} /> You're subscribed! Welcome aboard.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.75rem', flex: '1', maxWidth: '420px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '2.75rem' }}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main footer grid */}
      <div className="container" style={{ padding: '4rem 2rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(4, 1fr)', gap: '3rem', marginBottom: '3rem' }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Package size={28} color="var(--primary)" />
              <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                AnuMart<span style={{ color: 'var(--primary)' }}>.</span>
              </span>
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '200px' }}>
              Premium goods for those who demand excellence in every detail.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {SOCIALS.map((s, i) => (
                <a key={i} href={s.href} style={{
                  width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', borderRadius: '8px', background: 'var(--bg-elevated)',
                  color: 'var(--text-muted)', border: '1px solid var(--border)',
                  transition: 'var(--transition)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                {title}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to} style={{ color: 'var(--text-muted)', fontSize: '0.9rem', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
            © 2026 AnuMart. All rights reserved. Developed by Dagim Anteneh.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[
              { icon: <Lock size={13} />, label: 'SSL Secured' },
              { icon: <CreditCard size={13} />, label: 'PCI Compliant' },
              { icon: <Rocket size={13} />, label: 'Fast Delivery' },
            ].map(t => (
              <span key={t.label} style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>{t.icon} {t.label}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
