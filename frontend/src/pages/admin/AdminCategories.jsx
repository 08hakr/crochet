import { useEffect, useState } from 'react';
import { productsAPI } from '../../api/client';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', display_order: 0 });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, display_order: category.display_order });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', display_order: categories.length });
    }
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', display_order: categories.length });
    setErrors({});
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editingCategory) {
        await productsAPI.updateCategory(editingCategory.id, formData);
      } else {
        await productsAPI.createCategory(formData);
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to save category' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await productsAPI.deleteCategory(deleteConfirm);
      setDeleteConfirm(null);
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

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
          <h1 style={{fontSize: '2rem', marginBottom: '4px'}}>Categories</h1>
          <p style={{color: 'var(--text-light)'}}>Organize your products</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <span>➕</span> Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="card" style={{padding: '60px', textAlign: 'center'}}>
          <div className="empty-state-icon">📂</div>
          <h3 className="empty-state-title">No categories yet</h3>
          <p className="empty-state-text">Create categories to organize your products.</p>
          <button onClick={() => openModal()} className="btn btn-primary mt-2">Add Category</button>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{width: '60px'}}>Order</th>
                  <th>Name</th>
                  <th style={{width: '100px'}}>Products</th>
                  <th style={{width: '140px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id}>
                    <td style={{fontWeight: 600, color: 'var(--primary)'}}>{category.display_order}</td>
                    <td style={{fontWeight: 500}}>{category.name}</td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: 'var(--secondary)',
                        color: 'var(--primary)'
                      }}>
                        {category.products?.length || 0} products
                      </span>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button onClick={() => openModal(category)} className="btn btn-sm btn-outline" style={{padding: '6px 12px'}}>
                          Edit
                        </button>
                        <button onClick={() => setDeleteConfirm(category.id)} className="btn btn-sm btn-danger" style={{padding: '6px 12px'}}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
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
                <label htmlFor="name" className="form-label">Category Name *</label>
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
                <label htmlFor="display_order" className="form-label">Display Order</label>
                <input
                  id="display_order"
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  disabled={submitting}
                />
                <p className="form-help">Lower numbers appear first</p>
              </div>

              <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px'}}>
                <button type="button" onClick={closeModal} className="btn btn-secondary" disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
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
              <h2 className="modal-title">Delete Category</h2>
              <button onClick={() => setDeleteConfirm(null)} className="modal-close" aria-label="Close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <p style={{marginBottom: '24px', color: 'var(--text-light)'}}>Are you sure you want to delete this category? Products in this category will become uncategorized.</p>
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