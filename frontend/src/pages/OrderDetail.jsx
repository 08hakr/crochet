import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { checkoutAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function OrderDetail() {
  const { id } = useParams();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [isAuthenticated, id, navigate]);

  const fetchOrder = async () => {
    try {
      const response = await checkoutAPI.getOrder(id);
      setOrder(response.data.order);
    } catch (err) {
      setError('Order not found');
      console.error(err);
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

  const parseAddress = (addressStr) => {
    try {
      return JSON.parse(addressStr);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="container" style={{padding: '60px 0', textAlign: 'center'}}>
        <div className="loading-spinner" style={{margin: '0 auto'}}></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{padding: '60px 0', textAlign: 'center'}}>
        <div className="empty-state">
          <div className="empty-state-icon">😔</div>
          <h3 className="empty-state-title">Order Not Found</h3>
          <p className="empty-state-text">The order you're looking for doesn't exist.</p>
          <Link to="/account" className="btn btn-primary mt-2">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const shippingAddress = parseAddress(order.shipping_address);

  return (
    <div>
      <nav style={{padding: '20px 0'}} aria-label="Breadcrumb">
        <div className="container">
          <ol style={{display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-light)', flexWrap: 'wrap'}}>
            <li><Link to="/" style={{color: 'var(--text-light)'}}>Home</Link></li>
            <li>/</li>
            <li><Link to="/account" style={{color: 'var(--text-light)'}}>My Account</Link></li>
            <li>/</li>
            <li aria-current="page" style={{color: 'var(--text)', fontWeight: 500}}>Order #{id.padStart(6, '0')}</li>
          </ol>
        </div>
      </nav>

      <section className="section">
        <div className="container" style={{maxWidth: '900px'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px'}}>
            <div>
              <h1 style={{fontSize: '2rem', marginBottom: '4px'}}>Order #{id.padStart(6, '0')}</h1>
              <p style={{color: 'var(--text-light)'}}>Placed on {formatDate(order.created_at)}</p>
            </div>
            <span className={`badge ${getStatusBadge(order.status)}`} style={{fontSize: '1rem', padding: '8px 16px'}}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px'}}>

            <div className="card" style={{padding: '24px'}}>
              <h2 style={{fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '12px'}}>Order Items</h2>
              
              {order.items?.map(item => {
                const product = item.product;
                const imageUrl = product?.image 
                  ? product.image 
                  : product?.image_blob 
                    ? `data:${product.image_mime};base64,${product.image_blob}` 
                    : null;

                return (
                  <div key={item.id} style={{display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border)'}}>
                    <div style={{width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--secondary)', flexShrink: 0}}>
                      {imageUrl ? (
                        <img src={imageUrl} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                        <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'}}>🧶</div>
                      )}
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <Link to={`/product/${product.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                        <h4 style={{fontWeight: 600, marginBottom: '8px'}}>{product.name}</h4>
                      </Link>
                      <p style={{fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '4px'}}>
                        Qty: {item.quantity} × {formatCurrency(product.price)}
                      </p>
                      <p style={{fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)'}}>
                        {formatCurrency(item.price_at_purchase * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div style={{padding: '16px 0', textAlign: 'right'}}>
                <div style={{fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)'}}>
                  Total: {formatCurrency(order.total)}
                </div>
              </div>
            </div>

            <div className="card" style={{padding: '24px'}}>
              <h2 style={{fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '12px'}}>Shipping Address</h2>
              
              {shippingAddress ? (
                <div style={{lineHeight: 2}}>
                  <p style={{fontWeight: 600, fontSize: '1.1rem', marginBottom: '8px'}}>{shippingAddress.fullName}</p>
                  <p style={{color: 'var(--text-light)'}}><strong>Phone:</strong> {shippingAddress.phone}</p>
                  <p style={{color: 'var(--text-light)'}}><strong>Email:</strong> {shippingAddress.email}</p>
                  <p style={{color: 'var(--text-light)', marginBottom: '8px'}}>
                    {shippingAddress.addressLine1}
                    {shippingAddress.addressLine2 && `, ${shippingAddress.addressLine2}`}
                  </p>
                  <p style={{color: 'var(--text-light)', marginBottom: '8px'}}>
                    {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                  </p>
                </div>
              ) : (
                <div style={{color: 'var(--text-light)', fontStyle: 'italic'}}>
                  Address not available
                </div>
              )}

              <hr style={{border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0'}} />

              <h2 style={{fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '12px'}}>Payment Info</h2>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{color: 'var(--text-light)'}}>Total Paid</span>
                  <span style={{fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)'}}>{formatCurrency(order.total)}</span>
                </div>
                
                {order.payment_screenshot && (
                  <div>
                    <p style={{fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '8px'}}>Payment Screenshot</p>
                    <img 
                      src={order.payment_screenshot} 
                      alt="Payment proof"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '250px',
                        borderRadius: 'var(--radius-sm)',
                        border: '2px solid var(--border)',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(order.payment_screenshot, '_blank')}
                    />
                  </div>
                )}
              </div>
            </div>

          </div>

          <div style={{marginTop: '24px', textAlign: 'center'}}>
            <Link to="/account" className="btn btn-outline">Back to Orders</Link>
          </div>
        </div>
      </section>
    </div>
  );
}