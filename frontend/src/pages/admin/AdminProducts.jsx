import { useEffect, useState } from 'react';
import { productsAPI } from '../../api/client';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: '',
    image: null,
    images: []
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll(),
        productsAPI.getCategories()
      ]);
      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category_id: product.category_id?.toString() || '',
        stock: product.stock.toString(),
        image: null,
        images: []
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', category_id: '', stock: '', image: null, images: [] });
    }
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', category_id: '', stock: '', image: null, images: [] });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images' && files) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...Array.from(files)] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const removeExistingImage = (imageId) => {
    if (!editingProduct) return;
    setEditingProduct(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', formData.price);
      if (formData.category_id) formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('stock', formData.stock);
      if (formData.image) formDataToSend.append('image', formData.image);
      if (editingProduct && editingProduct.images) {
        const existingIds = editingProduct.images.map(img => img.id);
        const currentIds = (editingProduct.images || []).map(img => img.id);
        if (JSON.stringify(existingIds) !== JSON.stringify(currentIds)) {
          formDataToSend.append('remove_images', 'true');
        }
      }
      formData.images.forEach(file => {
        formDataToSend.append('images', file);
      });

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, formDataToSend);
      } else {
        await productsAPI.create(formDataToSend);
      }
      closeModal();
      fetchData();
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to save product' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await productsAPI.delete(deleteConfirm);
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', padding: '60px'}}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px'}}>
        <div>
          <h1 style={{fontSize: '2rem', marginBottom: '4px'}}>Products</h1>
          <p style={{color: 'var(--text-light)'}}>Manage your product catalog</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <span>➕</span> Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="card" style={{padding: '60px', textAlign: 'center'}}>
          <div className="empty-state-icon">🧶</div>
          <h3 className="empty-state-title">No products yet</h3>
          <p className="empty-state-text">Add your first crochet creation to get started.</p>
          <button onClick={() => openModal()} className="btn btn-primary mt-2">Add Product</button>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{width: '60px'}}>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th style={{width: '100px'}}>Price</th>
                  <th style={{width: '80px'}}>Stock</th>
                  <th style={{width: '140px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  const imageUrl = product.image 
                    ? product.image 
                    : product.image_blob 
                      ? `data:${product.image_mime};base64,${product.image_blob}` 
                      : null;

                  return (
                    <tr key={product.id}>
                      <td>
                        {imageUrl ? (
                          <img src={imageUrl} alt={product.name} style={{width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover'}} />
                        ) : (
                          <div style={{width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'}}>🧶</div>
                        )}
                      </td>
                      <td style={{fontWeight: 500}}>{product.name}</td>
                      <td>{product.category_name || '—'}</td>
                      <td style={{fontWeight: 600, color: 'var(--primary)'}}>{formatCurrency(product.price)}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background: product.stock > 0 ? '#e8f5e9' : '#fdeaea',
                          color: product.stock > 0 ? 'var(--success)' : 'var(--error)'
                        }}>
                          {product.stock > 0 ? product.stock : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <div style={{display: 'flex', gap: '8px'}}>
                          <button onClick={() => openModal(product)} className="btn btn-sm btn-outline" style={{padding: '6px 12px'}}>
                            Edit
                          </button>
                          <button onClick={() => setDeleteConfirm(product.id)} className="btn btn-sm btn-danger" style={{padding: '6px 12px'}}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <div className="modal-header">
              <h2 className="modal-title">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={closeModal} className="modal-close" aria-label="Close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {errors.submit && <div className="alert alert-error" style={{marginBottom: '16px'}}>{errors.submit}</div>}

              <div className="form-group">
                <label htmlFor="name" className="form-label">Product Name *</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={submitting}
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  rows={4}
                  disabled={submitting}
                ></textarea>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className="form-group">
                  <label htmlFor="price" className="form-label">Price (₹) *</label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="form-input"
                    step="0.01"
                    min="0.01"
                    required
                    disabled={submitting}
                  />
                  {errors.price && <div className="form-error">{errors.price}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="stock" className="form-label">Stock *</label>
                  <input
                    id="stock"
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="form-input"
                    min="0"
                    required
                    disabled={submitting}
                  />
                  {errors.stock && <div className="form-error">{errors.stock}</div>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category_id" className="form-label">Category</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="form-input"
                  disabled={submitting}
                >
                  <option value="">No category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Product Images</label>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  <label className="btn btn-outline" style={{textAlign: 'center', cursor: 'pointer'}}>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      style={{display: 'none'}}
                      disabled={submitting}
                    />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{marginRight: '8px'}}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    {formData.image ? formData.image.name : 'Choose main image'}
                  </label>
                  {formData.image && (
                    <img src={URL.createObjectURL(formData.image)} alt="Preview" style={{maxWidth: '200px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)'}} />
                  )}
                  {editingProduct?.image && !formData.image && (
                    <div style={{fontSize: '0.85rem', color: 'var(--text-light)'}}>
                      Current main image will be kept unless you upload a new one.
                    </div>
                  )}

                  <label className="btn btn-outline" style={{textAlign: 'center', cursor: 'pointer', marginTop: '8px'}}>
                    <input
                      type="file"
                      name="images"
                      accept="image/*"
                      multiple
                      onChange={handleChange}
                      style={{display: 'none'}}
                      disabled={submitting}
                    />
                    + Add more images (gallery)
                  </label>

                  {editingProduct?.images?.length > 0 && (
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px'}}>
                      {editingProduct.images.map(img => (
                        <div key={img.id} style={{position: 'relative'}}>
                          <img src={img.url} alt="" style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)'}} />
                          <button type="button" onClick={() => removeExistingImage(img.id)} style={{position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--error)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.images.length > 0 && (
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px'}}>
                      {formData.images.map((file, idx) => (
                        <div key={idx} style={{position: 'relative'}}>
                          <img src={URL.createObjectURL(file)} alt="" style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '2px solid var(--primary)'}} />
                          <button type="button" onClick={() => removeImage(idx)} style={{position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--error)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px'}}>
                <button type="button" onClick={closeModal} className="btn btn-secondary" disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Product</h2>
              <button onClick={() => setDeleteConfirm(null)} className="modal-close" aria-label="Close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <p style={{marginBottom: '24px', color: 'var(--text-light)'}}>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleDelete} className="btn btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}