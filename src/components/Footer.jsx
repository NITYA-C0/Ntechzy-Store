import { Link } from 'react-router-dom';

function LogoIcon() {
  return (
    <svg className="logo-icon" width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M8 10h16l-1.2 14.5a2 2 0 0 1-2 1.8H11.2a2 2 0 0 1-2-1.8L8 10z"
        fill="#2563eb"
        stroke="#1d4ed8"
        strokeWidth="1.2"
      />
      <path d="M12 10V8a4 4 0 0 1 8 0v2" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="18" y="4" width="7" height="6" rx="1" fill="#f97316" opacity="0.95" />
      <rect x="20" y="2" width="7" height="6" rx="1" fill="#fb923c" />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo footer-logo">
              <LogoIcon />
              <span>Ntechzy Store</span>
            </Link>
            <p>
              Shop quality products at great prices. Fast browsing, simple checkout, and a smooth shopping
              experience.
            </p>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li>
                <Link to="/">All Products</Link>
              </li>
              <li>
                <Link to="/cart">My Cart</Link>
              </li>
              <li>
                <Link to="/checkout">Checkout</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <ul>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Create Account</Link>
              </li>
              <li>
                <Link to="/order-confirmation">Orders</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li>
                <a href="mailto:support@ntechzy.store">support@ntechzy.store</a>
              </li>
              <li>
                <span className="footer-muted">Mon–Fri, 9am–6pm</span>
              </li>
              <li>
                <span className="footer-muted">Demo store — no real payments</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} Ntechzy Store. All rights reserved.</p>
          <div className="footer-bottom-links">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
