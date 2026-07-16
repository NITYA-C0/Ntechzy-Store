import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { capitalizeWords, formatPrice, truncate } from '../utils/helpers';

export default function Cart() {
  const { items, loading, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="page empty-cart-page">
        <p className="auth-subtitle">Loading cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page empty-cart-page">
        <div className="empty-cart">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven&apos;t added anything yet.</p>
          <Link to="/" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.title} className="cart-item-img" />
              <div className="cart-item-info">
                <h3>{truncate(item.title, 50)}</h3>
                <p className="cart-item-cat">{capitalizeWords(item.category)}</p>
                <p className="cart-item-unit">Unit price: {formatPrice(item.price)}</p>
                <div className="qty-controls">
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity">
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">
                    +
                  </button>
                </div>
              </div>
              <div className="cart-item-actions">
                <span className="cart-item-total">{formatPrice(item.price * item.quantity)}</span>
                <button type="button" className="remove-btn" onClick={() => removeFromCart(item.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="clear-cart-row">
            <button type="button" className="btn btn-outline" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </div>

        <aside className="order-summary card">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Items ({totalItems})</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span className="text-success">FREE</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <button type="button" className="btn btn-primary btn-block" onClick={handleCheckout}>
            Proceed to Checkout →
          </button>
          <Link to="/" className="continue-link">
            ← Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
