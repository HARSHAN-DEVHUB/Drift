import React from 'react';
import './PlaceholderPage.css';

const CustomerManagement = () => (
  <div className="placeholder-page">
    <div className="placeholder-header">
      <h1>👥 Customer Management</h1>
      <p>View all customers, manage roles, and track customer activity</p>
    </div>
    <div className="placeholder-content">
      <div className="feature-list">
        <div className="feature-item">✅ Customer List</div>
        <div className="feature-item">✅ Customer Segmentation</div>
        <div className="feature-item">✅ Role Management (Admin/Customer)</div>
        <div className="feature-item">✅ Customer Communication</div>
        <div className="feature-item">✅ Order History per Customer</div>
      </div>
      <p className="coming-soon">🚀 Coming Soon!</p>
    </div>
  </div>
);

export default CustomerManagement;
