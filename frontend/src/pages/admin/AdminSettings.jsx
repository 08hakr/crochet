import { useEffect, useState } from 'react';
import { adminAPI, productsAPI } from '../../api/client';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    hero_title: '',
    hero_subtitle: '',
    about_text: '',
    contact_info: '',
    qr_image: null,
    qr_preview: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [adminRes, productsRes] = await Promise.all([
        adminAPI.getSettings(),
        productsAPI.getAll()
      ]);
      const adminSettings = adminRes.data.settings || {};
      const productSettings = productsRes.data.settings || {};
      const merged = { ...adminSettings, ...productSettings };
      
      setSettings({
        hero_title: merged.hero_title || 'Handcrafted Crochet Creations',
        hero_subtitle: merged.hero_subtitle || 'Beautiful handmade items made with love',
        about_text: merged.about_text || 'Welcome to our crochet shop! We create unique, handcrafted crochet items including amigurumi, wearables, and home decor. Each piece is made with care and attention to detail.',
        contact_info: merged.contact_info || 'Email: contact@crochetcreations.com\nPhone: +91 98765 43210\nInstagram: @crochetcreations',
        qr_image: null,
        qr_preview: merged.qr_image_blob ? `data:${merged.qr_image_mime || 'image/png'};base64,${merged.qr_image_blob}` : null
      });
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleQRChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'QR image must be less than 2MB' });
        return;
      }
      setSettings(prev => ({ ...prev, qr_image: file }));
      const reader = new FileReader();
      reader.onload = (e) => setSettings(prev => ({ ...prev, qr_preview: e.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSaveContent = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await adminAPI.updateSettings({
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        about_text: settings.about_text,
        contact_info: settings.contact_info
      });
      setMessage({ type: 'success', text: 'Content settings saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadQR = async () => {
    if (!settings.qr_image) {
      setMessage({ type: 'error', text: 'Please select a QR code image' });
      return;
    }

    setUploadingQR(true);
    setMessage({ type: '', text: '' });
    try {
      const formData = new FormData();
      formData.append('qr_image', settings.qr_image);
      await adminAPI.uploadQR(formData);
      setMessage({ type: 'success', text: 'QR code uploaded successfully!' });
      setSettings(prev => ({ ...prev, qr_preview: URL.createObjectURL(settings.qr_image), qr_image: null }));
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload QR code' });
    } finally {
      setUploadingQR(false);
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
          <h1 style={{fontSize: '2rem', marginBottom: '4px'}}>Settings</h1>
          <p style={{color: 'var(--text-light)'}}>Customize your website content</p>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`} style={{marginBottom: '24px'}}>
          {message.text}
        </div>
      )}

      <div className="card" style={{overflow: 'hidden'}}>
        <div style={{display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto'}}>
          {[
            { id: 'content', label: 'Content', icon: '📝' },
            { id: 'qr', label: 'Payment QR', icon: '📱' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'var(--white)' : 'var(--text)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                cursor: 'pointer',
                borderBottom: `3px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`,
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'content' && (
          <div style={{padding: '32px'}}>
            <h2 style={{fontSize: '1.3rem', marginBottom: '8px'}}>Homepage Hero</h2>
            <p style={{color: 'var(--text-light)', marginBottom: '24px'}}>Content displayed on the homepage hero section</p>

            <div className="form-group">
              <label htmlFor="hero_title" className="form-label">Hero Title *</label>
              <input
                id="hero_title"
                type="text"
                name="hero_title"
                value={settings.hero_title}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="hero_subtitle" className="form-label">Hero Subtitle *</label>
              <input
                id="hero_subtitle"
                type="text"
                name="hero_subtitle"
                value={settings.hero_subtitle}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <hr style={{border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0'}} />

            <h2 style={{fontSize: '1.3rem', marginBottom: '8px'}}>About Page</h2>
            <p style={{color: 'var(--text-light)', marginBottom: '24px'}}>Content for the About Us page</p>

            <div className="form-group">
              <label htmlFor="about_text" className="form-label">About Text</label>
              <textarea
                id="about_text"
                name="about_text"
                value={settings.about_text}
                onChange={handleChange}
                className="form-input"
                rows={8}
                style={{fontFamily: 'inherit'}}
              ></textarea>
            </div>

            <hr style={{border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0'}} />

            <h2 style={{fontSize: '1.3rem', marginBottom: '8px'}}>Contact Information</h2>
            <p style={{color: 'var(--text-light)', marginBottom: '24px'}}>Displayed on the Contact page and footer (one per line)</p>

            <div className="form-group">
              <label htmlFor="contact_info" className="form-label">Contact Info</label>
              <textarea
                id="contact_info"
                name="contact_info"
                value={settings.contact_info}
                onChange={handleChange}
                className="form-input"
                rows={6}
                style={{fontFamily: 'monospace'}}
              ></textarea>
              <p className="form-help">Format: Label: Value (one per line)</p>
            </div>

            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px'}}>
              <button onClick={handleSaveContent} className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Content'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div style={{padding: '32px'}}>
            <h2 style={{fontSize: '1.3rem', marginBottom: '8px'}}>Payment QR Code</h2>
            <p style={{color: 'var(--text-light)', marginBottom: '24px'}}>Upload the UPI QR code image that customers will scan to pay</p>

            <div className="card" style={{padding: '24px', marginBottom: '24px', background: 'var(--background)'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start'}}>
                <div>
                  <div className="form-group" style={{marginBottom: 0}}>
                    <label className="form-label">QR Code Image</label>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                      <label className="btn btn-outline" style={{textAlign: 'center', cursor: 'pointer'}}>
                        <input
                          type="file"
                          name="qr_image"
                          accept="image/*"
                          onChange={handleQRChange}
                          style={{display: 'none'}}
                          disabled={uploadingQR}
                        />
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{marginRight: '8px'}}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        {settings.qr_image ? settings.qr_image.name : 'Choose QR code image (PNG, JPG)'}
                      </label>
                      {settings.qr_image && (
                        <button type="button" onClick={() => setSettings(prev => ({ ...prev, qr_image: null, qr_preview: null }))} className="btn btn-sm btn-ghost" style={{width: 'fit-content'}}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label">Preview</label>
                  {settings.qr_preview ? (
                    <img src={settings.qr_preview} alt="QR code preview" style={{maxWidth: '100%', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', background: 'white', padding: '16px'}} />
                  ) : (
                    <div style={{aspectRatio: '1', borderRadius: 'var(--radius-sm)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>
                      No QR code uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card" style={{padding: '24px', background: '#fff3e0', border: '1px solid #ffcc80'}}>
              <h3 style={{marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px'}}>⚠️ Important</h3>
              <ul style={{color: '#e65100', lineHeight: 1.8, paddingLeft: '20px'}}>
                <li>Upload a clear, high-contrast QR code image</li>
                <li>Test the QR code with multiple UPI apps before publishing</li>
                <li>Recommended size: 400x400px or larger, square aspect ratio</li>
                <li>File size limit: 2MB</li>
                <li>Customers will see this QR code at checkout</li>
              </ul>
            </div>

            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-start', marginTop: '24px'}}>
              <button onClick={handleUploadQR} className="btn btn-primary" disabled={uploadingQR || !settings.qr_image}>
                {uploadingQR ? 'Uploading...' : 'Upload QR Code'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}