import { Link } from 'react-router-dom';

const footerStyles = {
  background: 'var(--text)',
  color: 'var(--white)',
  padding: '60px 0 24px',
  marginTop: 'auto'
};

const gridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '40px',
  marginBottom: '40px'
};

const h3Styles = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '1.5rem',
  marginBottom: '16px',
  color: 'var(--white)'
};

const pStyles = {
  color: '#ccc',
  lineHeight: 1.7
};

const h4Styles = {
  fontSize: '1rem',
  marginBottom: '16px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: 'var(--accent)'
};

const navStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const linkStyle = {
  color: '#ccc',
  textDecoration: 'none',
  transition: 'color 0.2s'
};

const divStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  color: '#ccc'
};

const bottomStyles = {
  borderTop: '1px solid #333',
  paddingTop: '24px',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  color: '#888',
  fontSize: '0.9rem'
};

const bottomLinksStyles = {
  display: 'flex',
  gap: '24px'
};

const iconStyle = { marginRight: '8px' };

export function Footer() {
  const handleMouseOver = (e) => { e.currentTarget.style.color = 'var(--accent)'; };
  const handleMouseLeave = (e) => { e.currentTarget.style.color = '#ccc'; };
  const handleMouseOverMuted = (e) => { e.currentTarget.style.color = 'var(--accent)'; };
  const handleMouseLeaveMuted = (e) => { e.currentTarget.style.color = '#888'; };

  return (
    <footer style={footerStyles}>
      <div className="container">
        <div style={gridStyles}>
          <div>
            <h3 style={h3Styles}>
              <span style={iconStyle}>🧶</span>
              Crochet Creations
            </h3>
            <p style={pStyles}>
              Handcrafted with love. Each piece tells a story of patience, creativity, and warmth.
            </p>
          </div>

          <div>
            <h4 style={h4Styles}>Quick Links</h4>
            <nav style={navStyles}>
              <Link to="/shop" style={linkStyle} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>Shop</Link>
              <Link to="/about" style={linkStyle} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>About Us</Link>
              <Link to="/contact" style={linkStyle} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>Contact</Link>
            </nav>
          </div>

          <div>
            <h4 style={h4Styles}>Customer Service</h4>
            <nav style={navStyles}>
              <a href="#" style={linkStyle} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>Shipping Info</a>
              <a href="#" style={linkStyle} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>Returns & Exchanges</a>
              <a href="#" style={linkStyle} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>FAQ</a>
            </nav>
          </div>

          <div>
            <h4 style={h4Styles}>Connect</h4>
            <div style={divStyles}>
              <a href="#" style={linkStyle} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>Instagram</a>
              <a href="#" style={linkStyle} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>Facebook</a>
              <a href="#" style={linkStyle} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>Pinterest</a>
            </div>
          </div>
        </div>

        <div style={bottomStyles}>
          <p>&copy; {new Date().getFullYear()} Crochet Creations. All rights reserved.</p>
          <div style={bottomLinksStyles}>
            <a href="#" style={{color: '#888', textDecoration: 'none'}} onMouseOver={handleMouseOverMuted} onMouseLeave={handleMouseLeaveMuted}>Privacy Policy</a>
            <a href="#" style={{color: '#888', textDecoration: 'none'}} onMouseOver={handleMouseOverMuted} onMouseLeave={handleMouseLeaveMuted}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}