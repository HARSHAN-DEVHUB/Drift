import React from 'react';
import './PlaceholderPage.css';

const ReviewsManagement = () => (
  <div className="placeholder-page">
    <div className="placeholder-header">
      <h1>⭐ Reviews Management</h1>
      <p>Moderate, approve, and respond to customer product reviews</p>
    </div>
    <div className="placeholder-content">
      <div className="feature-list">
        <div className="feature-item">✅ View All Reviews</div>
        <div className="feature-item">✅ Review Moderation (Approve/Reject)</div>
        <div className="feature-item">✅ Respond to Reviews</div>
        <div className="feature-item">✅ Filter by Rating/Product</div>
        <div className="feature-item">✅ Review Analytics</div>
      </div>
      <p className="coming-soon">🚀 Coming Soon!</p>
    </div>
  </div>
);

export default ReviewsManagement;
