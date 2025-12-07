import React, { useState, useEffect } from 'react';
import { bannerService } from '../services/bannerService';
import { useAuth } from '../contexts/AuthContext';
import './HomePageManager.css';

const HomePageManager = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState('banners');
  
  // Banner form
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    order: 0,
    isActive: true
  });
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await bannerService.getAllBanners();
      setBanners(data);
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 5) {
        alert('⚠️ Image size should be less than 5MB for better performance');
        return;
      }

      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();

    if (!bannerForm.title || !bannerImage) {
      alert('⚠️ Please enter a title and upload an image');
      return;
    }

    setUploading(true);
    try {
      await bannerService.createBanner(bannerForm, bannerImage);
      alert('✅ Banner uploaded successfully!');
      
      // Reset form
      setBannerForm({
        title: '',
        subtitle: '',
        buttonText: '',
        buttonLink: '',
        order: 0,
        isActive: true
      });
      setBannerImage(null);
      setBannerPreview('');
      document.getElementById('banner-file-input').value = '';
      
      loadBanners();
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('❌ Failed to upload banner. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await bannerService.deleteBanner(bannerId);
        alert('✅ Banner deleted successfully!');
        loadBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert('❌ Failed to delete banner');
      }
    }
  };

  const handleToggleBannerStatus = async (bannerId, currentStatus) => {
    try {
      await bannerService.updateBanner(bannerId, { isActive: !currentStatus });
      loadBanners();
    } catch (error) {
      console.error('Error toggling banner:', error);
      alert('❌ Failed to update banner status');
    }
  };

  const handleUpdateBannerOrder = async (bannerId, newOrder) => {
    try {
      await bannerService.updateBanner(bannerId, { order: parseInt(newOrder) });
      loadBanners();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  return (
    <div className="homepage-manager">
      <div className="manager-header">
        <h1>🏠 Homepage Content Manager</h1>
        <p>Upload and manage homepage banners, images, and featured content</p>
      </div>

      {/* Section Tabs */}
      <div className="section-tabs">
        <button
          className={activeSection === 'banners' ? 'active' : ''}
          onClick={() => setActiveSection('banners')}
        >
          🎨 Carousel Banners
        </button>
        <button
          className={activeSection === 'hero' ? 'active' : ''}
          onClick={() => setActiveSection('hero')}
        >
          🌟 Hero Section
        </button>
        <button
          className={activeSection === 'preview' ? 'active' : ''}
          onClick={() => setActiveSection('preview')}
        >
          👁️ Preview Homepage
        </button>
      </div>

      {/* Banners Section */}
      {activeSection === 'banners' && (
        <div className="content-section">
          <div className="upload-section">
            <div className="upload-card">
              <h2>📤 Upload New Banner</h2>
              <p className="helper-text">Recommended size: 1920x600px • Max size: 5MB • Format: JPG, PNG</p>
              
              <form onSubmit={handleBannerSubmit}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>📝 Banner Title *</label>
                    <input
                      type="text"
                      placeholder="e.g., Big Summer Sale 2025"
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>💬 Subtitle (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Up to 70% off on electronics"
                      value={bannerForm.subtitle}
                      onChange={(e) => setBannerForm({...bannerForm, subtitle: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>🔘 Button Text (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Shop Now"
                      value={bannerForm.buttonText}
                      onChange={(e) => setBannerForm({...bannerForm, buttonText: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>🔗 Button Link (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., /products?category=electronics"
                      value={bannerForm.buttonLink}
                      onChange={(e) => setBannerForm({...bannerForm, buttonLink: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>📊 Display Order</label>
                    <input
                      type="number"
                      min="0"
                      value={bannerForm.order}
                      onChange={(e) => setBannerForm({...bannerForm, order: e.target.value})}
                    />
                    <small>Lower numbers appear first</small>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={bannerForm.isActive}
                        onChange={(e) => setBannerForm({...bannerForm, isActive: e.target.checked})}
                      />
                      <span>✅ Active (show on homepage)</span>
                    </label>
                  </div>
                </div>

                <div className="image-upload-section">
                  <label className="file-upload-label">
                    <input
                      id="banner-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageUpload}
                      required
                    />
                    <div className="upload-button">
                      <span className="upload-icon">📁</span>
                      <span>Choose Banner Image from Computer</span>
                    </div>
                  </label>

                  {bannerPreview && (
                    <div className="image-preview-container">
                      <img src={bannerPreview} alt="Banner preview" />
                      <button
                        type="button"
                        className="remove-preview"
                        onClick={() => {
                          setBannerImage(null);
                          setBannerPreview('');
                          document.getElementById('banner-file-input').value = '';
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  )}
                </div>

                <button type="submit" className="submit-button" disabled={uploading}>
                  {uploading ? '⏳ Uploading...' : '🚀 Upload Banner'}
                </button>
              </form>
            </div>
          </div>

          {/* Existing Banners */}
          <div className="banners-list-section">
            <h2>📋 Current Banners ({banners.length})</h2>
            
            {loading ? (
              <div className="loading-state">Loading banners...</div>
            ) : banners.length === 0 ? (
              <div className="empty-state">
                <p>📦 No banners uploaded yet</p>
                <p>Upload your first banner above to get started!</p>
              </div>
            ) : (
              <div className="banners-grid">
                {banners.map((banner) => (
                  <div key={banner.id} className={`banner-card ${!banner.isActive ? 'inactive' : ''}`}>
                    <div className="banner-image-container">
                      <img src={banner.imageUrl} alt={banner.title} />
                      {!banner.isActive && (
                        <div className="inactive-badge">Inactive</div>
                      )}
                      <div className="status-badge">
                        Order: {banner.order}
                      </div>
                    </div>
                    
                    <div className="banner-details">
                      <h3>{banner.title}</h3>
                      {banner.subtitle && <p className="subtitle">{banner.subtitle}</p>}
                      {banner.buttonText && (
                        <div className="button-info">
                          <span className="button-preview">{banner.buttonText}</span>
                          {banner.buttonLink && <span className="link-text">→ {banner.buttonLink}</span>}
                        </div>
                      )}
                    </div>

                    <div className="banner-actions">
                      <input
                        type="number"
                        className="order-input"
                        value={banner.order}
                        onChange={(e) => handleUpdateBannerOrder(banner.id, e.target.value)}
                        min="0"
                      />
                      <button
                        className={`toggle-button ${banner.isActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleBannerStatus(banner.id, banner.isActive)}
                      >
                        {banner.isActive ? '✓ Active' : '✗ Inactive'}
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteBanner(banner.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      {activeSection === 'hero' && (
        <div className="content-section">
          <div className="hero-manager">
            <h2>🌟 Hero Section</h2>
            <p className="coming-soon">Coming soon! You can manage the hero banner and main call-to-action here.</p>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {activeSection === 'preview' && (
        <div className="content-section">
          <div className="preview-section">
            <h2>👁️ Homepage Preview</h2>
            <p>See how your homepage looks with current banners</p>
            <a href="/" target="_blank" rel="noopener noreferrer" className="preview-button">
              🔗 Open Homepage in New Tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePageManager;
