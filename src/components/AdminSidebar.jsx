import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen, isMobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: '🏠',
      path: '/admin',
      color: '#e71d36'
    },
    {
      id: 'homepage',
      title: 'Homepage Manager',
      icon: '🎨',
      path: '/admin/homepage',
      color: '#e71d36'
    },
    {
      id: 'products',
      title: 'Product Management',
      icon: '📦',
      path: '/admin/products',
      color: '#e71d36'
    },
    {
      id: 'stock',
      title: 'Stock Management',
      icon: '📊',
      path: '/admin/stock',
      color: '#e71d36'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: '📈',
      path: '/admin/analytics',
      color: '#e71d36'
    },
    {
      id: 'orders',
      title: 'Order Management',
      icon: '🛒',
      path: '/admin/orders',
      color: '#e71d36'
    },
    {
      id: 'customers',
      title: 'Customer Management',
      icon: '👥',
      path: '/admin/customers',
      color: '#e71d36'
    },
    {
      id: 'reviews',
      title: 'Reviews Management',
      icon: '⭐',
      path: '/admin/reviews',
      color: '#e71d36'
    },
    {
      id: 'revenue',
      title: 'Revenue Management',
      icon: '💰',
      path: '/admin/revenue',
      color: '#e71d36'
    },
    {
      id: 'activity',
      title: 'Activity Logs',
      icon: '🔍',
      path: '/admin/activity',
      color: '#e71d36'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      path: '/admin/settings',
      color: '#e71d36'
    }
  ];

  const handleNavClick = () => {
    if (window.innerWidth <= 1024) {
      onClose();
    }
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Admin Profile Section */}
      <div className="sidebar-header">
        <div className="admin-profile">
          <div className="profile-avatar">
            <span>{(user?.fullName || user?.email || 'A')[0].toUpperCase()}</span>
          </div>
          <div className="profile-info">
            <h3>{user?.fullName || 'Admin'}</h3>
            <p>{user?.email || 'admin@drift.com'}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={handleNavClick}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
