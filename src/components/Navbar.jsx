import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function LogoIcon() {
  return (
    <svg className="logo-icon" width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
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

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          <LogoIcon />
          <span>Ntechzy Store</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>

          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'nav-link cart-link active' : 'nav-link cart-link')}>
            <span className="cart-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </span>
            Cart
          </NavLink>

          {isAuthenticated ? (
            <>
              <span className="nav-greeting">Hi, {user.name}!</span>
              <button type="button" className="nav-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                Login
              </NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
