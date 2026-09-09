import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSettings, setHeroSettings] = useState({
    title: 'Handcrafted Crochet Creations',
    subtitle: 'Beautiful handmade items made with love'
  });
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, settingsRes] = await Promise.all([
          productsAPI.getAll({ limit: 4 }),
          productsAPI.getAll({ limit: 1 }).catch(() => ({ data: { products: [] } }))
        ]);
        setFeaturedProducts(productsRes.data.products || []);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <section className="hero" style={{
        padding: '100px 0',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--background) 0%, var(--secondary) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container">
          <div style={{maxWidth: '800px', margin: '0 auto'}}>
            <h1 className="page-title" style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              marginBottom: '24px',
              color: 'var(--primary)',
              fontWeight: 700
            }}>
              {heroSettings.title}
            </h1>
            <p className="page-subtitle" style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
              marginBottom: '40px',
              color: 'var(--text-light)',
              maxWidth: '600px',
              margin: '0 auto 40px'
            }}>
              {heroSettings.subtitle}
            </p>
            <div style={{display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap'}}>
              <Link to="/shop" className="btn btn-primary btn-lg">
                Shop Now
              </Link>
              <Link to="/about" className="btn btn-outline btn-lg">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px'}}>
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Handpicked favorites from our collection</p>
            </div>
            <Link to="/shop" className="btn btn-outline">View All</Link>
          </div>

          {loading ? (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px'}}>
              {[1,2,3,4].map(i => (
                <div key={i} className="card" style={{height: '400px'}}>
                  <div style={{height: '250px', background: 'var(--secondary)'}} />
                  <div style={{padding: '20px'}}>
                    <div style={{height: '24px', background: 'var(--border)', borderRadius: '4px', marginBottom: '12px', animation: 'pulse 1.5s infinite'}} />
                    <div style={{height: '16px', background: 'var(--border)', borderRadius: '4px', marginBottom: '8px', width: '60%', animation: 'pulse 1.5s infinite 0.2s'}} />
                    <div style={{height: '16px', background: 'var(--border)', borderRadius: '4px', width: '40%', animation: 'pulse 1.5s infinite 0.4s'}} />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🧶</div>
              <h3 className="empty-state-title">No products yet</h3>
              <p className="empty-state-text">Check back soon for our latest creations!</p>
            </div>
          ) : (
            <div className="grid grid-4" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
              {featuredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{background: 'var(--white)'}}>
        <div className="container">
          <div className="grid grid-3" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', textAlign: 'center'}}>
            <div style={{padding: '32px 24px'}}>
              <div style={{fontSize: '3rem', marginBottom: '16px'}}>🤲</div>
              <h3 style={{fontSize: '1.3rem', marginBottom: '12px'}}>Handmade with Love</h3>
              <p style={{color: 'var(--text-light)'}}>Every piece is crafted by hand with attention to detail and care.</p>
            </div>
            <div style={{padding: '32px 24px'}}>
              <div style={{fontSize: '3rem', marginBottom: '16px'}}>🌿</div>
              <h3 style={{fontSize: '1.3rem', marginBottom: '12px'}}>Quality Materials</h3>
              <p style={{color: 'var(--text-light)'}}>We use premium yarns that are soft, durable, and safe for all ages.</p>
            </div>
            <div style={{padding: '32px 24px'}}>
              <div style={{fontSize: '3rem', marginBottom: '16px'}}>✨</div>
              <h3 style={{fontSize: '1.3rem', marginBottom: '12px'}}>Unique Designs</h3>
              <p style={{color: 'var(--text-light)'}}>Each creation is one-of-a-kind, made with original patterns and creativity.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{background: 'var(--secondary)', textAlign: 'center'}}>
        <div className="container">
          <h2 className="section-title" style={{marginBottom: '16px'}}>Create Your Own</h2>
          <p className="section-subtitle" style={{maxWidth: '600px', margin: '0 auto 32px'}}>
            Have a special design in mind? We accept custom orders for personalized crochet creations.
          </p>
          <Link to="/contact" className="btn btn-primary btn-lg">Inquire About Custom Orders</Link>
        </div>
      </section>
    </div>
  );
}