import { useEffect, useState, useMemo } from 'react';
import { productsAPI } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getAll(),
          productsAPI.getCategories()
        ]);
        setProducts(productsRes.data.products || []);
        setCategories(categoriesRes.data.categories || []);
      } catch (error) {
        console.error('Failed to fetch shop data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div>
      <header className="page-header">
        <div className="container">
          <h1 className="page-title">Shop</h1>
          <p className="page-subtitle">Discover our handcrafted crochet collection</p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div style={{display: 'flex', gap: '32px', flexWrap: 'wrap'}}>
            <aside style={{flex: '0 0 280px', maxWidth: '280px'}}>
              <div className="card" style={{padding: '24px', position: 'sticky', top: '100px'}}>
                <h3 style={{fontSize: '1.1rem', marginBottom: '16px', fontWeight: 600}}>Categories</h3>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={!selectedCategory ? 'active' : ''}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '8px',
                    background: !selectedCategory ? 'var(--primary)' : 'transparent',
                    color: !selectedCategory ? 'var(--white)' : 'var(--text)',
                    fontWeight: !selectedCategory ? 600 : 400,
                    transition: 'var(--transition)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  All Products
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id ? 'active' : ''}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '8px',
                      background: selectedCategory === category.id ? 'var(--primary)' : 'transparent',
                      color: selectedCategory === category.id ? 'var(--white)' : 'var(--text)',
                      fontWeight: selectedCategory === category.id ? 600 : 400,
                      transition: 'var(--transition)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {category.name}
                  </button>
                ))}
                {categories.length === 0 && (
                  <p style={{color: 'var(--text-light)', fontSize: '0.9rem'}}>No categories yet</p>
                )}
              </div>
            </aside>

            <div style={{flex: 1, minWidth: 0}}>
              <div className="card" style={{padding: '24px', marginBottom: '24px'}}>
                <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center'}}>
                  <div style={{flex: 1, minWidth: '200px'}}>
                    <label htmlFor="search" className="visually-hidden">Search products</label>
                    <input
                      id="search"
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="form-input"
                      style={{maxWidth: '400px'}}
                    />
                  </div>
                  <span style={{color: 'var(--text-light)', whiteSpace: 'nowrap'}}>
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                  </span>
                </div>
              </div>

              {loading ? (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px'}}>
                  {[1,2,3,4,5,6].map(i => (
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
              ) : filteredProducts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <h3 className="empty-state-title">No products found</h3>
                  <p className="empty-state-text">
                    {searchQuery || selectedCategory 
                      ? 'Try adjusting your filters or search terms'
                      : 'No products available at the moment'}
                  </p>
                  {(searchQuery || selectedCategory) && (
                    <button onClick={() => { setSearchQuery(''); setSelectedCategory(null); }} className="btn btn-outline mt-2">
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px'}}>
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}