import React from 'react';
import './PlaceholderPage.css';

const AdminSettings = () => (
  <div className="placeholder-page">
    <div className="placeholder-header">
      <h1>⚙️ Settings</h1>
      <p>Manage site settings, admin profile, and system configuration</p>
    </div>
    <div className="placeholder-content">
      <div className="feature-list">
        <div className="feature-item">✅ Admin Profile Management</div>
        <div className="feature-item">✅ Site Settings & Configuration</div>
        <div className="feature-item">✅ Email Templates</div>
        <div className="feature-item">✅ Shipping Methods & Rates</div>
        <div className="feature-item">✅ Payment Gateway Settings</div>
      </div>
      <p className="coming-soon">🚀 Coming Soon!</p>
    </div>
  </div>
);

export default AdminSettings;
