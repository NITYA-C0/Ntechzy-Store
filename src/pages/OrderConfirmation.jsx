import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../utils/api';
import { formatPrice } from '../utils/helpers';

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
        <p className="auth-subtitle">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page confirmation-page">
      <div className="card confirmation-card">
        <h1>Order Placed!</h1>
        <p className="confirmation-intro">
          Thank you for shopping with Ntechzy Store. Your order has been received.
        </p>

        <div className="confirmation-details">
          <div className="detail-row">
            <span className="detail-label">Order ID</span>
            <span className="detail-value order-id">{order.orderId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Amount Charged</span>
            <span className="detail-value detail-bold">{formatPrice(order.amount)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Confirmation sent to</span>
            <span className="detail-value detail-bold">{order.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Estimated Delivery</span>
            <span className="detail-value detail-bold">3–5 business days</span>
          </div>
        </div>

        <p className="email-note">
          🎉 A confirmation email has been sent (this is a demo — no real email is sent).
        </p>

        <Link to="/" className="btn btn-primary btn-block">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
