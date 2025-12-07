import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();

  const dashboardCards = [
    {
      title: 'Homepage Manager',
      description: '🔥 Upload banners and manage homepage content from your computer.',
      icon: '🏠',
      link: '/admin/homepage',
      color: '#e71d36',
      highlight: true
    },
    {
      title: 'Product Management',
      description: 'Add, edit, delete products. Mark trending/featured items.',
      icon: '📦',
      link: '/admin/products',
      color: '#e71d36'
    },
    {
      title: 'Banner Management',
      description: 'Manage homepage carousel banners and promotional images.',
      icon: '🎨',
      link: '/admin/banners',
      color: '#e71d36'
    },
    {
      title: 'Order Management',
      description: 'View and manage all customer orders.',
      icon: '📋',
      link: '/admin/orders',
      color: '#e71d36'
    },
    {
      title: 'Stock Management',
      description: 'Track inventory, stock levels, and stock value.',
      icon: '📊',
      link: '/admin/stock',
      color: '#e71d36'
    },
    {
      title: 'Customer Management',
      description: 'Manage customers and admin users.',
      icon: '👥',
      link: '/admin/customers',
      color: '#e71d36'
    },
    {
      title: 'Analytics',
      description: 'View sales reports and website analytics.',
      icon: '📈',
      link: '/admin/analytics',
      color: '#e71d36'
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.fullName || user?.email || 'Admin'}!</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-icon">🛍️</span>
            <div className="stat-info">
              <h3>Total Sales</h3>
              <p className="stat-value">₹0</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div className="stat-info">
              <h3>Products</h3>
              <p className="stat-value">0</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div className="stat-info">
              <h3>Customers</h3>
              <p className="stat-value">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {dashboardCards.map((card, index) => (
          <Link 
            to={card.link} 
            key={index} 
            className={`dashboard-card ${card.highlight ? 'highlight' : ''}`}
            style={{ borderColor: card.color }}
          >
            <div className="card-icon" style={{ backgroundColor: `${card.color}20` }}>
              <span style={{ fontSize: '3rem' }}>{card.icon}</span>
            </div>
            <div className="card-content">
              <h3 style={{ color: card.color }}>{card.title}</h3>
              <p>{card.description}</p>
            </div>
            <div className="card-arrow" style={{ color: card.color }}>
              →
            </div>
          </Link>
        ))}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/products" className="action-btn add-product">
            <span>➕</span> Add New Product
          </Link>
          <Link to="/admin/homepage" className="action-btn add-banner">
            <span>🏠</span> Manage Homepage
          </Link>
          <Link to="/admin/orders" className="action-btn view-orders">
            <span>📦</span> View Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
