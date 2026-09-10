import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { checkoutAPI } from '../../api/client';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#f59e0b', icon: '⏳' },
  { value: 'paid', label: 'Paid', color: '#10b981', icon: '✅' },
  { value: 'shipped', label: 'Shipped', color: '#3b82f6', icon: '📦' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: '#8b5cf6', icon: '🚚' },
  { value: 'delivered', label: 'Delivered', color: '#059669', icon: '🎉' },
  { value: 'in_return', label: 'In Return', color: '#f97316', icon: '🔄' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444', icon: '❌' }
];

const STATUS_FLOW = ['pending', 'paid', 'shipped', 'out_for_delivery', 'delivered'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await checkoutAPI.adminGetOrders();
      const found = (res.data.orders || []).find(o => String(o.id) === String(id));
      if (found) {
        setOrder(found);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!order || updating) return;
    setUpdating(true);
    setSuccessMsg('');
    try {
      const res = await checkoutAPI.adminUpdateOrder(order.id, { status: newStatus });
      setOrder(res.data.order);
      setSuccessMsg(`Order status updated to "${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}"`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return 'Rs. ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const parseAddress = (addr) => {
    if (!addr) return null;
    try {
      return typeof addr === 'string' ? JSON.parse(addr) : addr;
    } catch {
      return null;
    }
  };

  const getStatusConfig = (status) => STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', padding: '60px'}}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="card" style={{padding: '60px 40px', textAlign: 'center', maxWidth: '500px', margin: '40px auto'}}>
        <div style={{fontSize: '3rem', marginBottom: '16px'}}>⚠️</div>
        <h2 style={{marginBottom: '12px'}}>Order Not Found</h2>
        <p style={{color: 'var(--text-light)', marginBottom: '24px'}}>{error}</p>
        <Link to="/admin/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const shippingAddress = parseAddress(order.shipping_address);
  const currentStatus = getStatusConfig(order.status);
  const currentIndex = STATUS_FLOW.indexOf(order.status);

  return (
    <div>
      <div style={{marginBottom: '24px'}}>
        <Link to="/admin/dashboard" style={{fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
          ← Back to Dashboard
        </Link>
      </div>

      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px'}}>
        <div>
          <h1 style={{fontSize: '2rem', marginBottom: '4px'}}>Order #{String(order.id).padStart(4, '0')}</h1>
          <p style={{color: 'var(--text-light)'}}>Placed on {formatDate(order.created_at)}</p>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          borderRadius: '24px',
          backgroundColor: currentStatus.color + '18',
          color: currentStatus.color,
          fontWeight: 600,
          fontSize: '1rem'
        }}>
          <span>{currentStatus.icon}</span>
          {currentStatus.label}
        </div>
      </div>

      {successMsg && (
        <div style={{padding: '12px 20px', borderRadius: 'var(--radius-sm)', background: '#d1fae5', color: '#065f46', marginBottom: '20px', fontWeight: 500}}>
          {successMsg}
        </div>
      )}

      {error && order && (
        <div style={{padding: '12px 20px', borderRadius: 'var(--radius-sm)', background: '#fee2e2', color: '#991b1b', marginBottom: '20px', fontWeight: 500}}>
          {error}
        </div>
      )}

      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px'}}>
        <div className="card" style={{padding: '24px'}}>
          <h2 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)'}}>Order Items</h2>
          {order.items?.map((item, idx) => {
            const product = item.product;
            const imageUrl = product?.image || null;
            return (
              <div key={item.id || idx} style={{display: 'flex', gap: '16px', padding: '16px 0', borderBottom: idx < order.items.length - 1 ? '1px solid var(--border)' : 'none'}}>
                <div style={{width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--secondary)', flexShrink: 0}}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  ) : (
                    <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'}}>🧶</div>
                  )}
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <Link to={`/product/${product.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                    <h4 style={{fontWeight: 600, marginBottom: '4px'}}>{product.name}</h4>
                  </Link>
                  <p style={{fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '2px'}}>
                    Qty: {item.quantity} × {formatCurrency(item.price_at_purchase)}
                  </p>
                  <p style={{fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)'}}>
                    {formatCurrency(item.price_at_purchase * item.quantity)}
                  </p>
                </div>
              </div>
            );
          })}
          <div style={{paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px'}}>
            <span style={{fontWeight: 600, fontSize: '1rem'}}>Total</span>
            <span style={{fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)'}}>{formatCurrency(order.total)}</span>
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
          <div className="card" style={{padding: '24px'}}>
            <h2 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)'}}>Customer</h2>
            {shippingAddress ? (
              <div style={{lineHeight: 1.8}}>
                <p style={{fontWeight: 600, fontSize: '1rem'}}>{shippingAddress.fullName}</p>
                <p style={{fontSize: '0.9rem', color: 'var(--text-light)'}}>{shippingAddress.email}</p>
                <p style={{fontSize: '0.9rem', color: 'var(--text-light)'}}>{shippingAddress.phone}</p>
              </div>
            ) : (
              <p style={{color: 'var(--text-light)', fontStyle: 'italic', fontSize: '0.9rem'}}>No customer info</p>
            )}
          </div>

          <div className="card" style={{padding: '24px'}}>
            <h2 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)'}}>Shipping Address</h2>
            {shippingAddress ? (
              <div style={{fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--text-light)'}}>
                <p>{shippingAddress.addressLine1}</p>
                {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
              </div>
            ) : (
              <p style={{color: 'var(--text-light)', fontStyle: 'italic'}}>No address provided</p>
            )}
          </div>

          {order.payment_screenshot && (
            <div className="card" style={{padding: '24px'}}>
              <h2 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)'}}>Payment Screenshot</h2>
              <img
                src={order.payment_screenshot}
                alt="Payment proof"
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
                onClick={() => window.open(order.payment_screenshot, '_blank')}
              />
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{padding: '24px'}}>
        <h2 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)'}}>Update Status</h2>

        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px'}}>
          {STATUS_OPTIONS.map((status) => {
            const isActive = order.status === status.value;
            const isAvailable = status.value === 'cancelled' || currentIndex < STATUS_FLOW.indexOf(status.value) || status.value === order.status;
            return (
              <button
                key={status.value}
                onClick={() => !isActive && handleStatusUpdate(status.value)}
                disabled={updating || isActive || (!isAvailable && status.value !== 'cancelled')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-sm)',
                  border: isActive ? `2px solid ${status.color}` : '2px solid var(--border)',
                  background: isActive ? status.color + '18' : 'var(--white)',
                  color: isActive ? status.color : 'var(--text)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  cursor: isActive ? 'default' : 'pointer',
                  opacity: updating ? 0.6 : 1,
                  transition: 'var(--transition)'
                }}
              >
                <span>{status.icon}</span>
                {status.label}
                {isActive && <span style={{fontSize: '0.75rem', opacity: 0.7}}>(current)</span>}
              </button>
            );
          })}
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <span style={{fontSize: '0.85rem', color: 'var(--text-light)'}}>Order ID:</span>
          <span style={{fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 500}}>#{String(order.id).padStart(4, '0')}</span>
          <span style={{margin: '0 8px', color: 'var(--border)'}}>|</span>
          <span style={{fontSize: '0.85rem', color: 'var(--text-light)'}}>User ID:</span>
          <span style={{fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 500}}>{order.user_id}</span>
          <span style={{margin: '0 8px', color: 'var(--border)'}}>|</span>
          <span style={{fontSize: '0.85rem', color: 'var(--text-light)'}}>Last updated:</span>
          <span style={{fontSize: '0.85rem'}}>{formatDate(order.updated_at || order.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
