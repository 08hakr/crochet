import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, total, count, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="container" style={{padding: '60px 0', textAlign: 'center'}}>
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3 className="empty-state-title">Please log in to view your cart</h3>
          <p className="empty-state-text">Your cart items will be saved after you log in.</p>
          <Link to="/login" className="btn btn-primary mt-2">Login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{padding: '60px 0'}}>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{padding: '60px 0', textAlign: 'center'}}>
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3 className="empty-state-title">Your cart is empty</h3>
          <p className="empty-state-text">Looks like you haven't added any items yet.</p>
          <Link to="/shop" className="btn btn-primary mt-2">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="page-header">
        <div className="container">
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">{count} item{count !== 1 ? 's' : ''} in your cart</p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div style={{display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px'}}>

            <div>
              <div className="card" style={{overflow: 'hidden'}}>
                <div style={{display: 'grid', gridTemplateColumns: '80px 1fr 120px 100px 60px', gap: '16px', padding: '16px 20px', background: 'var(--background)', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-light)'}}>
                  <div></div>
                  <div>Product</div>
                  <div style={{textAlign: 'center'}}>Price</div>
                  <div style={{textAlign: 'center'}}>Quantity</div>
                  <div></div>
                </div>

                {items.map(item => {
                  const product = item.product;
                  const imageUrl = product?.image 
                    ? product.image 
                    : product?.image_blob 
                      ? `data:${product.image_mime};base64,${product.image_blob}` 
                      : null;

                  return (
                    <div key={item.id} style={{display: 'grid', gridTemplateColumns: '80px 1fr 120px 100px 60px', gap: '16px', padding: '20px', alignItems: 'center', borderBottom: '1px solid var(--border)'}}>
                      <div style={{aspectRatio: '1', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--secondary)'}}>
                        {imageUrl ? (
                          <img src={imageUrl} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        ) : (
                          <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'}}>🧶</div>
                        )}
                      </div>
                      
                      <div>
                        <Link to={`/product/${product.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                          <h4 style={{fontWeight: 600, marginBottom: '4px'}}>{product.name}</h4>
                        </Link>
                        {product.category_name && (
                          <span className="badge" style={{fontSize: '0.65rem', background: 'var(--secondary)', color: 'var(--primary)'}}>
                            {product.category_name}
                          </span>
                        )}
                      </div>

                      <div style={{textAlign: 'center', fontWeight: 500, color: 'var(--primary)'}}>
                        ₹{product.price.toFixed(2)}
                      </div>

                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          style={{width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--border)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', transition: 'var(--transition)'}}
                        >
                          −
                        </button>
                        <span style={{minWidth: '32px', textAlign: 'center', fontWeight: 500}}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={product?.stock && item.quantity >= product.stock}
                          style={{width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--border)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', transition: 'var(--transition)'}}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', transition: 'var(--transition)'}}
                        aria-label="Remove item"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  );
                })}

                {items.length > 1 && (
                  <div style={{padding: '16px 20px', textAlign: 'right'}}>
                    <button onClick={clearCart} className="btn btn-sm btn-ghost">
                      Clear Cart
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="card" style={{padding: '24px', position: 'sticky', top: '100px'}}>
                <h2 style={{fontSize: '1.3rem', marginBottom: '24px', fontWeight: 600}}>Order Summary</h2>
                
                <div style={{marginBottom: '16px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)'}}>
                  <span>Subtotal ({count} items)</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                
                <div style={{marginBottom: '16px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)'}}>
                  <span>Shipping</span>
                  <span>{total >= 1000 ? 'Free' : '₹50.00'}</span>
                </div>
                
                <div style={{marginBottom: '16px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)'}}>
                  <span>Tax (GST)</span>
                  <span>Included</span>
                </div>

                <div style={{borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '24px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '1.1rem'}}>
                    <span>Total</span>
                    <span style={{color: 'var(--primary)'}}>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {total < 1000 && (
                  <div style={{marginBottom: '20px', padding: '12px', background: '#fff3e0', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#e65100'}}>
                    Add ₹{(1000 - total).toFixed(2)} more for free shipping!
                  </div>
                )}

                <Link to="/checkout" className="btn btn-primary" style={{width: '100%', padding: '16px', fontSize: '1.1rem'}}>
                  Proceed to Checkout
                </Link>

                <p style={{marginTop: '16px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)'}}>
                  Secure payment via UPI QR code
                </p>
              </div>

              <div className="card" style={{marginTop: '24px', padding: '24px'}}>
                <h3 style={{fontSize: '1rem', marginBottom: '16px', fontWeight: 600}}>Payment Methods</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)'}}>
                    <div style={{width: '40px', height: '40px', background: 'var(--secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'}}>📱</div>
                    <div>
                      <div style={{fontWeight: 500}}>UPI Payment</div>
                      <div style={{fontSize: '0.85rem', color: 'var(--text-light)'}}>Scan QR code at checkout</div>
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', opacity: 0.6}}>
                    <div style={{width: '40px', height: '40px', background: 'var(--secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'}}>💳</div>
                    <div>
                      <div style={{fontWeight: 500}}>Card / Net Banking</div>
                      <div style={{fontSize: '0.85rem', color: 'var(--text-light)'}}>Coming soon</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}