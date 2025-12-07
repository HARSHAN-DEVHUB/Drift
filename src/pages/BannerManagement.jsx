import React, { useState, useEffect } from 'react';
import { bannerService } from '../services/bannerService';
import { useAuth } from '../contexts/AuthContext';
import './BannerManagement.css';

const BannerManagement = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: '',
    description: '',
    link: '',
    isActive: true,
    order: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const bannersData = await bannerService.getAllBanners();
      setBanners(bannersData);
    } catch (error) {
      console.error('Error loading banners:', error);
      alert('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBanner({
      ...newBanner,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newBanner.title || !imageFile) {
      alert('Please enter a title and upload an image');
      return;
    }

    setUploading(true);

    try {
      await bannerService.createBanner(newBanner, imageFile);
      alert('✓ Banner added successfully!');
      
      // Reset form
      setNewBanner({
        title: '',
        description: '',
        link: '',
        isActive: true,
        order: 0
      });
      setImageFile(null);
      setImagePreview('');
      
      // Reload banners
      loadBanners();
    } catch (error) {
      console.error('Error adding banner:', error);
      alert('Failed to add banner. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (bannerId, currentStatus) => {
    try {
      await bannerService.updateBanner(bannerId, { isActive: !currentStatus });
      loadBanners();
    } catch (error) {
      console.error('Error toggling banner status:', error);
      alert('Failed to update banner status');
    }
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await bannerService.deleteBanner(bannerId);
        alert('Banner deleted successfully!');
        loadBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert('Failed to delete banner');
      }
    }
  };

  const handleUpdateOrder = async (bannerId, newOrder) => {
    try {
      await bannerService.updateBanner(bannerId, { order: parseInt(newOrder) });
      loadBanners();
    } catch (error) {
      console.error('Error updating banner order:', error);
      alert('Failed to update banner order');
    }
  };

  return (
    <div className="banner-management">
      <div className="page-header">
        <h1>🎨 Banner Management</h1>
        <p>Manage homepage carousel banners and promotional images</p>
      </div>

      <div className="banner-grid">
        {/* Add New Banner Form */}
        <div className="banner-form-card">
          <h2>➕ Add New Banner</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Banner Title *</label>
              <input
                type="text"
                name="title"
                value={newBanner.title}
                onChange={handleInputChange}
                placeholder="e.g., Summer Sale 2025"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={newBanner.description}
                onChange={handleInputChange}
                placeholder="Brief description of the banner"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Link URL (optional)</label>
              <input
                type="text"
                name="link"
                value={newBanner.link}
                onChange={handleInputChange}
                placeholder="/products?category=electronics"
              />
            </div>

            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                name="order"
                value={newBanner.order}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
              <small>Lower numbers appear first</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={newBanner.isActive}
                  onChange={handleInputChange}
                />
                <span>Active (show on homepage)</span>
              </label>
            </div>

            <div className="form-group">
              <label>Banner Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                required
              />
              <small>Recommended: 1920x600px, JPG or PNG</small>
            </div>

            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Banner preview" />
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={uploading}>
              {uploading ? '⏳ Uploading...' : '➕ Add Banner'}
            </button>
          </form>
        </div>

        {/* Banner List */}
        <div className="banner-list-card">
          <h2>📋 Existing Banners ({banners.length})</h2>
          
          {loading ? (
            <div className="loading">Loading banners...</div>
          ) : banners.length === 0 ? (
            <div className="empty-state">
              <p>No banners yet. Add your first banner!</p>
            </div>
          ) : (
            <div className="banner-list">
              {banners.map((banner) => (
                <div key={banner.id} className={`banner-item ${!banner.isActive ? 'inactive' : ''}`}>
                  <div className="banner-preview">
                    <img src={banner.imageUrl} alt={banner.title} />
                    {!banner.isActive && <div className="inactive-overlay">Inactive</div>}
                  </div>
                  
                  <div className="banner-info">
                    <h3>{banner.title}</h3>
                    {banner.description && <p>{banner.description}</p>}
                    {banner.link && (
                      <div className="banner-link">
                        <span>🔗 Link: </span>
                        <a href={banner.link} target="_blank" rel="noopener noreferrer">
                          {banner.link}
                        </a>
                      </div>
                    )}
                    
                    <div className="banner-meta">
                      <span className="order-badge">Order: {banner.order}</span>
                      <span className={`status-badge ${banner.isActive ? 'active' : 'inactive'}`}>
                        {banner.isActive ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="banner-actions">
                    <div className="order-control">
                      <label>Order:</label>
                      <input
                        type="number"
                        value={banner.order}
                        onChange={(e) => handleUpdateOrder(banner.id, e.target.value)}
                        min="0"
                      />
                    </div>
                    
                    <button
                      className="toggle-btn"
                      onClick={() => handleToggleActive(banner.id, banner.isActive)}
                    >
                      {banner.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(banner.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerManagement;
