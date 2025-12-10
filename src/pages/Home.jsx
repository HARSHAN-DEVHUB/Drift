import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productService } from "../services/productService";
import { bannerService } from "../services/bannerService";
import { useCart } from "../components/CartProvider";
import { useWishlist } from "../contexts/WishlistContext";
import { useRecentlyViewed } from "../contexts/RecentlyViewedContext";
import { useToast } from "../contexts/ToastContext";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { recentlyViewed } = useRecentlyViewed();
  const toast = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, bannersData] = await Promise.all([
          productService.getAllProducts(),
          bannerService.getActiveBanners()
        ]);
        
        setProducts(productsData);
        setBanners(bannersData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const toggleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.info('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist!');
    }
  };

  const quickAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addItem(product);
      toast.success(`${product.title} added to cart!`);
    } else {
      toast.error('This product is out of stock');
    }
  };

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <span className="stock-badge out-of-stock">Out of Stock</span>;
    } else if (stock < 10) {
      return <span className="stock-badge low-stock">Only {stock} left</span>;
    }
    return <span className="stock-badge in-stock">In Stock</span>;
  };

  const renderProductCard = (p) => (
    <div key={p.id} className="amazon-product-card">
      <div className="amazon-product-image-wrapper">
        <Link to={`/products/${p.id}`}>
          <img src={p.images?.[0] || p.image} alt={p.title} />
        </Link>
        {p.isFeatured && <span className="featured-badge">✨ Featured</span>}
        {p.isTrending && <span className="trending-badge">🔥 Trending</span>}
        {getStockBadge(p.stock)}
        <button
          className="wishlist-icon-btn"
          onClick={(e) => toggleWishlist(e, p)}
          style={{
            background: isInWishlist(p.id) ? '#e71d36' : 'rgba(255,255,255,0.9)',
            color: isInWishlist(p.id) ? 'white' : '#e71d36'
          }}
        >
          {isInWishlist(p.id) ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="amazon-product-info">
        <div className="amazon-product-category">{p.category}</div>
        <div className="amazon-product-title"><Link to={`/products/${p.id}`}>{p.title}</Link></div>
        <div className="amazon-product-rating">
          {'★'.repeat(Math.round(p.rating || 0))} 
          <span className="rating-number">{(p.rating || 0).toFixed(1)}</span>
        </div>
        <div className="amazon-product-price">
          {p.mrp && p.mrp > p.price && (
            <span className="mrp">₹{p.mrp.toFixed(2)}</span>
          )}
          <span className="currency">₹</span>{(p.price || 0).toFixed(2)}
          {p.mrp && p.mrp > p.price && (
            <span className="discount-badge">
              {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% OFF
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button 
            className="primary-button" 
            style={{ flex: 1, padding: '0.65rem 1rem', fontSize: '0.85rem' }}
            onClick={(e) => quickAddToCart(e, p)}
            disabled={p.stock === 0}
          >
            {p.stock === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
          </button>
          <Link 
            className="secondary-button" 
            to={`/products/${p.id}`}
            style={{ flex: 1, padding: '0.65rem 1rem', fontSize: '0.85rem', textAlign: 'center' }}
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="amazon-grid-section">
      <div className="amazon-hero">
        <div className="amazon-hero-banner">
          <div className="amazon-hero-text">
            <h1>Discover Premium Electronics at DRIFT ENTERPRISES</h1>
            <p>Fast delivery, curated products, and unbeatable deals on the latest tech.</p>
            <Link to="/products" className="amazon-hero-button">🛍️ Shop Now</Link>
          </div>
        </div>
      </div>

      {banners.length > 0 && (
        <div className="full-screen-slideshow">
          {banners.map((banner, index) => (
            <img
              key={banner.id}
              src={banner.imageUrl}
              alt={banner.title}
              style={{
                display: index === currentBanner || index === (currentBanner + 1) % banners.length ? 'block' : 'none',
                opacity: index === currentBanner ? 1 : 0.5
              }}
            />
          ))}
        </div>
      )}

      <section style={{ marginTop: "3rem", marginBottom: "3rem" }}>
        <h2 style={{ marginBottom: "1.5rem", fontSize: "2rem", fontWeight: "900", color: "#1a1a1a", letterSpacing: "-0.5px" }}>✨ Featured Products</h2>
        <div className="amazon-product-grid">
          {(products.filter(p => p.isFeatured).length > 0 
            ? products.filter(p => p.isFeatured).slice(0, 6)
            : products.slice(0, 6)
          ).map(renderProductCard)}
        </div>
      </section>

      {products.filter(p => p.isTrending).length > 0 && (
        <section style={{ marginTop: "3rem", marginBottom: "3rem" }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "2rem", fontWeight: "900", color: "#1a1a1a", letterSpacing: "-0.5px" }}>🔥 Trending Products</h2>
          <p style={{ marginBottom: "1.5rem", fontSize: "1.1rem", color: "#666" }}>Most popular items right now</p>
          <div className="amazon-product-grid">
            {products.filter(p => p.isTrending).slice(0, 6).map(renderProductCard)}
          </div>
        </section>
      )}

      {recentlyViewed && recentlyViewed.length > 0 && (
        <section style={{ marginTop: "3rem", marginBottom: "3rem" }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "2rem", fontWeight: "900", color: "#1a1a1a", letterSpacing: "-0.5px" }}>👀 Recently Viewed</h2>
          <p style={{ marginBottom: "1.5rem", fontSize: "1.1rem", color: "#666" }}>Continue where you left off</p>
          <div className="amazon-product-grid">
            {recentlyViewed.slice(0, 6).map(p => (
              <div key={p.id} className="amazon-product-card">
                <div className="amazon-product-image-wrapper">
                  <Link to={`/products/${p.id}`}>
                    <img src={p.images?.[0] || p.image} alt={p.title} />
                  </Link>
                  {getStockBadge(p.stock)}
                  <button
                    className="wishlist-icon-btn"
                    onClick={(e) => toggleWishlist(e, p)}
                    style={{
                      background: isInWishlist(p.id) ? '#e71d36' : 'rgba(255,255,255,0.9)',
                      color: isInWishlist(p.id) ? 'white' : '#e71d36'
                    }}
                  >
                    {isInWishlist(p.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <div className="amazon-product-info">
                  <div className="amazon-product-category">{p.category}</div>
                  <div className="amazon-product-title"><Link to={`/products/${p.id}`}>{p.title}</Link></div>
                  <div className="amazon-product-rating">
                    {'★'.repeat(Math.round(p.rating || 0))} 
                    <span className="rating-number">{(p.rating || 0).toFixed(1)}</span>
                  </div>
                  <div className="amazon-product-price">
                    <span className="currency">₹</span>{(p.price || 0).toFixed(2)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button 
                      className="primary-button" 
                      style={{ flex: 1, padding: '0.65rem 1rem', fontSize: '0.85rem' }}
                      onClick={(e) => quickAddToCart(e, p)}
                      disabled={p.stock === 0}
                    >
                      {p.stock === 0 ? '❌ Out of Stock' : '🛒 Add'}
                    </button>
                    <Link 
                      className="secondary-button" 
                      to={`/products/${p.id}`}
                      style={{ flex: 1, padding: '0.65rem 1rem', fontSize: '0.85rem', textAlign: 'center' }}
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
