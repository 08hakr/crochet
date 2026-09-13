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
  const [removedImages, setRemovedImages] = useState([]);

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
    setRemovedImages([]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', category_id: '', stock: '', image: null, images: [] });
    setErrors({});
    setRemovedImages([]);
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
    const img = editingProduct.images.find(i => i.id === imageId);
    if (img) {
      setRemovedImages(prev => [...prev, imageId]);
    }
    setEditingProduct(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const removeMainImage = () => {
    setFormData(prev => ({ ...prev, image: 'REMOVE' }));
  };

  const setPrimary = (source, id) => {
    if (source === 'existing' && editingProduct) {
      const img = editingProduct.images.find(i => i.id === id);
      if (img) {
        setFormData(prev => ({ ...prev, image: null, promoteImage: id }));
        setEditingProduct(prev => ({
          ...prev,
          images: prev.images.filter(i => i.id !== id)
        }));
      }
    }
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
        if (removedImages.length > 0) {
          formDataToSend.append('remove_images', removedImages.join(','));
        }
        if (formData.promoteImage) {
          formDataToSend.append('promote_image', formData.promoteImage);
        }
        if (formData.image === 'REMOVE') {
          formDataToSend.append('remove_main_image', 'true');
        }
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

                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                    {editingProduct?.image && formData.image !== 'REMOVE' && (
                      <div style={{position: 'relative'}}>
                        <img src={editingProduct.image} alt="" style={{width: '90px', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '3px solid var(--primary)'}} />
                        <span style={{position: 'absolute', bottom: '2px', left: '2px', background: 'var(--primary)', color: 'white', fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px', fontWeight: 600}}>PRIMARY</span>
                        <button type="button" onClick={removeMainImage} style={{position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--error)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>×</button>
                      </div>
                    )}

                    {editingProduct?.images?.map(img => (
                      !removedImages.includes(img.id) && (
                        <div key={img.id} style={{position: 'relative'}}>
                          <img src={img.url} alt="" style={{width: '90px', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)'}} />
                          <button type="button" onClick={() => setPrimary('existing', img.id)} style={{position: 'absolute', bottom: '2px', left: '2px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.55rem', padding: '1px 4px', borderRadius: '4px', cursor: 'pointer', border: 'none'}}>Set Primary</button>
                          <button type="button" onClick={() => removeExistingImage(img.id)} style={{position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--error)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>×</button>
                        </div>
                      )
                    ))}

                    {formData.image && formData.image !== 'REMOVE' && (
                      <div style={{position: 'relative'}}>
                        <img src={URL.createObjectURL(formData.image)} alt="" style={{width: '90px', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '3px solid var(--primary)'}} />
                        <span style={{position: 'absolute', bottom: '2px', left: '2px', background: 'var(--primary)', color: 'white', fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px', fontWeight: 600}}>NEW PRIMARY</span>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: null }))} style={{position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--error)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>×</button>
                      </div>
                    )}

                    {formData.images.map((file, idx) => (
                      <div key={`new-${idx}`} style={{position: 'relative'}}>
                        <img src={URL.createObjectURL(file)} alt="" style={{width: '90px', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)'}} />
                        <button type="button" onClick={() => removeImage(idx)} style={{position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--error)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>×</button>
                      </div>
                    ))}
                  </div>

                  <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                    <label className="btn btn-outline" style={{textAlign: 'center', cursor: 'pointer', flex: 1}}>
                      <input type="file" name="image" accept="image/*" onChange={handleChange} style={{display: 'none'}} disabled={submitting} />
                      {editingProduct?.image && formData.image !== 'REMOVE' ? 'Replace Primary Image' : 'Upload Primary Image'}
                    </label>
                    <label className="btn btn-outline" style={{textAlign: 'center', cursor: 'pointer', flex: 1}}>
                      <input type="file" name="images" accept="image/*" multiple onChange={handleChange} style={{display: 'none'}} disabled={submitting} />
                      + Add Gallery Images
                    </label>
                  </div>
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