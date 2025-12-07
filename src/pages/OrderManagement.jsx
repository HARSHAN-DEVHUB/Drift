import React, { useState } from 'react';
import './OrderManagement.css';

const OrderManagement = () => {
  // Mock orders data (replace with Firebase later)
  const [orders] = useState([
    { id: '001', customer: 'John Doe', email: 'john@example.com', total: 2500, status: 'pending', date: '2025-12-06', items: 3 },
    { id: '002', customer: 'Jane Smith', email: 'jane@example.com', total: 5000, status: 'shipped', date: '2025-12-05', items: 2 },
    { id: '003', customer: 'Bob Johnson', email: 'bob@example.com', total: 1500, status: 'delivered', date: '2025-12-04', items: 1 },
  ]);

  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const updateOrderStatus = (orderId, newStatus) => {
    console.log(`Update order ${orderId} to ${newStatus}`);
    // Implement Firebase update here
  };

  return (
    <div className="order-management">
      <div className="page-header">
        <div>
          <h1>🛒 Order Management</h1>
          <p>View and manage all customer orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">📦</div><div><h3>Total Orders</h3><p className="stat-value">{orders.length}</p></div></div>
        <div className="stat-card"><div className="stat-icon">⏳</div><div><h3>Pending</h3><p className="stat-value">{orders.filter(o => o.status === 'pending').length}</p></div></div>
        <div className="stat-card"><div className="stat-icon">🚚</div><div><h3>Shipped</h3><p className="stat-value">{orders.filter(o => o.status === 'shipped').length}</p></div></div>
        <div className="stat-card"><div className="stat-icon">✅</div><div><h3>Delivered</h3><p className="stat-value">{orders.filter(o => o.status === 'delivered').length}</p></div></div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td className="order-id">#{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.email}</td>
                <td>{order.date}</td>
                <td>{order.items}</td>
                <td className="total">₹{order.total.toLocaleString()}</td>
                <td>
                  <select 
                    value={order.status} 
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className={`status-select ${order.status}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="View Details">👁️</button>
                    <button className="btn-icon" title="Print Invoice">🖨️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
