import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Contact() {
  const [contactInfo, setContactInfo] = useState({
    email: 'contact@crochetcreations.com',
    phone: '+91 98765 43210',
    instagram: '@crochetcreations',
    address: '123 Crochet Lane, Craft City, India'
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/admin/settings/public').then(res => {
      const s = res.data.settings || {};
      setContactInfo(prev => ({
        email: s.contact_email || prev.email,
        phone: s.contact_phone || prev.phone,
        instagram: s.contact_instagram || prev.instagram,
        address: s.contact_address || prev.address
      }));
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setSubmitting(false);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div>
      <header className="page-header">
        <div className="container">
          <h1 className="page-title">Contact Us</h1>
          <p className="page-subtitle">We'd love to hear from you</p>
        </div>
      </header>

      <section className="section">
        <div className="container" style={{maxWidth: '1000px'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px'}}>

            <div>
              <h2 style={{fontSize: '1.5rem', marginBottom: '24px'}}>Get in Touch</h2>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px'}}>
                <a href={`mailto:${contactInfo.email}`} className="card" style={{padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'inherit', transition: 'var(--transition)'}} onMouseOver={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow)'}>
                  <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--primary)', flexShrink: 0}}>📧</div>
                  <div>
                    <h3 style={{fontSize: '1rem', marginBottom: '4px'}}>Email Us</h3>
                    <p style={{color: 'var(--text-light)'}}>{contactInfo.email}</p>
                  </div>
                </a>

                <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className="card" style={{padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'inherit', transition: 'var(--transition)'}} onMouseOver={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow)'}>
                  <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--primary)', flexShrink: 0}}>📞</div>
                  <div>
                    <h3 style={{fontSize: '1rem', marginBottom: '4px'}}>Call Us</h3>
                    <p style={{color: 'var(--text-light)'}}>{contactInfo.phone}</p>
                  </div>
                </a>

                <a href={`https://instagram.com/${contactInfo.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="card" style={{padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'inherit', transition: 'var(--transition)'}} onMouseOver={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow)'}>
                  <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white', flexShrink: 0}}>📷</div>
                  <div>
                    <h3 style={{fontSize: '1rem', marginBottom: '4px'}}>Instagram</h3>
                    <p style={{color: 'var(--text-light)'}}>{contactInfo.instagram}</p>
                  </div>
                </a>

                <div className="card" style={{padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px'}}>
                  <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--primary)', flexShrink: 0}}>📍</div>
                  <div>
                    <h3 style={{fontSize: '1rem', marginBottom: '4px'}}>Visit Us</h3>
                    <p style={{color: 'var(--text-light)', lineHeight: 1.6}}>{contactInfo.address}</p>
                  </div>
                </div>
              </div>

              <div className="card" style={{padding: '24px', background: 'var(--secondary)'}}>
                <h3 style={{marginBottom: '12px'}}>Business Hours</h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.95rem'}}>
                  <span>Monday - Friday</span>
                  <span style={{textAlign: 'right', fontWeight: 500}}>9:00 AM - 6:00 PM</span>
                  <span>Saturday</span>
                  <span style={{textAlign: 'right', fontWeight: 500}}>10:00 AM - 4:00 PM</span>
                  <span>Sunday</span>
                  <span style={{textAlign: 'right', fontWeight: 500, color: 'var(--text-muted)'}}>Closed</span>
                </div>
              </div>
            </div>

            <div>
              <div className="card" style={{padding: '32px'}}>
                <h2 style={{fontSize: '1.5rem', marginBottom: '8px'}}>Send a Message</h2>
                <p style={{color: 'var(--text-light)', marginBottom: '24px'}}>Have a question about custom orders, wholesale, or just want to say hello?</p>

                {submitted ? (
                  <div style={{textAlign: 'center', padding: '40px 20px'}}>
                    <div style={{width: '80px', height: '80px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2.5rem', color: 'var(--success)'}}>✅</div>
                    <h3 style={{marginBottom: '12px'}}>Message Sent!</h3>
                    <p style={{color: 'var(--text-light)', marginBottom: '24px'}}>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                    <button onClick={() => setSubmitted(false)} className="btn btn-outline">Send Another Message</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                      <div className="form-group">
                        <label htmlFor="name" className="form-label">Name *</label>
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
                      </div>
                      <div className="form-group">
                        <label htmlFor="email" className="form-label">Email *</label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-input"
                          required
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject" className="form-label">Subject *</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="form-input"
                        required
                        disabled={submitting}
                      >
                        <option value="">Select a topic</option>
                        <option value="general">General Inquiry</option>
                        <option value="custom">Custom Order Request</option>
                        <option value="wholesale">Wholesale / Bulk Order</option>
                        <option value="support">Order Support</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="message" className="form-label">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="form-input"
                        rows={5}
                        required
                        disabled={submitting}
                        placeholder="Tell us more about your inquiry..."
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{width: '100%', padding: '14px', fontSize: '1rem'}} disabled={submitting}>
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}