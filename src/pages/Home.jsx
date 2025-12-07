import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productService } from "../services/productService";
import { bannerService } from "../services/bannerService";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

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
          {products.filter(p => p.isFeatured).slice(0, 6).length > 0 ? (
            products.filter(p => p.isFeatured).slice(0, 6).map((p) => (
              <div key={p.id} className="amazon-product-card">
                <div className="amazon-product-image-wrapper">
                  <img src={p.images?.[0] || p.image} alt={p.title} />
                  <span className="featured-badge">✨ Featured</span>
                </div>
                <div className="amazon-product-info">
                  <div className="amazon-product-category">{p.category}</div>
                  <div className="amazon-product-title"><Link to={`/products/${p.id}`}>{p.title}</Link></div>
                  <div className="amazon-product-rating">{'★'.repeat(Math.round(p.rating))} <span className="rating-number">{p.rating.toFixed(1)}</span></div>
                  <div className="amazon-product-price"><span className="currency">₹</span>{p.price.toFixed(2)}</div>
                  <Link className="primary-button" to={`/products/${p.id}`}>View Details</Link>
                </div>
              </div>
            ))
          ) : (
            products.slice(0, 6).map((p) => (
              <div key={p.id} className="amazon-product-card">
                <div className="amazon-product-image-wrapper">
                  <img src={p.images?.[0] || p.image} alt={p.title} />
                </div>
                <div className="amazon-product-info">
                  <div className="amazon-product-category">{p.category}</div>
                  <div className="amazon-product-title"><Link to={`/products/${p.id}`}>{p.title}</Link></div>
                  <div className="amazon-product-rating">{'★'.repeat(Math.round(p.rating))} <span className="rating-number">{p.rating.toFixed(1)}</span></div>
                  <div className="amazon-product-price"><span className="currency">₹</span>{p.price.toFixed(2)}</div>
                  <Link className="primary-button" to={`/products/${p.id}`}>View Details</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {products.filter(p => p.isTrending).length > 0 && (
        <section style={{ marginTop: "3rem", marginBottom: "3rem" }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "2rem", fontWeight: "900", color: "#1a1a1a", letterSpacing: "-0.5px" }}>🔥 Trending Products</h2>
          <p style={{ marginBottom: "1.5rem", fontSize: "1.1rem", color: "#666" }}>Most popular items right now</p>
          <div className="amazon-product-grid">
            {products.filter(p => p.isTrending).slice(0, 6).map((p) => (
              <div key={p.id} className="amazon-product-card">
                <div className="amazon-product-image-wrapper">
                  <img src={p.images?.[0] || p.image} alt={p.title} />
                  <span className="trending-badge">🔥 Trending</span>
                </div>
                <div className="amazon-product-info">
                  <div className="amazon-product-category">{p.category}</div>
                  <div className="amazon-product-title"><Link to={`/products/${p.id}`}>{p.title}</Link></div>
                  <div className="amazon-product-rating">{'★'.repeat(Math.round(p.rating))} <span className="rating-number">{p.rating.toFixed(1)}</span></div>
                  <div className="amazon-product-price"><span className="currency">₹</span>{p.price.toFixed(2)}</div>
                  <Link className="primary-button" to={`/products/${p.id}`}>View Details</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
        }
