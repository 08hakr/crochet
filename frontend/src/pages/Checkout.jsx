import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkoutAPI, settingsAPI } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { items, total, count, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [qrImage, setQrImage] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [addressSubmitted, setAddressSubmitted] = useState(false);
  const [paidAmount, setPaidAmount] = useState('');
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    email: ''
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    fetchQR();
    createOrder();
  }, [isAuthenticated, items.length, navigate]);

  const fetchQR = async () => {
    try {
      const response = await settingsAPI.getQR();
      const blob = response.data;
      const url = URL.createObjectURL(blob);
      setQrImage(url);
    } catch (err) {
      console.error('Failed to fetch QR:', err);
    }
  };

  const createOrder = async () => {
    try {
      setCreatingOrder(true);
      const response = await checkoutAPI.createOrder();
      setOrder(response.data.order);
      if (response.data.qr_code) {
        const base64 = response.data.qr_code;
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setQrImage(url);
      }
    } catch (err) {
      setError('Failed to create order. Please try again.');
      console.error(err);
    } finally {
      setCreatingOrder(false);
      setLoading(false);
    }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setPaidAmount(value);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentConfirm = () => {
    if (!paidAmount || parseFloat(paidAmount) < total) {
      setError(`Paid amount must be at least ₹${total.toFixed(2)}`);
      return;
    }
    setPaymentConfirmed(true);
    setError(null);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
      setError('Please fill all required fields');
      return;
    }
    if (!/^\d{10}$/.test(address.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }
    setAddressSubmitted(true);
    setError(null);
  };

  const handleUpload = async () => {
    if (!screenshot || !order) return;
    
    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      formData.append('shipping_address', JSON.stringify(address));
      
      await checkoutAPI.uploadScreenshot(order.id, formData);
      setSuccess(true);
      clearCart();
      
      setTimeout(() => {
        navigate('/account');
      }, 3000);
    } catch (err) {
      setError('Failed to upload screenshot. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    navigate('/cart');
  };

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

  if (loading || creatingOrder) {
    return (
      <div className="container" style={{padding: '60px 0', textAlign: 'center'}}>
        <div className="loading-spinner" style={{margin: '0 auto'}}></div>
        <p style={{marginTop: '16px', color: 'var(--text-light)'}}>Creating your order...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="container" style={{padding: '60px 0', textAlign: 'center'}}>
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h3 className="empty-state-title">Error</h3>
          <p className="empty-state-text">{error}</p>
          <button onClick={createOrder} className="btn btn-primary mt-2">Try Again</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container" style={{padding: '60px 0', textAlign: 'center'}}>
        <div className="card" style={{maxWidth: '500px', margin: '0 auto', padding: '48px'}}>
          <div style={{width: '80px', height: '80px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2.5rem'}}>✅</div>
          <h2 style={{marginBottom: '12px'}}>Payment Submitted!</h2>
          <p style={{color: 'var(--text-light)', marginBottom: '24px'}}>
            Your payment screenshot has been uploaded. We'll verify it shortly.
          </p>
          <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>
            Redirecting to your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="page-header">
        <div className="container">
          <h1 className="page-title">Checkout</h1>
          <p className="page-subtitle">Complete your purchase</p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '1000px', margin: '0 auto'}}>

            <div>
              <div className="card" style={{overflow: 'hidden'}}>
                <div style={{padding: '24px', borderBottom: '1px solid var(--border)'}}>
                  <h2 style={{fontSize: '1.3rem', fontWeight: 600}}>Order Summary</h2>
                </div>
                
                <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                  {items.map(item => {
                    const product = item.product;
                    const imageUrl = product?.image 
                      ? product.image 
                      : product?.image_blob 
                        ? `data:${product.image_mime};base64,${product.image_blob}` 
                        : null;

                    return (
                      <div key={item.id} style={{display: 'flex', gap: '16px', padding: '16px 24px', borderBottom: '1px solid var(--border)'}}>
                        <div style={{width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--secondary)', flexShrink: 0}}>
                          {imageUrl ? (
                            <img src={imageUrl} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                          ) : (
                            <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>🧶</div>
                          )}
                        </div>
                        <div style={{flex: 1, minWidth: 0}}>
                          <Link to={`/product/${product.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                            <h4 style={{fontWeight: 500, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{product.name}</h4>
                          </Link>
                          <p style={{fontSize: '0.9rem', color: 'var(--text-light)'}}>
                            Qty: {item.quantity} × {formatCurrency(product.price)}
                          </p>
                        </div>
                        <div style={{textAlign: 'right', fontWeight: 600, color: 'var(--primary)'}}>
                          {formatCurrency(product.price * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{padding: '24px', borderTop: '1px solid var(--border)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-light)'}}>
                    <span>Subtotal ({count} items)</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-light)'}}>
                    <span>Shipping</span>
                    <span>{total >= 1000 ? 'Free' : '₹50.00'}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--text-light)'}}>
                    <span>Tax (GST)</span>
                    <span>Included</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem', paddingTop: '16px', borderTop: '1px solid var(--border)'}}>
                    <span>Total Payable</span>
                    <span style={{color: 'var(--primary)'}}>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="card" style={{padding: '24px', height: '100%', display: 'flex', flexDirection: 'column'}}>
                <h2 style={{fontSize: '1.3rem', marginBottom: '20px', fontWeight: 600}}>Payment via UPI</h2>
                
                <div style={{textAlign: 'center', marginBottom: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                  {qrImage ? (
                    <div>
                      <img 
                        src={qrImage} 
                        alt="UPI QR Code for payment"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          borderRadius: 'var(--radius-sm)',
                          boxShadow: 'var(--shadow)',
                          background: 'white',
                          padding: '16px'
                        }}
                      />
                      <p style={{marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-light)'}}>
                        Scan with any UPI app (GPay, PhonePe, Paytm, etc.)
                      </p>
                    </div>
                  ) : (
                    <div style={{padding: '40px', color: 'var(--text-light)'}}>
                      <div style={{fontSize: '3rem', marginBottom: '16px'}}>📱</div>
                      <p>QR code not set by admin. Please contact support or pay manually.</p>
                    </div>
                  )}
                </div>

                {!paymentConfirmed ? (
                  <div style={{borderTop: '1px solid var(--border)', paddingTop: '24px'}}>
                    <h3 style={{fontSize: '1rem', marginBottom: '16px', fontWeight: 600}}>Confirm Payment</h3>
                    
                    <p style={{fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '16px'}}>
                      Enter the amount you paid and confirm to proceed.
                    </p>

                    {error && (
                      <div className="alert alert-error" style={{marginBottom: '16px'}}>
                        {error}
                      </div>
                    )}

                    <div className="form-group" style={{marginBottom: '16px'}}>
                      <label htmlFor="paidAmount" className="form-label">Amount Paid (₹)</label>
                      <input
                        id="paidAmount"
                        type="number"
                        step="0.01"
                        min={total}
                        value={paidAmount}
                        onChange={handleAmountChange}
                        className="form-input"
                        placeholder={formatCurrency(total)}
                        style={{fontSize: '1.2rem', fontWeight: 600, textAlign: 'center'}}
                      />
                    </div>

                    <div style={{display: 'flex', gap: '12px', marginBottom: '24px'}}>
                      <button
                        onClick={handlePaymentConfirm}
                        className="btn btn-primary"
                        style={{flex: 1, padding: '14px'}}
                      >
                        I've Paid - Proceed
                      </button>
                      <button
                        onClick={handleCancel}
                        className="btn btn-outline"
                        style={{flex: 1, padding: '14px'}}
                      >
                        Cancel Order
                      </button>
                    </div>
                  </div>
                ) : !addressSubmitted ? (
                  <div style={{borderTop: '1px solid var(--border)', paddingTop: '24px'}}>
                    <h3 style={{fontSize: '1rem', marginBottom: '16px', fontWeight: 600}}>Shipping Address</h3>
                    
                    <p style={{fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '16px'}}>
                      Please provide your delivery details.
                    </p>

                    {error && (
                      <div className="alert alert-error" style={{marginBottom: '16px'}}>
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleAddressSubmit}>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                        <div className="form-group">
                          <label htmlFor="fullName" className="form-label">Full Name *</label>
                          <input
                            id="fullName"
                            type="text"
                            name="fullName"
                            value={address.fullName}
                            onChange={handleAddressChange}
                            className="form-input"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="email" className="form-label">Email *</label>
                          <input
                            id="email"
                            type="email"
                            name="email"
                            value={address.email}
                            onChange={handleAddressChange}
                            className="form-input"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone" className="form-label">Phone Number *</label>
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          value={address.phone}
                          onChange={handleAddressChange}
                          className="form-input"
                          placeholder="10 digit number"
                          maxLength={10}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="addressLine1" className="form-label">Address Line 1 *</label>
                        <input
                          id="addressLine1"
                          type="text"
                          name="addressLine1"
                          value={address.addressLine1}
                          onChange={handleAddressChange}
                          className="form-input"
                          placeholder="House/Flat No., Building, Street"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="addressLine2" className="form-label">Address Line 2</label>
                        <input
                          id="addressLine2"
                          type="text"
                          name="addressLine2"
                          value={address.addressLine2}
                          onChange={handleAddressChange}
                          className="form-input"
                          placeholder="Landmark, Area, Sector (Optional)"
                        />
                      </div>

                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}>
                        <div className="form-group">
                          <label htmlFor="city" className="form-label">City *</label>
                          <input
                            id="city"
                            type="text"
                            name="city"
                            value={address.city}
                            onChange={handleAddressChange}
                            className="form-input"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="state" className="form-label">State *</label>
                          <input
                            id="state"
                            type="text"
                            name="state"
                            value={address.state}
                            onChange={handleAddressChange}
                            className="form-input"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="pincode" className="form-label">Pincode *</label>
                          <input
                            id="pincode"
                            type="text"
                            name="pincode"
                            value={address.pincode}
                            onChange={handleAddressChange}
                            className="form-input"
                            placeholder="6 digits"
                            maxLength={6}
                            required
                          />
                        </div>
                      </div>

                      <div style={{display: 'flex', gap: '12px', marginTop: '8px'}}>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          style={{flex: 1, padding: '14px'}}
                        >
                          Save Address & Continue
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentConfirmed(false)}
                          className="btn btn-outline"
                          style={{flex: 1, padding: '14px'}}
                        >
                          Back
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div style={{borderTop: '1px solid var(--border)', paddingTop: '24px'}}>
                    <h3 style={{fontSize: '1rem', marginBottom: '16px', fontWeight: 600}}>Upload Payment Screenshot</h3>
                    
                    <p style={{fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '16px'}}>
                      After payment, take a screenshot and upload it here for verification.
                    </p>

                    {error && (
                      <div className="alert alert-error" style={{marginBottom: '16px'}}>
                        {error}
                      </div>
                    )}

                    <div style={{marginBottom: '16px'}}>
                      <label className="btn btn-outline" style={{width: '100%', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotChange}
                          style={{display: 'none'}}
                        />
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>{screenshot ? screenshot.name : 'Choose screenshot file'}</span>
                        <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>PNG, JPG up to 5MB</span>
                      </label>
                    </div>

                    {previewUrl && (
                      <div style={{marginBottom: '16px', textAlign: 'center'}}>
                        <img 
                          src={previewUrl} 
                          alt="Payment screenshot preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            borderRadius: 'var(--radius-sm)',
                            border: '2px solid var(--border)'
                          }}
                        />
                      </div>
                    )}

                    <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
                      <button
                        onClick={() => setAddressSubmitted(false)}
                        className="btn btn-outline"
                        style={{flex: 1, padding: '14px'}}
                      >
                        Change Address
                      </button>
                      <button
                        onClick={handleCancel}
                        className="btn btn-ghost"
                        style={{flex: 1, padding: '14px'}}
                      >
                        Cancel
                      </button>
                    </div>

                    <button
                      onClick={handleUpload}
                      disabled={!screenshot || uploading}
                      className="btn btn-primary"
                      style={{width: '100%', padding: '16px', fontSize: '1.1rem'}}
                    >
                      {uploading ? (
                        <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                          <span className="loading-spinner" style={{width: '20px', height: '20px', borderWidth: '2px'}}></span>
                          Uploading...
                        </span>
                      ) : (
                        'Submit Payment Proof'
                      )}
                    </button>

                    <p style={{marginTop: '16px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                      Your order will be processed after payment verification.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}