import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_products: 0,
    total_categories: 0,
    total_orders: 0,
    pending_orders: 0,
    paid_orders: 0,
    total_revenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await adminAPI.dashboard();
      setStats(res.data.stats);
      setRecentOrders(res.data.recent_orders || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return 'Rs. ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const parseShippingAddress = (addr) => {
    if (!addr) return null;
    try {
      return typeof addr === 'string' ? JSON.parse(addr) : addr;
    } catch {
      return null;
    }
  };

  const getCustomerName = (order) => {
    const addr = parseShippingAddress(order.shipping_address);
    if (addr?.fullName) return addr.fullName;
    if (addr?.email) return addr.email;
    return `User #${order.user_id}`;
  };

  const getCustomerPhone = (order) => {
    const addr = parseShippingAddress(order.shipping_address);
    return addr?.phone || null;
  };

  const getOrderProductName = (order) => {
    if (!order.items || order.items.length === 0) return 'No items';
    const names = order.items.map(i => i.product?.name || `Product #${i.product_id}`);
    const unique = [...new Set(names)];
    if (unique.length === 1) return unique[0];
    return `${unique[0]} +${unique.length - 1} more`;
  };

  const statusConfig = {
    pending: { color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
    paid: { color: '#10b981', bg: '#d1fae5', label: 'Paid' },
    shipped: { color: '#3b82f6', bg: '#dbeafe', label: 'Shipped' },
    out_for_delivery: { color: '#8b5cf6', bg: '#ede9fe', label: 'Out for Delivery' },
    delivered: { color: '#059669', bg: '#d1fae5', label: 'Delivered' },
    in_return: { color: '#f97316', bg: '#ffedd5', label: 'In Return' },
    cancelled: { color: '#ef4444', bg: '#fee2e2', label: 'Cancelled' }
  };

  const getStatusStyle = (status) => {
    const cfg = statusConfig[status] || statusConfig.pending;
    return {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 600,
      color: cfg.color,
      backgroundColor: cfg.bg,
      textTransform: 'capitalize'
    };
  };

  const statCards = [
    { label: 'Total Products', value: stats.total_products, icon: '📦', color: 'var(--primary)' },
    { label: 'Categories', value: stats.total_categories, icon: '📂', color: '#8b5cf6' },
    { label: 'Total Orders', value: stats.total_orders, icon: '🛒', color: '#3b82f6' },
    { label: 'Revenue', value: formatCurrency(stats.total_revenue), icon: '💰', color: '#10b981' }
  ];

  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 20px'}}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{padding: '60px 40px', textAlign: 'center', maxWidth: '500px', margin: '40px auto'}}>
        <div style={{fontSize: '3rem', marginBottom: '16px'}}>⚠️</div>
        <h2 style={{marginBottom: '12px', fontSize: '1.4rem'}}>Failed to Load Dashboard</h2>
        <p style={{color: 'var(--text-light)', marginBottom: '24px'}}>{error}</p>
        <button onClick={fetchData} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{marginBottom: '32px'}}>
        <h1 style={{fontSize: '2rem', marginBottom: '4px'}}>Dashboard</h1>
        <p style={{color: 'var(--text-light)'}}>Overview of your crochet business</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px'}}>
        {statCards.map((card) => (
          <div key={card.label} className="card" style={{padding: '24px'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px'}}>
              <span style={{fontSize: '0.9rem', color: 'var(--text-light)'}}>{card.label}</span>
              <span style={{fontSize: '1.5rem'}}>{card.icon}</span>
            </div>
            <div style={{fontSize: '1.8rem', fontWeight: 700, color: card.color, fontFamily: "'Playfair Display', serif"}}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px'}}>
        <div className="card">
          <div style={{padding: '20px 24px', borderBottom: '1px solid var(--border)'}}>
            <h2 style={{fontSize: '1.1rem', fontWeight: 600}}>Order Status</h2>
          </div>
          <div style={{padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px'}}>
            {[
              { label: 'Pending', value: stats.pending_orders, color: '#f59e0b' },
              { label: 'Paid', value: stats.paid_orders, color: '#10b981' },
              { label: 'Shipped', value: Math.max(0, stats.total_orders - stats.pending_orders - stats.paid_orders), color: '#3b82f6' }
            ].map((item) => (
              <div key={item.label} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <div style={{width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color}}></div>
                  <span>{item.label}</span>
                </div>
                <span style={{fontWeight: 600, fontSize: '1.1rem'}}>{item.value}</span>
              </div>
            ))}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--border)', fontWeight: 600}}>
              <span>Total</span>
              <span style={{fontSize: '1.1rem'}}>{stats.total_orders}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{padding: '20px 24px', borderBottom: '1px solid var(--border)'}}>
            <h2 style={{fontSize: '1.1rem', fontWeight: 600}}>Quick Actions</h2>
          </div>
          <div style={{padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
            <Link to="/admin/products" style={{textDecoration: 'none'}}>
              <div className="card" style={{padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)'}}>
                <div style={{fontSize: '1.5rem', marginBottom: '8px'}}>➕</div>
                <div style={{fontSize: '0.85rem', fontWeight: 500}}>Add Product</div>
              </div>
            </Link>
            <Link to="/admin/categories" style={{textDecoration: 'none'}}>
              <div className="card" style={{padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)'}}>
                <div style={{fontSize: '1.5rem', marginBottom: '8px'}}>📂</div>
                <div style={{fontSize: '0.85rem', fontWeight: 500}}>Categories</div>
              </div>
            </Link>
            <Link to="/admin/settings" style={{textDecoration: 'none'}}>
              <div className="card" style={{padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)'}}>
                <div style={{fontSize: '1.5rem', marginBottom: '8px'}}>⚙️</div>
                <div style={{fontSize: '0.85rem', fontWeight: 500}}>Settings</div>
              </div>
            </Link>
            <a href="/shop" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>
              <div className="card" style={{padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)'}}>
                <div style={{fontSize: '1.5rem', marginBottom: '8px'}}>👁️</div>
                <div style={{fontSize: '0.85rem', fontWeight: 500}}>View Store</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <h2 style={{fontSize: '1.1rem', fontWeight: 600}}>Recent Orders</h2>
          <span style={{fontSize: '0.85rem', color: 'var(--text-light)'}}>{recentOrders.length} order{recentOrders.length !== 1 ? 's' : ''}</span>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{padding: '60px 40px', textAlign: 'center'}}>
            <div style={{fontSize: '3rem', marginBottom: '12px', opacity: 0.5}}>📦</div>
            <h3 style={{marginBottom: '8px', color: 'var(--text-light)'}}>No orders yet</h3>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Orders will appear here as customers make purchases.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} style={{cursor: 'pointer'}} onClick={() => window.location.href = `/admin/orders/${order.id}`}>
                    <td>
                      <Link to={`/admin/orders/${order.id}`} style={{fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500}}>
                        #{order.id.toString().padStart(4, '0')}
                      </Link>
                    </td>
                    <td>
                      <div>
                        <div style={{fontWeight: 500, fontSize: '0.9rem'}}>{getCustomerName(order)}</div>
                        {getCustomerPhone(order) && (
                          <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{getCustomerPhone(order)}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{fontSize: '0.9rem'}}>{getOrderProductName(order)}</div>
                      {order.items?.length > 1 && (
                        <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{order.items.length} items</div>
                      )}
                    </td>
                    <td style={{fontSize: '0.85rem', color: 'var(--text-light)'}}>{formatDate(order.created_at)}</td>
                    <td style={{fontWeight: 600, color: 'var(--primary)'}}>{formatCurrency(order.total)}</td>
                    <td><span style={getStatusStyle(order.status)}>{statusConfig[order.status]?.label || order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
