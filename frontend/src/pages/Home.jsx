import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Headset, Star, Sparkles, Heart, ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

const Home = () => {
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const products = await api.getProducts();
        if (Array.isArray(products) && products.length > 0) {
          setFeaturedProducts(products.slice(0, 4));
        } else {
          setFeaturedProducts(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.warn('Failed to fetch real products, using fallback:', err);
        setFeaturedProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const FALLBACK_PRODUCTS = [
    { id: 1, name: 'Quantum Laptop', price: 1299, description: 'Next-gen computing with sleek titanium finish.', image: '/products/laptop.png' },
    { id: 2, name: 'Neural Buds', price: 199, description: 'Experience sound like never before.', image: '/products/buds.png' },
    { id: 3, name: 'Infinity Watch', price: 349, description: 'Elegance on your wrist, power in your hands.', image: '/products/watch.png' },
    { id: 4, name: 'Core Tablet', price: 799, description: 'The ultimate tool for creators and professionals.', image: '/products/tablet.png' }
  ];

  return (
    <div style={{ background: 'var(--gradient-hero)', minHeight: '100vh' }}>
      {/* 1. Hero Section */}
      <section className="container" style={{ paddingTop: '160px', paddingBottom: '6rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}>
        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <h1 style={{ fontSize: '4.2rem', fontWeight: '900', lineHeight: 1.1, letterSpacing: '-2px' }}>
            Elevate Your <br />
            <span className="gradient-text">Lifestyle & Power</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.7', maxWidth: '520px' }}>
            Experience the future of computing and premium audio devices. Designed for professionals, creators, and tech visionaries.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Link to="/shop" className="btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1rem' }}>
              Shop Collection <ArrowRight size={18} />
            </Link>
            <Link to="/shop" className="btn-secondary" style={{ padding: '0.9rem 2.2rem', fontSize: '1rem' }}>
              View Catalog
            </Link>
          </div>
        </div>
        <div className="animate-scale" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            position: 'absolute', width: '380px', height: '380px', background: 'rgba(99,102,241,0.15)',
            filter: 'blur(80px)', borderRadius: '50%', zIndex: 0, top: '10%'
          }} />
          <img
            src="/hero-laptop.png"
            alt="Premium Tech Hero"
            style={{
              width: '100%', maxWidth: '500px', height: '380px', objectFit: 'cover',
              borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)', zIndex: 1, position: 'relative'
            }}
          />
        </div>
      </section>

      {/* 2. Trust Badges */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', padding: '3rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>
          {[
            { icon: <Truck size={24} color="var(--primary)" />, title: 'Free Express Shipping', desc: 'On all orders above $150' },
            { icon: <ShieldCheck size={24} color="var(--primary)" />, title: 'Secure Crypt Payment', desc: '100% encrypted checkout flow' },
            { icon: <RotateCcw size={24} color="var(--primary)" />, title: '30-Day Easy Returns', desc: 'Hassle-free swap guarantee' },
            { icon: <Headset size={24} color="var(--primary)" />, title: '24/7 Expert Help', desc: 'Dedicated professional support' }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--bg-elevated)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex' }}>
                {item.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.2rem' }}>{item.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Category Highlights */}
      <section className="container" style={{ padding: '6rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Curated Categories</h2>
          <p style={{ color: 'var(--text-muted)' }}>Explore our range of premium technological solutions</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '2rem' }}>
          {[
            { name: 'Computers & Laptops', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', span: false },
            { name: 'Audio Systems', img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80', span: false },
            { name: 'Premium Accessories', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80', span: true }
          ].map((cat, idx) => (
            <div key={idx} className="card" style={{
              height: '320px', position: 'relative', overflow: 'hidden',
              gridColumn: cat.span ? 'span 1' : 'span 1'
            }}>
              <img
                src={cat.img}
                alt={cat.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }}
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem', color: 'white' }}>{cat.name}</h3>
                <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem' }}>
                  Explore Items <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Best Sellers Grid */}
      <section className="container" style={{ paddingBottom: '6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Best Sellers</h2>
            <p style={{ color: 'var(--text-muted)' }}>Top trending products handpicked for premium quality</p>
          </div>
          <Link to="/shop" className="btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }}>
            View All Products
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2.5rem' }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="skeleton" style={{ height: '380px' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2.5rem' }} className="stagger">
            {featuredProducts.map((product) => {
              const wishlist = isInWishlist(product.id);
              return (
                <div key={product.id} className="card card-product animate-fade" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '220px', background: 'var(--bg-elevated)', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                      alt={product.name}
                      className="product-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    />
                    <button
                      onClick={() => toggleWishlist(product)}
                      style={{
                        position: 'absolute', top: '12px', right: '12px', background: 'var(--glass)',
                        border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5,
                        color: wishlist ? 'var(--error)' : 'var(--text-main)'
                      }}
                    >
                      <Heart size={16} fill={wishlist ? 'var(--error)' : 'none'} />
                    </button>
                  </div>
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', gap: '0.5rem' }}>
                        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>{product.name}</h3>
                        </Link>
                        <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
                          ${product.price}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.description}
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="btn-primary"
                      style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem' }}
                    >
                      <ShoppingCart size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Customer Testimonials */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '6rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Loved by Visionaries</h2>
            <p style={{ color: 'var(--text-muted)' }}>Hear from our regular clients worldwide</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { text: "Absolutely phenomenal quality! The Quantum Laptop is blindingly fast and beautiful. The support desk helped me with billing questions instantly.", author: "Alexander Thorne", role: "Creative Director" },
              { text: "I bought the Neural Buds. Excellent spatial audio depth and solid battery life. The notification alerts tracking delivery was incredibly helpful.", author: "Sarah Jenkins", role: "UI Designer" },
              { text: "The service is premium. Delivery to Zurich was flawless. Very impressed by the modern dark design system of the checkout process.", author: "Liam Keller", role: "Software Engineer" }
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem' }}>
                <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1.25rem' }}>
                  {[1, 2, 3, 4, 5].map(n => <Star key={n} size={15} fill="var(--warning)" color="var(--warning)" />)}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                  "{t.text}"
                </p>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{t.author}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
