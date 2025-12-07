import React from 'react';
import './PlaceholderPage.css';

const ActivityLogs = () => (
  <div className="placeholder-page">
    <div className="placeholder-header">
      <h1>🔍 Activity Logs</h1>
      <p>Audit trail of all admin and customer activities</p>
    </div>
    <div className="placeholder-content">
      <div className="feature-list">
        <div className="feature-item">✅ Complete Audit Trail</div>
        <div className="feature-item">✅ Login History (Admin & Customers)</div>
        <div className="feature-item">✅ Activity Filtering by Date/User/Action</div>
        <div className="feature-item">✅ Export Activity Reports</div>
        <div className="feature-item">✅ Real-time Activity Monitoring</div>
      </div>
      <p className="coming-soon">🚀 Coming Soon!</p>
    </div>
  </div>
);

export default ActivityLogs;
