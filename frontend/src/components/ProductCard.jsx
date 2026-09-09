import { Link } from 'react-router-dom';

export function ProductCard({ product, onAddToCart }) {
  const imageUrl = product.image 
    ? product.image 
    : product.image_blob 
      ? `data:${product.image_mime};base64,${product.image_blob}` 
      : null;

  return (
    <article className="card product-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <Link to={`/product/${product.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
        <div className="product-image" style={{
          aspectRatio: '1',
          overflow: 'hidden',
          position: 'relative',
          background: 'var(--secondary)'
        }}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={product.name}
              className="image-preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.4s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem'
            }}>
              🧶
            </div>
          )}
          {product.stock === 0 && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}>
              Out of Stock
            </div>
          )}
        </div>
        
        <div className="product-info" style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}>
          {product.category_name && (
            <span className="badge" style={{
              background: 'var(--secondary)',
              color: 'var(--primary)',
              alignSelf: 'flex-start',
              marginBottom: '8px',
              fontSize: '0.7rem'
            }}>
              {product.category_name}
            </span>
          )}
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            marginBottom: '8px',
            color: 'var(--text)',
            lineHeight: 1.4
          }}>
            {product.name}
          </h3>
          {product.description && (
            <p style={{
              color: 'var(--text-light)',
              fontSize: '0.9rem',
              marginBottom: '12px',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {product.description}
            </p>
          )}
        </div>
      </Link>

      <div className="product-footer" style={{
        padding: '0 20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <span className="price" style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--primary)',
          fontFamily: "'Playfair Display', serif"
        }}>
          ₹{product.price.toFixed(2)}
        </span>
        <button
          onClick={() => onAddToCart?.(product.id)}
          disabled={product.stock === 0}
          className="btn btn-primary btn-sm"
          style={{flex: 1, maxWidth: 140}}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}