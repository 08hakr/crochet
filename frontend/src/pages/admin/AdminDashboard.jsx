import { useEffect, useState } from 'react';
import { adminAPI, checkoutAPI } from '../../api/client';

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
      const [dashboardRes, ordersRes] = await Promise.all([
        adminAPI.dashboard(),
        checkoutAPI.adminGetOrders({ limit: 5 })
      ]);
      setStats(dashboardRes.data.stats);
      setRecentOrders(ordersRes.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      paid: 'badge-paid',
      shipped: 'badge-shipped',
      cancelled: 'badge-cancelled'
    };
    return badges[status] || 'badge-pending';
  };

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'short', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', padding: '60px'}}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{padding: '48px', textAlign: 'center'}}>
        <div style={{fontSize: '3rem', marginBottom: '16px'}}>⚠️</div>
        <h2 style={{marginBottom: '12px'}}>Failed to Load Dashboard</h2>
        <p style={{color: 'var(--text-light)', marginBottom: '24px'}}>{error}</p>
        <button onClick={fetchData} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px'}}>
        <div>
          <h1 style={{fontSize: '2rem', marginBottom: '4px'}}>Dashboard</h1>
          <p style={{color: 'var(--text-light)'}}>Overview of your crochet business</p>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px'}}>
        <div className="card" style={{padding: '24px', textAlign: 'center'}}>
          <div style={{fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', fontFamily: "'Playfair Display', serif"}}>
            {stats.total_products}
          </div>
          <div style={{color: 'var(--text-light)', marginTop: '8px'}}>Total Products</div>
        </div>
        <div className="card" style={{padding: '24px', textAlign: 'center'}}>
          <div style={{fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', fontFamily: "'Playfair Display', serif"}}>
            {stats.total_categories}
          </div>
          <div style={{color: 'var(--text-light)', marginTop: '8px'}}>Categories</div>
        </div>
        <div className="card" style={{padding: '24px', textAlign: 'center'}}>
          <div style={{fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', fontFamily: "'Playfair Display', serif"}}>
            {stats.total_orders}
          </div>
          <div style={{color: 'var(--text-light)', marginTop: '8px'}}>Total Orders</div>
        </div>
        <div className="card" style={{padding: '24px', textAlign: 'center'}}>
          <div style={{fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', fontFamily: "'Playfair Display', serif"}}>
            {formatCurrency(stats.total_revenue)}
          </div>
          <div style={{color: 'var(--text-light)', marginTop: '8px'}}>Total Revenue</div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
        <div className="card">
          <div style={{padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <h2 style={{fontSize: '1.2rem', fontWeight: 600}}>Order Status</h2>
          </div>
          <div style={{padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <span>Pending</span>
              <span style={{fontWeight: 600, color: 'var(--warning)'}}>{stats.pending_orders}</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <span>Paid</span>
              <span style={{fontWeight: 600, color: 'var(--success)'}}>{stats.paid_orders}</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <span>Shipped</span>
              <span style={{fontWeight: 600, color: '#1565c0'}}>{stats.total_orders - stats.pending_orders - stats.paid_orders}</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border)', fontWeight: 600, fontSize: '1.1rem'}}>
              <span>Total Orders</span>
              <span>{stats.total_orders}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <h2 style={{fontSize: '1.2rem', fontWeight: 600}}>Quick Actions</h2>
          </div>
          <div style={{padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
            <a href="/admin/products" style={{textDecoration: 'none'}}>
              <button className="btn btn-primary" style={{width: '100%', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                <span style={{fontSize: '1.5rem'}}>➕</span>
                <span>Add Product</span>
              </button>
            </a>
            <a href="/admin/categories" style={{textDecoration: 'none'}}>
              <button className="btn btn-outline" style={{width: '100%', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                <span style={{fontSize: '1.5rem'}}>📂</span>
                <span>Manage Categories</span>
              </button>
            </a>
            <a href="/admin/settings" style={{textDecoration: 'none'}}>
              <button className="btn btn-outline" style={{width: '100%', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                <span style={{fontSize: '1.5rem'}}>⚙️</span>
                <span>Site Settings</span>
              </button>
            </a>
            <a href="/shop" target="_blank" style={{textDecoration: 'none'}}>
              <button className="btn btn-ghost" style={{width: '100%', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                <span style={{fontSize: '1.5rem'}}>👁️</span>
                <span>View Storefront</span>
              </button>
            </a>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop: '24px'}}>
        <div style={{padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <h2 style={{fontSize: '1.2rem', fontWeight: 600}}>Recent Orders</h2>
          <a href="/admin" style={{fontSize: '0.9rem', color: 'var(--primary)'}}>View All</a>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="empty-state" style={{padding: '40px'}}>
            <div className="empty-state-icon">📦</div>
            <h3 className="empty-state-title">No orders yet</h3>
            <p className="empty-state-text">Orders will appear here as customers make purchases.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{fontFamily: 'monospace', fontSize: '0.9rem'}}>#{order.id.toString().padStart(6, '0')}</td>
                    <td>`User #${order.user_id}`</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</td>
                    <td style={{fontWeight: 600, color: 'var(--primary)'}}>{formatCurrency(order.total)}</td>
                    <td><span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span></td>
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