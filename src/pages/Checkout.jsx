import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice, truncate } from '../utils/helpers';

const emptyShipping = {
  fullName: '',
  email: '',
  street: '',
  city: '',
  zip: '',
  country: '',
};

const emptyPayment = {
  nameOnCard: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
};

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const { items, totalPrice, placeOrder } = useCart();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState(emptyShipping);
  const [payment, setPayment] = useState(emptyPayment);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' }, replace: true });
      return;
    }
    if (items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [isAuthenticated, items.length, navigate]);

  useEffect(() => {
    if (user) {
      setShipping((s) => ({
        ...s,
        fullName: s.fullName || user.name || '',
        email: s.email || user.email || '',
      }));
      setPayment((p) => ({
        ...p,
        nameOnCard: p.nameOnCard || user.name || '',
      }));
    }
  }, [user]);

  const updateShipping = (e) => {
    const { name, value } = e.target;
    setShipping((s) => ({ ...s, [name]: value }));
  };

  const updatePayment = (e) => {
    let { name, value } = e.target;
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    if (name === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    if (name === 'cvv') value = value.replace(/\D/g, '').slice(0, 4);
    setPayment((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const next = {};
    if (!shipping.fullName.trim()) next.fullName = 'Required';
    if (!shipping.email.trim() || !/\S+@\S+\.\S+/.test(shipping.email)) next.email = 'Valid email required';
    if (!shipping.street.trim()) next.street = 'Required';
    if (!shipping.city.trim()) next.city = 'Required';
    if (!shipping.zip.trim()) next.zip = 'Required';
    if (!shipping.country.trim()) next.country = 'Required';
    if (!payment.nameOnCard.trim()) next.nameOnCard = 'Required';
    if (payment.cardNumber.replace(/\s/g, '').length < 16) next.cardNumber = 'Enter 16-digit card number';
    if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) next.expiry = 'Use MM/YY';
    if (payment.cvv.length < 3) next.cvv = 'Invalid CVV';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await placeOrder({
        shipping,
        payment: {
          nameOnCard: payment.nameOnCard,
          cardNumber: payment.cardNumber.replace(/\s/g, ''),
          expiry: payment.expiry,
          cvv: payment.cvv,
        },
      });
      navigate('/order-confirmation');
    } catch (err) {
      setErrors({ form: err.message || 'Failed to place order.' });
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || items.length === 0) return null;

  return (
    <div className="page checkout-page">
      <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
        <div className="checkout-forms">
          {errors.form && <div className="alert alert-error">{errors.form}</div>}
          <section className="card checkout-section">
            <h2 className="section-heading">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              Shipping Information
            </h2>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input id="fullName" name="fullName" value={shipping.fullName} onChange={updateShipping} />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input id="email" name="email" type="email" value={shipping.email} onChange={updateShipping} />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="street">Street Address</label>
              <input id="street" name="street" value={shipping.street} onChange={updateShipping} />
              {errors.street && <span className="field-error">{errors.street}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input id="city" name="city" value={shipping.city} onChange={updateShipping} />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="zip">ZIP / Postal Code</label>
                <input id="zip" name="zip" value={shipping.zip} onChange={updateShipping} />
                {errors.zip && <span className="field-error">{errors.zip}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input id="country" name="country" value={shipping.country} onChange={updateShipping} />
              {errors.country && <span className="field-error">{errors.country}</span>}
            </div>
          </section>

          <section className="card checkout-section">
            <h2 className="section-heading">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Payment Details
            </h2>
            <p className="demo-note">This is a demo — no real payment is processed.</p>

            <div className="form-group">
              <label htmlFor="nameOnCard">Name on Card</label>
              <input id="nameOnCard" name="nameOnCard" value={payment.nameOnCard} onChange={updatePayment} />
              {errors.nameOnCard && <span className="field-error">{errors.nameOnCard}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <input
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={payment.cardNumber}
                onChange={updatePayment}
              />
              {errors.cardNumber && <span className="field-error">{errors.cardNumber}</span>}
            </div>

            <div className="form-row form-row-expiry">
              <div className="form-group">
                <label htmlFor="expiry">Expiry (MM/YY)</label>
                <input id="expiry" name="expiry" placeholder="MM/YY" value={payment.expiry} onChange={updatePayment} />
                {errors.expiry && <span className="field-error">{errors.expiry}</span>}
              </div>
              <div className="form-group form-group-cvv">
                <label htmlFor="cvv">CVV</label>
                <input id="cvv" name="cvv" placeholder="123" value={payment.cvv} onChange={updatePayment} />
                {errors.cvv && <span className="field-error">{errors.cvv}</span>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Placing Order...' : `Place Order — ${formatPrice(totalPrice)}`}
            </button>
          </section>
        </div>

        <aside className="order-summary card sticky-summary">
          <h2>Order Summary</h2>
          <ul className="summary-items">
            {items.map((item) => (
              <li key={item.id} className="summary-item">
                <img src={item.image} alt="" />
                <span className="summary-item-title">
                  {truncate(item.title, 32)} × {item.quantity}
                </span>
                <span className="summary-item-price">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-total">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <Link to="/cart" className="continue-link">
            ← Back to Cart
          </Link>
        </aside>
      </form>
    </div>
  );
}
