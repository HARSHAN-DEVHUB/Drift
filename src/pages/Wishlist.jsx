import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../components/CartProvider';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (product) => {
    addItem(product);
    removeFromWishlist(product.id);
  };

  return (
    <div className="page-shell" style={{ maxWidth: '1200px' }}>
      <h1>❤️ Your Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Your wishlist is empty</p>
          <p style={{ fontSize: '1rem', color: '#666', marginBottom: '2rem' }}>
            Save items you love to your wishlist!
          </p>
          <Link
            to="/products"
            className="primary-button"
            style={{ display: 'inline-block', padding: '1rem 3rem' }}
          >
            🛍️ Browse Products
          </Link>
        </div>
      ) : (
        <>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in your wishlist
          </p>
          <div className="amazon-product-grid">
            {wishlist.map((product) => (
              <div key={product.id} className="amazon-product-card">
                <Link to={`/products/${product.id}`} className="product-image-link">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="amazon-product-image"
                  />
                </Link>
                <div className="product-info">
                  <Link to={`/products/${product.id}`} className="product-title-link">
                    <h3 className="amazon-product-title">{product.title}</h3>
                  </Link>
                  {product.brand && (
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {product.brand}
                    </p>
                  )}
                  <p className="amazon-product-price">
                    <span className="currency">₹</span>
                    {product.price?.toLocaleString()}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="primary-button"
                      style={{ width: '100%', padding: '0.75rem' }}
                    >
                      🛒 Move to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
