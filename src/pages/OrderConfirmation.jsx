import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../utils/api';
import { formatPrice } from '../utils/helpers';

function formatOrderDate(value) {
  if (!value) return 'Just now';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function OrderConfirmation() {
  const { isAuthenticated } = useAuth();
  const { lastOrder, setLastOrder } = useCart();
  const [order, setOrder] = useState(lastOrder);
  const [loading, setLoading] = useState(!lastOrder);

  useEffect(() => {
    if (lastOrder) {
      setOrder(lastOrder);
      setLoading(false);
      return;
    }
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/orders/latest');
        if (!cancelled) {
          setOrder(data);
          setLastOrder(data);
        }
      } catch {
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lastOrder, isAuthenticated, setLastOrder]);

  if (loading) {
    return (
      <div className="page confirmation-page">
        <div className="confirmation-loading" role="status">
          <span className="confirmation-spinner" />
          <p>Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page confirmation-page">
        <div className="card confirmation-empty">
          <div className="confirmation-empty-icon">!</div>
          <h1>No order found</h1>
          <p>We could not find a recent order for this account.</p>
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page confirmation-page">
      <div className="card confirmation-card">
        <header className="confirmation-hero">
          <div className="success-check" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>
          <span className="success-badge">Payment successful</span>
          <h1>Your order is confirmed!</h1>
          <p>
            Thank you for shopping with Ntechzy Store. We are getting your order ready.
          </p>
        </header>

        <section className="confirmation-overview" aria-label="Order overview">
          <div>
            <span>Order number</span>
            <strong className="order-id">#{order.orderId}</strong>
          </div>
          <div>
            <span>Order date</span>
            <strong>{formatOrderDate(order.createdAt)}</strong>
          </div>
          <div>
            <span>Order total</span>
            <strong>{formatPrice(order.amount)}</strong>
          </div>
        </section>

        <section className="delivery-progress" aria-label="Delivery progress">
          <div className="progress-step complete">
            <span className="progress-dot">
              <svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>
            </span>
            <strong>Order placed</strong>
          </div>
          <span className="progress-line" />
          <div className="progress-step">
            <span className="progress-dot">2</span>
            <strong>Processing</strong>
          </div>
          <span className="progress-line" />
          <div className="progress-step">
            <span className="progress-dot">3</span>
            <strong>Delivered</strong>
          </div>
        </section>

        <div className="confirmation-content">
          <section className="confirmation-section">
            <div className="confirmation-section-heading">
              <h2>Order summary</h2>
              <span>{order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'}</span>
            </div>
            <div className="confirmed-items">
              {order.items?.map((item) => (
                <div className="confirmed-item" key={item.id}>
                  <img src={item.image} alt={item.title} />
                  <div>
                    <strong>{item.title}</strong>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="confirmed-total">
              <span>Total paid</span>
              <strong>{formatPrice(order.amount)}</strong>
            </div>
          </section>

          <section className="confirmation-section delivery-card">
            <div className="delivery-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" />
                <circle cx="7" cy="19" r="2" />
                <circle cx="18" cy="19" r="2" />
              </svg>
            </div>
            <div>
              <span className="section-eyebrow">Estimated delivery</span>
              <h2>Within 3–5 business days</h2>
              {order.shipping && (
                <address>
                  <strong>{order.shipping.fullName}</strong>
                  <span>{order.shipping.street}</span>
                  <span>
                    {order.shipping.city}, {order.shipping.zip}
                  </span>
                  <span>{order.shipping.country}</span>
                </address>
              )}
            </div>
          </section>
        </div>

        <div className="confirmation-notice">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 4h16v16H4zM4 6l8 7 8-7" />
          </svg>
          <p>
            Order confirmation details are available for <strong>{order.email}</strong>.
          </p>
        </div>

        <div className="confirmation-actions">
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
          <Link to="/cart" className="btn confirmation-secondary-btn">
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}