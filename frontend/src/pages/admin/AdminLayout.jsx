import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, logout, loading, isAdmin } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/dashboardnew', label: 'Dashboard New', icon: '🆕' },
    { path: '/admin/products', label: 'Products', icon: '🧶' },
    { path: '/admin/categories', label: 'Categories', icon: '📂' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleLogout = async () => {
    await logout();
  };

  // Show loading while auth is being verified
  if (loading) {
    return (
      <div style={{display: 'flex', minHeight: '100vh', background: 'var(--background)', justifyContent: 'center', alignItems: 'center'}}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Show error if not admin
  if (!isAdmin) {
    return (
      <div style={{display: 'flex', minHeight: '100vh', background: 'var(--background)', justifyContent: 'center', alignItems: 'center', padding: '24px'}}>
        <div className="card" style={{padding: '48px', textAlign: 'center', maxWidth: '400px'}}>
          <div style={{fontSize: '3rem', marginBottom: '16px'}}>🔒</div>
          <h2 style={{marginBottom: '12px'}}>Admin Access Required</h2>
          <p style={{color: 'var(--text-light)', marginBottom: '24px'}}>
            You need to be an administrator to access this page.
          </p>
          <a href="/admin-login" className="btn btn-primary">Login as Admin</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{display: 'flex', minHeight: '100vh', background: 'var(--background)'}}>
      <aside style={{
        width: '260px',
        background: 'var(--text)',
        color: 'var(--white)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        left: 0,
        top: 0
      }}>
        <div style={{padding: '24px', borderBottom: '1px solid #333', flexShrink: 0}}>
          <Link to="/admin" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.3rem',
            fontWeight: 600,
            color: 'var(--white)',
            textDecoration: 'none'
          }}>
            <span style={{fontSize: '1.5rem'}}>🧶</span>
            Admin Panel
          </Link>
        </div>

        <nav style={{flex: 1, padding: '16px 8px', overflowY: 'auto'}}>
          <ul style={{listStyle: 'none'}}>
            {navItems.map(item => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      color: isActive ? 'var(--white)' : '#ccc',
                      background: isActive ? 'var(--primary)' : 'transparent',
                      textDecoration: 'none',
                      fontWeight: isActive ? 600 : 400,
                      transition: 'var(--transition)',
                      marginBottom: '4px'
                    }}
                  >
                    <span style={{fontSize: '1.2rem'}}>{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{padding: '16px', borderTop: '1px solid #333', flexShrink: 0}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', marginBottom: '12px'}}>
            <div style={{width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'}}>👤</div>
            <div style={{flex: 1, minWidth: 0}}>
              <p style={{fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{user?.email}</p>
              <p style={{fontSize: '0.75rem', color: '#888'}}>Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            background: 'transparent',
            border: '1px solid #333',
            color: '#ccc',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'var(--transition)'
          }} onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--error)'; e.currentTarget.style.color = 'var(--error)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#ccc'; }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main style={{flex: 1, marginLeft: '260px', minHeight: '100vh', background: 'var(--background)'}}>
        <div style={{padding: '32px', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 64px)'}}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}