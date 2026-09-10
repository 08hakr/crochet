import { useEffect, useState } from 'react';
import { checkoutAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Account() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      fetchOrders();
    }
  }, [authLoading]);

  const fetchOrders = async () => {
    try {
      const response = await checkoutAPI.getMyOrders();
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      paid: 'badge-paid',
      shipped: 'badge-shipped',
      out_for_delivery: 'badge-out_for_delivery',
      delivered: 'badge-delivered',
      in_return: 'badge-in_return',
      cancelled: 'badge-cancelled'
    };
    return badges[status] || 'badge-pending';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="container" style={{padding: '60px 0', textAlign: 'center'}}>
        <div className="loading-spinner" style={{margin: '0 auto'}}></div>
      </div>
    );
  }

  return (
    <div>
      <header className="page-header">
        <div className="container">
          <h1 className="page-title">My Account</h1>
          <p className="page-subtitle">Manage your orders and profile</p>
        </div>
      </header>

      <section className="section">
        <div className="container" style={{maxWidth: '900px'}}>
          <div className="card" style={{padding: '32px', marginBottom: '32px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap'}}>
              <div style={{width: '80px', height: '80px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'var(--primary)'}}>
                👤
              </div>
              <div>
                <h2 style={{fontSize: '1.5rem', marginBottom: '4px'}}>{user?.email}</h2>
                <p style={{color: 'var(--text-light)'}}>Member since {user?.created_at ? formatDate(user.created_at) : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <h2 style={{fontSize: '1.2rem', fontWeight: 600}}>My Orders</h2>
              <span style={{color: 'var(--text-light)'}}>{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
            </div>

            {orders.length === 0 ? (
              <div className="empty-state" style={{padding: '60px 24px'}}>
                <div className="empty-state-icon">📦</div>
                <h3 className="empty-state-title">No orders yet</h3>
                <p className="empty-state-text">When you place an order, it will appear here.</p>
                <Link to="/shop" className="btn btn-primary mt-2">Start Shopping</Link>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td style={{fontFamily: 'monospace', fontSize: '0.9rem'}}>#{order.id.toString().padStart(6, '0')}</td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>
                          {order.items?.map(item => (
                            <div key={item.id} style={{fontSize: '0.9rem'}}>
                              {item.product?.name || 'Product'} × {item.quantity}
                            </div>
                          ))}
                        </td>
                        <td style={{fontWeight: 600, color: 'var(--primary)'}}>₹{order.total.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(order.status)}`}>
                            {order.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </span>
                        </td>
                        <td>
                          <Link to={`/order/${order.id}`} className="btn btn-sm btn-outline">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}