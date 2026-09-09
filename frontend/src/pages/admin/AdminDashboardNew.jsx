import { useEffect, useState } from 'react';
import { adminAPI, checkoutAPI } from '../../api/client';

export default function AdminDashboardNew() {
  const [stats, setStats] = useState({
    total_products: 1,
    total_categories: 0,
    total_orders: 4,
    pending_orders: 2,
    paid_orders: 2,
    shipped_orders: 0,
    cancelled_orders: 0,
    total_revenue: 599.98
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashboardRes, ordersRes] = await Promise.all([
        adminAPI.dashboard(),
        checkoutAPI.adminGetOrders({ limit: 10 })
      ]);
      console.log('Dashboard response:', dashboardRes.data);
      console.log('Orders response:', ordersRes.data);
      
      const statsData = dashboardRes.data.stats || {};
      const total = statsData.total_orders || 0;
      const pending = statsData.pending_orders || 0;
      const paid = statsData.paid_orders || 0;
      const shipped = Math.max(0, total - pending - paid);
      
      setStats({
        ...statsData,
        shipped_orders: shipped,
        cancelled_orders: 0
      });
      setRecentOrders(ordersRes.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  const formatCurrency = (amount) => 'Rs. ' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'short', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      paid: 'badge-paid',
      shipped: 'badge-shipped',
      cancelled: 'badge-cancelled'
    };
    return badges[status] || 'badge-pending';
  };

  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px'}}>
        <div>
          <h1 style={{fontSize: '2rem', marginBottom: '4px'}}>Dashboard</h1>
          <p style={{color: 'var(--text-light)'}}>Overview of your crochet business</p>
        </div>
        <button onClick={fetchData} className="btn btn-outline" style={{padding: '10px 20px'}}>
          Refresh
        </button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px'}}>
        <StatCard label="Total Products" value={stats.total_products || 0} color="var(--primary)" />
        <StatCard label="Categories" value={stats.total_categories || 0} color="var(--primary)" />
        <StatCard label="Total Orders" value={stats.total_orders || 0} color="var(--primary)" />
        <StatCard label="Total Revenue" value={formatCurrency(stats.total_revenue || 0)} color="var(--primary)" />
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px'}}>
        <StatCard label="Pending" value={stats.pending_orders || 0} color="var(--warning)" bg="#fff3e0" />
        <StatCard label="Paid" value={stats.paid_orders || 0} color="var(--success)" bg="#e8f5e9" />
        <StatCard label="Shipped" value={stats.shipped_orders || 0} color="#1565c0" bg="#e3f2fd" />
        <StatCard label="Cancelled" value={stats.cancelled_orders || 0} color="var(--error)" bg="#fdeaea" />
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
        <div className="card">
          <div style={{padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <h2 style={{fontSize: '1.2rem', fontWeight: 600}}>Quick Actions</h2>
          </div>
          <div style={{padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
            <ActionBtn label="Add Product" icon="+" href="/admin/products" variant="primary" />
            <ActionBtn label="Manage Categories" icon="📂" href="/admin/categories" variant="outline" />
            <ActionBtn label="Site Settings" icon="⚙️" href="/admin/settings" variant="outline" />
            <ActionBtn label="View Storefront" icon="👁️" href="/shop" variant="ghost" target="_blank" />
          </div>
        </div>

        <div className="card">
          <div style={{padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <h2 style={{fontSize: '1.2rem', fontWeight: 600}}>Order Status Overview</h2>
          </div>
          <div style={{padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <StatusRow label="Pending Orders" value={stats.pending_orders || 0} color="var(--warning)" bg="#fff3e0" />
            <StatusRow label="Paid Orders" value={stats.paid_orders || 0} color="var(--success)" bg="#e8f5e9" />
            <StatusRow label="Shipped Orders" value={stats.shipped_orders || 0} color="#1565c0" bg="#e3f2fd" />
            <StatusRow label="Cancelled Orders" value={stats.cancelled_orders || 0} color="var(--error)" bg="#fdeaea" />
            <StatusRow label="Total Revenue" value={formatCurrency(stats.total_revenue || 0)} color="var(--primary)" bg="#e3f2fd" />
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop: '24px'}}>
        <div style={{padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <h2 style={{fontSize: '1.2rem', fontWeight: 600}}>Recent Orders</h2>
          <a href="/admin" style={{fontSize: '0.9rem', color: 'var(--primary)'}}>View All</a>
        </div>
        
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
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{textAlign: 'center', padding: '40px', color: 'var(--text-light)'}}>
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{fontFamily: 'monospace', fontSize: '0.9rem'}}>#{order.id.toString().padStart(6, '0')}</td>
                    <td>{'User #' + order.user_id}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>{(order.items?.length || 0) + ' item' + (order.items?.length !== 1 ? 's' : '')}</td>
                    <td style={{fontWeight: 600, color: 'var(--primary)'}}>{formatCurrency(order.total)}</td>
                    <td><span className={'badge ' + getStatusBadge(order.status)}>{order.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <div className="card" style={{padding: '24px', textAlign: 'center', borderLeft: '4px solid ' + color, background: bg || 'transparent'}}>
      <div style={{fontSize: '2.5rem', fontWeight: 700, color: color, fontFamily: 'Playfair Display, serif'}}>
        {value}
      </div>
      <div style={{color: 'var(--text-light)', marginTop: '8px'}}>{label}</div>
    </div>
  );
}

function ActionBtn({ label, icon, href, variant, target }) {
  const styles = {
    primary: 'btn btn-primary',
    outline: 'btn btn-outline',
    ghost: 'btn btn-ghost'
  };
  return (
    <a href={href} target={target} style={{textDecoration: 'none'}}>
      <button className={styles[variant] || 'btn btn-primary'} style={{width: '100%', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
        <span style={{fontSize: '1.5rem'}}>{icon}</span>
        <span>{label}</span>
      </button>
    </a>
  );
}

function StatusRow({ label, value, color, bg }) {
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: bg, borderRadius: 'var(--radius-sm)'}}>
      <span style={{fontWeight: 500}}>{label}</span>
      <span style={{fontWeight: 700, color: color, fontSize: '1.2rem'}}>{value}</span>
    </div>
  );
}

function formatCurrency(amount) {
  return 'Rs. ' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'short', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getStatusBadge(status) {
  const badges = {
    pending: 'badge-pending',
    paid: 'badge-paid',
    shipped: 'badge-shipped',
    cancelled: 'badge-cancelled'
  };
  return badges[status] || 'badge-pending';
}