import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../api/client';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsAPI.getOne(id);
        setProduct(response.data.product);
      } catch (err) {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const imageUrl = product?.image 
    ? product.image 
    : product?.image_blob 
      ? `data:${product.image_mime};base64,${product.image_blob}` 
      : null;

  if (loading) {
    return (
      <div className="container" style={{padding: '60px 0'}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', maxWidth: '1000px', margin: '0 auto'}}>
          <div style={{aspectRatio: '1', background: 'var(--secondary)', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite'}} />
          <div>
            <div style={{height: '24px', background: 'var(--border)', borderRadius: '4px', marginBottom: '16px', width: '60%', animation: 'pulse 1.5s infinite'}} />
            <div style={{height: '16px', background: 'var(--border)', borderRadius: '4px', marginBottom: '12px', width: '80%', animation: 'pulse 1.5s infinite 0.2s'}} />
            <div style={{height: '16px', background: 'var(--border)', borderRadius: '4px', marginBottom: '24px', width: '40%', animation: 'pulse 1.5s infinite 0.4s'}} />
            <div style={{height: '48px', background: 'var(--border)', borderRadius: '4px', marginBottom: '24px', animation: 'pulse 1.5s infinite'}} />
            <div style={{display: 'flex', gap: '16px'}}>
              <div style={{flex: 1, height: '48px', background: 'var(--border)', borderRadius: '4px', animation: 'pulse 1.5s infinite'}} />
              <div style={{width: '200px', height: '48px', background: 'var(--border)', borderRadius: '4px', animation: 'pulse 1.5s infinite'}} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{padding: '60px 0', textAlign: 'center'}}>
        <div className="empty-state">
          <div className="empty-state-icon">😔</div>
          <h3 className="empty-state-title">Product Not Found</h3>
          <p className="empty-state-text">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/shop" className="btn btn-primary mt-2">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav style={{padding: '20px 0'}} aria-label="Breadcrumb">
        <div className="container">
          <ol style={{display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-light)', flexWrap: 'wrap'}}>
            <li><Link to="/" style={{color: 'var(--text-light)'}}>Home</Link></li>
            <li>/</li>
            <li><Link to="/shop" style={{color: 'var(--text-light)'}}>Shop</Link></li>
            <li>/</li>
            <li aria-current="page" style={{color: 'var(--text)', fontWeight: 500}}>{product.name}</li>
          </ol>
        </div>
      </nav>

      <section className="section">
        <div className="container">
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', maxWidth: '1000px', margin: '0 auto', alignItems: 'start'}}>
            <div className="card" style={{overflow: 'hidden', borderRadius: 'var(--radius)'}}>
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={product.name}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '6rem',
                  background: 'var(--secondary)'
                }}>
                  🧶
                </div>
              )}
            </div>

            <div>
              {product.category_name && (
                <span className="badge" style={{
                  background: 'var(--secondary)',
                  color: 'var(--primary)',
                  marginBottom: '16px',
                  display: 'inline-block'
                }}>
                  {product.category_name}
                </span>
              )}
              <h1 style={{fontSize: '2.5rem', marginBottom: '16px', fontWeight: 600}}>{product.name}</h1>
              <div style={{fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '24px', fontFamily: "'Playfair Display', serif"}}>
                ₹{product.price.toFixed(2)}
              </div>

              {product.description && (
                <div style={{marginBottom: '24px', lineHeight: 1.7, color: 'var(--text)'}}>
                  <p>{product.description}</p>
                </div>
              )}

              <div style={{marginBottom: '24px', padding: '16px', background: 'var(--background)', borderRadius: 'var(--radius-sm)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px'}}>
                  <span style={{fontWeight: 500}}>Stock:</span>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: product.stock > 0 ? '#e8f5e9' : '#fdeaea',
                    color: product.stock > 0 ? 'var(--success)' : 'var(--error)'
                  }}>
                    {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                  </span>
                </div>
                {product.created_at && (
                  <div style={{fontSize: '0.85rem', color: 'var(--text-light)'}}>
                    Added: {new Date(product.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div style={{display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <label htmlFor="quantity" style={{fontWeight: 500}}>Quantity:</label>
                  <div style={{display: 'flex', alignItems: 'center', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden'}}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      style={{
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--white)',
                        color: 'var(--text)',
                        fontSize: '1.2rem',
                        transition: 'var(--transition)'
                      }}
                    >
                      −
                    </button>
                    <input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      max={product.stock}
                      style={{
                        width: '60px',
                        height: '44px',
                        textAlign: 'center',
                        border: 'none',
                        outline: 'none',
                        fontSize: '1rem',
                        fontWeight: 500
                      }}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      style={{
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--white)',
                        color: 'var(--text)',
                        fontSize: '1.2rem',
                        transition: 'var(--transition)'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="btn btn-primary btn-lg"
                  style={{flex: 1, minWidth: '200px'}}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>

              <div style={{marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)'}}>
                <h3 style={{fontSize: '1rem', marginBottom: '16px', fontWeight: 600}}>Share this product</h3>
                <div style={{display: 'flex', gap: '12px'}}>
                  <button className="btn btn-sm btn-outline" style={{padding: '8px 12px'}}>
                    📱 Share
                  </button>
                  <button className="btn btn-sm btn-outline" style={{padding: '8px 12px'}}>
                    💌 Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{background: 'var(--white)'}}>
        <div className="container" style={{maxWidth: '800px'}}>
          <h2 className="section-title" style={{textAlign: 'center', marginBottom: '40px'}}>You May Also Like</h2>
          <RelatedProducts excludeId={product.id} />
        </div>
      </section>
    </div>
  );
}

function RelatedProducts({ excludeId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productsAPI.getAll().then(res => {
      setProducts((res.data.products || []).filter(p => p.id !== excludeId).slice(0, 4));
    });
  }, [excludeId]);

  const { addToCart } = useCart();

  if (products.length === 0) return null;

  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'}}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
      ))}
    </div>
  );
}