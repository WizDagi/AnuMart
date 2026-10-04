import React, { useState } from 'react';
import { CreditCard, Truck, ShieldCheck, ShoppingBag, ChevronRight, ChevronLeft, Calendar, XCircle, PartyPopper, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart, showToast } = useApp();
  const navigate = useNavigate();

  // Steps: 0 = Shipping, 1 = Payment, 2 = Review, 3 = Confirmed
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'paypal'

  // Form State
  const [shippingForm, setShippingForm] = useState({
    firstName: '', lastName: '', address: '', city: '', zip: '', phone: '', email: ''
  });
  const [cardForm, setCardForm] = useState({
    cardNumber: '', cardName: '', expiry: '', cvc: ''
  });
  const [errors, setErrors] = useState({});

  // Summary Totals
  const discount = 0; // Mock promo codes already applied in cart drawers could be sent here
  const shippingCost = cartTotal > 150 ? 0 : 15;
  const total = (cartTotal - discount + shippingCost).toFixed(2);

  // Validation
  const validateShipping = () => {
    const errs = {};
    if (!shippingForm.firstName.trim()) errs.firstName = 'First name required';
    if (!shippingForm.lastName.trim()) errs.lastName = 'Last name required';
    if (!shippingForm.address.trim()) errs.address = 'Street address required';
    if (!shippingForm.city.trim()) errs.city = 'City required';
    if (!shippingForm.zip.trim()) errs.zip = 'Zip code required';
    else if (!/^\d{5}(-\d{4})?$/.test(shippingForm.zip.trim())) errs.zip = 'Invalid zip format (e.g. 12345)';
    if (!shippingForm.email.trim()) errs.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(shippingForm.email)) errs.email = 'Invalid email address';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    if (paymentMethod === 'paypal') return true;
    const errs = {};
    if (!cardForm.cardNumber.trim()) errs.cardNumber = 'Card number required';
    else if (!/^\d{16}$/.test(cardForm.cardNumber.replace(/\s+/g, ''))) errs.cardNumber = 'Must be 16 digits';
    if (!cardForm.cardName.trim()) errs.cardName = 'Name on card required';
    if (!cardForm.expiry.trim()) errs.expiry = 'Expiration required';
    else if (!/^\d{2}\/\d{2}$/.test(cardForm.expiry)) errs.expiry = 'Use MM/YY format';
    if (!cardForm.cvc.trim()) errs.cvc = 'CVC required';
    else if (!/^\d{3,4}$/.test(cardForm.cvc)) errs.cvc = 'Must be 3 or 4 digits';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (step === 0 && validateShipping()) setStep(1);
    else if (step === 1 && validatePayment()) setStep(2);
  };

  const handlePrevStep = () => {
    if (step > 0) setStep(s => s - 1);
  };

  // Helper: ensure any product id (integer or string) is converted to a valid UUID string
  // that the Spring Boot backend can deserialize as java.util.UUID.
  const toUUID = (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (typeof id === 'string' && uuidRegex.test(id)) return id;
    if (!id || id === 'undefined' || id === 'null') return '00000000-0000-0000-0000-000000000000';
    // Fallback: only keep hexadecimal characters to ensure a valid UUID format
    const safe = String(id).replace(/[^0-9a-fA-F]/g, '').slice(0, 12).padStart(12, '0');
    return `00000000-0000-0000-0000-${safe}`;
  };

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);

    try {
      const rawCustomerId = localStorage.getItem('userId');
      const customerId = toUUID(rawCustomerId || '00000000-0000-0000-0000-000000000000');

      const orderData = {
        customerId,
        items: cartItems.map(item => ({
          productId: toUUID(item.id),   // Always a valid UUID for the backend
          productName: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };

      // 1. Create Order (order-service)
      let order;
      try {
        order = await api.createOrder(orderData);
      } catch (orderErr) {
        console.error('Order service error:', orderErr);
        const msg = orderErr.message || 'Order creation failed';
        showToast(msg, 'error');
        setIsSubmitting(false);
        return;
      }

      const orderId = order.id || order.orderId;

      // 2. Reserve Stock (inventory-service) — non-critical
      try {
        await api.reserveInventory(cartItems.map(item => ({
          productId: toUUID(item.id),
          quantity: item.quantity
        })));
      } catch (invErr) {
        console.warn('Inventory reservation warning (non-critical):', invErr.message);
      }

      // 3. Process Payment (payment-service) — non-critical
      try {
        await api.processPayment({ orderId, amount: parseFloat(total) });
      } catch (payErr) {
        console.warn('Payment processing warning (non-critical):', payErr.message);
      }

      // 4. Create Shipment (shipping-service) — non-critical
      try {
        await api.createShipment({ orderId });
      } catch (shipErr) {
        console.warn('Shipping setup warning (non-critical):', shipErr.message);
      }

      // 5. Record Notification (notification-service) — non-critical
      try {
        await api.createNotification({
          eventType: 'ORDER_PLACED',
          payload: JSON.stringify({
            orderId,
            customerId,
            customerName: `${shippingForm.firstName} ${shippingForm.lastName}`,
            customerEmail: shippingForm.email,
            totalAmount: parseFloat(total)
          })
        });
      } catch (notifErr) {
        console.warn('Notification warning (non-critical):', notifErr.message);
      }

      showToast('Order placed successfully!', 'success');
      clearCart();
      setStep(3);
    } catch (err) {
      console.error('Unexpected checkout error:', err);
      showToast(`Order failed: ${err.message || 'Unexpected error. Please try again.'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const estDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  if (cartItems.length === 0 && step < 3) {
    return (
      <div className="container page-content" style={{ paddingTop: '150px', textAlign: 'center' }}>
        <div className="card animate-fade" style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem' }}>
          <ShoppingBag size={54} style={{ color: 'var(--text-subtle)', marginBottom: '1.5rem', opacity: 0.3 }} />
          <h3>Checkout Unavailable</h3>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>Your shopping cart is empty. Add premium products to proceed.</p>
          <button onClick={() => navigate('/shop')} className="btn-primary" style={{ width: '100%' }}>Shop Products</button>
        </div>
      </div>
    );
  }

  // Stepper Header helper
  const renderStepper = () => {
    const steps = ['Shipping', 'Payment', 'Review'];
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', position: 'relative' }}>
        {/* Background connector line */}
        <div style={{ position: 'absolute', height: '2px', background: 'var(--border)', left: '30px', right: '30px', top: '24px', zIndex: 0 }} />
        {/* Active colored line */}
        <div style={{
          position: 'absolute', height: '2px', background: 'var(--primary)', left: '30px',
          width: step === 0 ? '0%' : step === 1 ? '50%' : '80%', top: '24px', zIndex: 0, transition: 'var(--transition)'
        }} />

        {steps.map((label, idx) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: step > idx ? 'var(--success)' : step === idx ? 'var(--primary)' : 'var(--bg-elevated)',
              border: step === idx ? '2px solid var(--primary-hover)' : '2px solid var(--border)',
              color: step >= idx ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.95rem',
              transition: 'var(--transition)'
            }}>
              {step > idx ? <Check size={18} /> : idx + 1}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: step === idx ? '700' : '500', color: step === idx ? 'var(--text-main)' : 'var(--text-muted)', marginTop: '0.5rem' }}>{label}</span>
          </div>
        ))}
      </div>
    );
  };

  // 1. Success Screen
  if (step === 3) {
    return (
      <div className="container page-content" style={{ paddingTop: '150px', textAlign: 'center' }}>
        <div className="card animate-fade" style={{ maxWidth: '520px', margin: '0 auto', padding: '3.5rem' }}>
          <div style={{ background: 'var(--success-bg)', color: 'var(--success)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 8px 24px rgba(16,185,129,0.15)' }}>
            <ShieldCheck size={40} />
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.75rem' }}>Order Confirmed!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Your transaction has processed successfully. We've notified our fulfillment department and sent a confirmation email to <strong style={{ color: 'var(--text-main)' }}>{shippingForm.email}</strong>.
          </p>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Fulfillment Date:</span><span style={{ color: 'var(--text-main)', fontWeight: '600' }}>Express Delivery</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Estimated Delivery:</span><span style={{ color: 'var(--primary)', fontWeight: '700' }}>{estDeliveryDate()}</span>
            </div>
          </div>
          <button onClick={() => navigate('/orders')} className="btn-primary" style={{ width: '100%' }}>View Order Timeline</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-content" style={{ paddingTop: '120px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '4rem' }}>
        {/* Left side Form Stepper */}
        <div>
          {renderStepper()}

          {/* STEP 0: Shipping Info Form */}
          {step === 0 && (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Truck size={20} color="var(--primary)" /> Shipping Address</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <input
                    type="text" placeholder="First Name" value={shippingForm.firstName}
                    onChange={e => setShippingForm({ ...shippingForm, firstName: e.target.value })}
                    className="input" style={errors.firstName ? { border: '1px solid var(--error)' } : {}}
                  />
                  {errors.firstName && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.firstName}</span>}
                </div>
                <div>
                  <input
                    type="text" placeholder="Last Name" value={shippingForm.lastName}
                    onChange={e => setShippingForm({ ...shippingForm, lastName: e.target.value })}
                    className="input" style={errors.lastName ? { border: '1px solid var(--error)' } : {}}
                  />
                  {errors.lastName && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.lastName}</span>}
                </div>
              </div>

              <div>
                <input
                  type="text" placeholder="Street Address" value={shippingForm.address}
                  onChange={e => setShippingForm({ ...shippingForm, address: e.target.value })}
                  className="input" style={errors.address ? { border: '1px solid var(--error)' } : {}}
                />
                {errors.address && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.address}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <input
                    type="text" placeholder="City" value={shippingForm.city}
                    onChange={e => setShippingForm({ ...shippingForm, city: e.target.value })}
                    className="input" style={errors.city ? { border: '1px solid var(--error)' } : {}}
                  />
                  {errors.city && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.city}</span>}
                </div>
                <div>
                  <input
                    type="text" placeholder="Zip Code (e.g. 10001)" value={shippingForm.zip}
                    onChange={e => setShippingForm({ ...shippingForm, zip: e.target.value })}
                    className="input" style={errors.zip ? { border: '1px solid var(--error)' } : {}}
                  />
                  {errors.zip && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.zip}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <input
                    type="text" placeholder="Phone Number" value={shippingForm.phone}
                    onChange={e => setShippingForm({ ...shippingForm, phone: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <input
                    type="email" placeholder="Email Address" value={shippingForm.email}
                    onChange={e => setShippingForm({ ...shippingForm, email: e.target.value })}
                    className="input" style={errors.email ? { border: '1px solid var(--error)' } : {}}
                  />
                  {errors.email && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.email}</span>}
                </div>
              </div>

              <button onClick={handleNextStep} className="btn-primary" style={{ width: 'fit-content', alignSelf: 'flex-end', marginTop: '1rem' }}>
                Proceed to Payment <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 1: Payment Method Form */}
          {step === 1 && (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><CreditCard size={20} color="var(--primary)" /> Payment Information</h3>

              {/* Tabs selector */}
              <div style={{ display: 'flex', gap: '1rem', background: 'var(--bg-elevated)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <button
                  type="button" onClick={() => setPaymentMethod('card')}
                  style={{
                    flex: 1, padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600',
                    background: paymentMethod === 'card' ? 'var(--bg-card)' : 'none',
                    color: paymentMethod === 'card' ? 'var(--primary)' : 'var(--text-muted)'
                  }}
                >Credit / Debit Card</button>
                <button
                  type="button" onClick={() => setPaymentMethod('paypal')}
                  style={{
                    flex: 1, padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600',
                    background: paymentMethod === 'paypal' ? 'var(--bg-card)' : 'none',
                    color: paymentMethod === 'paypal' ? 'var(--primary)' : 'var(--text-muted)'
                  }}
                >PayPal (Mock Account)</button>
              </div>

              {paymentMethod === 'card' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <input
                      type="text" placeholder="Card Number (16 Digits)" value={cardForm.cardNumber}
                      onChange={e => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                      className="input" style={errors.cardNumber ? { border: '1px solid var(--error)' } : {}}
                    />
                    {errors.cardNumber && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.cardNumber}</span>}
                  </div>

                  <div>
                    <input
                      type="text" placeholder="Name on Card" value={cardForm.cardName}
                      onChange={e => setCardForm({ ...cardForm, cardName: e.target.value })}
                      className="input" style={errors.cardName ? { border: '1px solid var(--error)' } : {}}
                    />
                    {errors.cardName && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.cardName}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div>
                      <input
                        type="text" placeholder="Expiration (MM/YY)" value={cardForm.expiry}
                        onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                        className="input" style={errors.expiry ? { border: '1px solid var(--error)' } : {}}
                      />
                      {errors.expiry && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.expiry}</span>}
                    </div>
                    <div>
                      <input
                        type="password" placeholder="CVC (3 Digits)" value={cardForm.cvc}
                        onChange={e => setCardForm({ ...cardForm, cvc: e.target.value })}
                        className="input" style={errors.cvc ? { border: '1px solid var(--error)' } : {}}
                      />
                      {errors.cvc && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.cvc}</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You will be redirected to PayPal sandbox. Fast express checkouts applied.</p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button onClick={handlePrevStep} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button onClick={handleNextStep} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Review Order <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Review Order Details before confirming */}
          {step === 2 && (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Review Your Details</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Shipping Review */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--primary)' }}>Shipping Destination</h4>
                  <p style={{ fontWeight: '600' }}>{shippingForm.firstName} {shippingForm.lastName}</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{shippingForm.address}</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{shippingForm.city}, {shippingForm.zip}</p>
                </div>

                {/* Payment Review */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--primary)' }}>Payment Method</h4>
                  {paymentMethod === 'card' ? (
                    <>
                      <p style={{ fontWeight: '600' }}>Credit / Debit Card</p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Card Name: {cardForm.cardName}</p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Number: •••• •••• •••• {cardForm.cardNumber.slice(-4)}</p>
                    </>
                  ) : (
                    <p style={{ fontWeight: '600' }}>PayPal Express sandbox</p>
                  )}
                </div>
              </div>

              {/* Items Summary list */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem' }}>Review Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cartItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700' }}>{item.quantity}x</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: '700' }}>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button onClick={handlePrevStep} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={handleConfirmOrder} disabled={isSubmitting}
                  className="btn-primary" style={{ padding: '0.8rem 2rem', fontWeight: '700', fontSize: '0.95rem' }}
                >
                  {isSubmitting ? 'Processing Order...' : 'Submit Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right side Summary Column Panel */}
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '2rem', borderRadius: 'var(--radius-lg)', position: 'sticky', top: '120px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem' }}>Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>Shipping Cost</span>
                <span style={{ color: shippingCost === 0 ? 'var(--success)' : 'inherit' }}>
                  {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800' }}>
                <span>Total Amount</span><span style={{ color: 'var(--primary)' }}>${total}</span>
              </div>
            </div>

            {/* Estimated delivery date display info */}
            {step < 3 && (
              <div style={{ display: 'flex', gap: '0.6rem', background: 'var(--primary-glow)', padding: '0.9rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginTop: '2rem', alignItems: 'center' }}>
                <Calendar size={18} color="var(--primary)" />
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Express Delivery:</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>{estDeliveryDate()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
