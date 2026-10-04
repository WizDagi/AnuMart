import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ecom_cart')) || []; }
    catch { return []; }
  });

  const [wishlistItems, setWishlistItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ecom_wishlist')) || []; }
    catch { return []; }
  });

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return {
      token,
      userId: localStorage.getItem('userId'),
      username: localStorage.getItem('username'),
      email: localStorage.getItem('email'),
    };
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('ecom_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('ecom_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('ecom_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  useEffect(() => {
    localStorage.setItem('ecom_theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  }, []);

  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...product, quantity }];
    });
    showToast(`${product.name} added to cart!`);
  }, [showToast]);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prev => prev.filter(i => i.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, qty) => {
    if (qty <= 0) {
      setCartItems(prev => prev.filter(i => i.id !== productId));
    } else {
      setCartItems(prev => prev.map(i => i.id === productId ? { ...i, quantity: qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const toggleWishlist = useCallback((product) => {
    setWishlistItems(prev => {
      const isIn = prev.some(i => i.id === product.id);
      if (isIn) {
        showToast('Removed from wishlist', 'info');
        return prev.filter(i => i.id !== product.id);
      }
      showToast(`${product.name} saved to wishlist`);
      return [...prev, product];
    });
  }, [showToast]);

  const isInWishlist = useCallback(
    (productId) => wishlistItems.some(i => i.id === productId),
    [wishlistItems]
  );

  const login = useCallback((userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('userId', userData.userId || '');
    localStorage.setItem('username', userData.username || '');
    if (userData.email) localStorage.setItem('email', userData.email);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    ['token', 'userId', 'username', 'email'].forEach(k => localStorage.removeItem(k));
    setUser(null);
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <AppContext.Provider value={{
      cartItems, cartCount, cartTotal,
      addToCart, removeFromCart, updateQuantity, clearCart,
      isCartOpen, setIsCartOpen,
      isSidebarOpen, setIsSidebarOpen,
      wishlistItems, toggleWishlist, isInWishlist,
      user, login, logout,
      toast, showToast,
      theme, toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
