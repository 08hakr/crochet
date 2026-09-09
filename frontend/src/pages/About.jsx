import { useEffect, useState } from 'react';
import { productsAPI } from '../api/client';

export default function About() {
  const [aboutText, setAboutText] = useState('Welcome to our crochet shop! We create unique, handcrafted crochet items including amigurumi, wearables, and home decor. Each piece is made with care and attention to detail.');

  useEffect(() => {
    productsAPI.getAll().then(res => {
      const settings = res.data.settings;
      if (settings?.about_text) {
        setAboutText(settings.about_text);
      }
    }).catch(() => {});
  }, []);

  return (
    <div>
      <header className="page-header">
        <div className="container">
          <h1 className="page-title">Our Story</h1>
          <p className="page-subtitle">Handcrafted with passion since 2020</p>
        </div>
      </header>

      <section className="section">
        <div className="container" style={{maxWidth: '800px'}}>
          <div className="card" style={{padding: '48px'}}>
            <div style={{lineHeight: 1.8, color: 'var(--text)', fontSize: '1.05rem'}}>
              {aboutText.split('\n\n').map((paragraph, i) => (
                <p key={i} style={{marginBottom: '1.5em'}}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '40px'}}>
            <div className="card" style={{padding: '32px', textAlign: 'center'}}>
              <div style={{fontSize: '3rem', marginBottom: '16px'}}>🎯</div>
              <h3 style={{marginBottom: '12px'}}>Our Mission</h3>
              <p style={{color: 'var(--text-light)'}}>To bring warmth and joy into homes through beautifully handcrafted crochet creations.</p>
            </div>

            <div className="card" style={{padding: '32px', textAlign: 'center'}}>
              <div style={{fontSize: '3rem', marginBottom: '16px'}}>💚</div>
              <h3 style={{marginBottom: '12px'}}>Our Values</h3>
              <p style={{color: 'var(--text-light)'}}>Quality, sustainability, and love in every stitch. We believe in slow fashion and mindful making.</p>
            </div>

            <div className="card" style={{padding: '32px', textAlign: 'center'}}>
              <div style={{fontSize: '3rem', marginBottom: '16px'}}>🤝</div>
              <h3 style={{marginBottom: '12px'}}>Our Promise</h3>
              <p style={{color: 'var(--text-light)'}}>Every item is made to order with premium materials. Your satisfaction is our top priority.</p>
            </div>
          </div>

          <div className="card" style={{marginTop: '40px', padding: '48px', background: 'var(--secondary)'}}>
            <h2 style={{textAlign: 'center', marginBottom: '24px'}}>Our Process</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px'}}>
              <div style={{textAlign: 'center'}}>
                <div style={{width: '60px', height: '60px', borderRadius: '50%', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem', boxShadow: 'var(--shadow)'}}>1</div>
                <h4 style={{marginBottom: '8px'}}>Design</h4>
                <p style={{color: 'var(--text-light)', fontSize: '0.9rem'}}>Original patterns sketched and tested</p>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{width: '60px', height: '60px', borderRadius: '50%', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem', boxShadow: 'var(--shadow)'}}>2</div>
                <h4 style={{marginBottom: '8px'}}>Select Yarn</h4>
                <p style={{color: 'var(--text-light)', fontSize: '0.9rem'}}>Premium, ethically sourced materials</p>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{width: '60px', height: '60px', borderRadius: '50%', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem', boxShadow: 'var(--shadow)'}}>3</div>
                <h4 style={{marginBottom: '8px'}}>Handcraft</h4>
                <p style={{color: 'var(--text-light)', fontSize: '0.9rem'}}>Hours of careful stitching by hand</p>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{width: '60px', height: '60px', borderRadius: '50%', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem', boxShadow: 'var(--shadow)'}}>4</div>
                <h4 style={{marginBottom: '8px'}}>Quality Check</h4>
                <p style={{color: 'var(--text-light)', fontSize: '0.9rem'}}>Inspected for perfection before shipping</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}