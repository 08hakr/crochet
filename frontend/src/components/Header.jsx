import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const headerStyles = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(8px)',
  borderBottom: '1px solid var(--border)'
};

const navStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '72px',
  gap: '24px'
};

const logoStyles = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '1.5rem',
  fontWeight: 600,
  color: 'var(--primary)',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const navLinksStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '32px',
  flex: 1,
  justifyContent: 'center'
};

const linkStyles = (isActive) => ({
  fontWeight: 500,
  color: isActive ? 'var(--primary)' : 'var(--text)',
  padding: '8px 0',
  position: 'relative',
  textDecoration: 'none'
});

const activeIndicatorStyles = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '2px',
  background: 'var(--primary)',
  borderRadius: '2px 2px 0 0'
};

const navActionsStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
};

const cartLinkStyles = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  color: 'var(--text)',
  transition: 'var(--transition)',
  textDecoration: 'none'
};

const cartBadgeStyles = {
  position: 'absolute',
  top: '2px',
  right: '2px',
  minWidth: '18px',
  height: '18px',
  borderRadius: '9px',
  background: 'var(--error)',
  color: 'white',
  fontSize: '0.7rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 5px'
};

const authActionsStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const iconStyles = { fontSize: '1.8rem' };

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="header" style={headerStyles}>
      <nav className="container" style={navStyles}>
        <Link to="/" className="logo" style={logoStyles}>
          <span style={iconStyles}>🧶</span>
          Crochet Creations
        </Link>

        <div className="nav-links" style={navLinksStyles}>
          <Link to="/shop" className={isActive('/shop') ? 'active' : ''} style={linkStyles(isActive('/shop'))}>
            Shop
            {isActive('/shop') && <span style={activeIndicatorStyles} />}
          </Link>
          <Link to="/about" className={isActive('/about') ? 'active' : ''} style={linkStyles(isActive('/about'))}>
            About
            {isActive('/about') && <span style={activeIndicatorStyles} />}
          </Link>
          <Link to="/contact" className={isActive('/contact') ? 'active' : ''} style={linkStyles(isActive('/contact'))}>
            Contact
            {isActive('/contact') && <span style={activeIndicatorStyles} />}
          </Link>
        </div>

        <div className="nav-actions" style={navActionsStyles}>
          <Link to="/cart" className="cart-link" style={cartLinkStyles}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {count > 0 && (
              <span style={cartBadgeStyles}>
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div style={authActionsStyles}>
              {isAdmin && (
                <Link to="/admin" className="btn btn-sm btn-outline" style={{padding: '8px 16px'}}>
                  Admin Dashboard
                </Link>
              )}
              <Link to="/account" className="btn btn-sm btn-ghost" style={{padding: '8px 16px'}}>
                {user?.email}
              </Link>
              <button onClick={handleLogout} className="btn btn-sm btn-ghost" style={{padding: '8px 16px'}}>
                Logout
              </button>
            </div>
          ) : (
            <div style={authActionsStyles}>
              <Link to="/login" className="btn btn-sm btn-ghost" style={{padding: '8px 16px'}}>
                Login
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary" style={{padding: '8px 16px'}}>
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}