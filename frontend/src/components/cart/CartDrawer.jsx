import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, ChevronRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const PROMO_CODES = { 'SAVE10': 0.10, 'WELCOME20': 0.20, 'VIP15': 0.15 };

const CartDrawer = () => {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart, cartTotal } = useApp();
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoError, setPromoError] = useState('');

  if (!isCartOpen) return null;

  const discount = promoApplied ? cartTotal * PROMO_CODES[promoApplied] : 0;
  const shipping = cartTotal > 0 ? (cartTotal > 150 ? 0 : 15) : 0;
  const total = (cartTotal - discount + shipping).toFixed(2);

  const applyPromo = () => {
    const code = promoInput.toUpperCase().trim();
    if (PROMO_CODES[code]) {
      setPromoApplied(code);
      setPromoError('');
    } else {
      setPromoError('Invalid code. Try SAVE10, WELCOME20, or VIP15');
      setPromoApplied(null);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000 }}>
      <div onClick={() => setIsCartOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} />

      <div className="animate-slide-up" style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '420px',
        background: 'var(--bg-dark)', borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', animation: 'none',
        transform: 'translateX(0)', transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={22} color="var(--primary)" />
            My Cart
            {cartItems.length > 0 && (
              <span className="badge" style={{ fontSize: '0.7rem' }}>{cartItems.reduce((s, i) => s + i.quantity, 0)}</span>
            )}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {cartItems.length > 0 && (
              <button onClick={clearCart} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}>
                Clear all
              </button>
            )}
            <button onClick={() => setIsCartOpen(false)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.75rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '5rem', color: 'var(--text-muted)' }}>
              <ShoppingBag size={52} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Your cart is empty</p>
              <p style={{ fontSize: '0.85rem', marginBottom: '2rem' }}>Add some premium items to get started.</p>
              <button onClick={() => setIsCartOpen(false)} className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.65rem 1.5rem' }}>
                Browse Shop
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  {/* Image placeholder */}
                  <div style={{ width: '64px', height: '64px', borderRadius: '10px', background: 'var(--bg-elevated)', flexShrink: 0, overflow: 'hidden' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={22} color="var(--text-muted)" /></div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', flexShrink: 0, display: 'flex', opacity: 0.7, transition: 'var(--transition)' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0.7}>
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem' }}>
                      {/* Quantity controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-elevated)', borderRadius: '8px', padding: '0.2rem' }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '6px', transition: 'var(--transition)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                          <Minus size={13} />
                        </button>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '6px', transition: 'var(--transition)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                          <Plus size={13} />
                        </button>
                      </div>
                      <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1rem' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: promo + totals */}
        {cartItems.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Promo code */}
            <div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Tag size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoInput}
                    onChange={e => { setPromoInput(e.target.value); setPromoError(''); }}
                    className="input"
                    style={{ paddingLeft: '2.5rem', height: '40px', fontSize: '0.85rem' }}
                  />
                </div>
                <button onClick={applyPromo} className="btn-secondary" style={{ height: '40px', padding: '0 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  Apply
                </button>
              </div>
              {promoApplied && (
                <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Check size={14} /> {promoApplied} applied — {(PROMO_CODES[promoApplied] * 100).toFixed(0)}% off!</p>
              )}
              {promoError && (
                <p style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: '0.4rem' }}>{promoError}</p>
              )}
            </div>

            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
              </div>
              {promoApplied && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--success)' }}>
                  <span>Discount ({(PROMO_CODES[promoApplied] * 100).toFixed(0)}%)</span><span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {cartTotal < 150 && cartTotal > 0 && (
                <p style={{ fontSize: '0.75rem', color: 'var(--accent)', background: 'var(--primary-glow)', padding: '0.4rem 0.75rem', borderRadius: '6px', textAlign: 'center' }}>
                  Add ${(150 - cartTotal).toFixed(2)} more for FREE shipping!
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <span>Total</span><span style={{ color: 'var(--primary)' }}>${total}</span>
              </div>
            </div>

            <Link to="/checkout" onClick={() => setIsCartOpen(false)} className="btn-primary" style={{ textAlign: 'center', fontSize: '0.95rem' }}>
              Checkout Now <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
