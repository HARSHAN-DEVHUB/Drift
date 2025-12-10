import React, { useState, useEffect } from 'react';
import { ref as dbRef, get, set, update } from 'firebase/database';
import { database } from '../config/firebase';
import './OrderManagement.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const ordersRef = dbRef(database, 'orders');
      const snapshot = await get(ordersRef);
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const ordersList = Object.entries(ordersData).map(([id, data]) => {
          // Handle items as either array or object
          let itemsArray = [];
          if (Array.isArray(data.items)) {
            itemsArray = data.items;
          } else if (data.items && typeof data.items === 'object') {
            itemsArray = Object.values(data.items);
          }
          
          return {
            id,
            ...data,
            items: itemsArray,
            itemsCount: itemsArray.length,
            customer: data.shippingAddress?.firstName 
              ? `${data.shippingAddress.firstName} ${data.shippingAddress.lastName || ''}`.trim()
              : data.shippingAddress?.name || 'N/A',
            email: data.customerEmail || 'N/A',
            date: data.placedAt ? new Date(data.placedAt).toLocaleDateString() : 'N/A'
          };
        });
        setOrders(ordersList.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)));
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    // Enforce workflow: pending -> shipped -> delivered or cancelled
    const order = orders.find(o => o.id === orderId);
    const validTransitions = {
      pending: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: []
    };

    if (!validTransitions[order.status]?.includes(newStatus)) {
      alert(`❌ Cannot change from ${order.status} to ${newStatus}`);
      return;
    }

    try {
      const orderRef = dbRef(database, `orders/${orderId}`);
      await update(orderRef, { status: newStatus, updatedAt: new Date().toISOString() });
      alert(`✅ Order status updated to ${newStatus}!`);
      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('❌ Failed to update order status');
    }
  };

  const getValidStatusOptions = (currentStatus) => {
    const validTransitions = {
      pending: ['pending', 'shipped', 'cancelled'],
      shipped: ['shipped', 'delivered', 'cancelled'],
      delivered: ['delivered'],
      cancelled: ['cancelled']
    };
    return validTransitions[currentStatus] || ['pending'];
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const printInvoice = (order) => {
    setSelectedOrder(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return classes[status] || '';
  };

  // Filter and search orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = !searchTerm || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = (!dateFrom || new Date(order.placedAt) >= new Date(dateFrom)) &&
                        (!dateTo || new Date(order.placedAt) <= new Date(dateTo));
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem 2rem' }}><p style={{ fontSize: '1.5rem', color: '#e71d36' }}>⏳ Loading orders...</p></div>;
  }

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
        <input
          type="text"
          placeholder="🔍 Search by Order ID, Customer Name, or Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            padding: '0.75rem', 
            borderRadius: '8px', 
            border: '1px solid #ddd', 
            minWidth: '300px',
            fontSize: '1rem'
          }}
        />
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)} 
          style={{ 
            padding: '0.75rem', 
            borderRadius: '8px', 
            border: '1px solid #ddd', 
            minWidth: '150px' 
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder="From Date"
          style={{ 
            padding: '0.75rem', 
            borderRadius: '8px', 
            border: '1px solid #ddd',
            minWidth: '150px'
          }}
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder="To Date"
          style={{ 
            padding: '0.75rem', 
            borderRadius: '8px', 
            border: '1px solid #ddd',
            minWidth: '150px'
          }}
        />
        {(searchTerm || filterStatus !== 'all' || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setDateFrom('');
              setDateTo('');
              setCurrentPage(1);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {filteredOrders.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>No orders found</p>
        ) : (
          <>
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
                {currentOrders.map(order => (
                  <tr key={order.id}>
                  <td className="order-id">#{order.id.substring(0, 8)}</td>
                  <td>{order.customer}</td>
                  <td>{order.email}</td>
                  <td>{order.date}</td>
                  <td>{order.itemsCount}</td>
                  <td className="total">₹{order.total?.toLocaleString()}</td>
                    <td>
                      <select 
                        value={order.status || 'pending'} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`status-select ${getStatusClass(order.status)}`}
                        style={{ 
                          padding: '0.5rem', 
                          borderRadius: '6px', 
                          border: '1px solid #ddd', 
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {getValidStatusOptions(order.status).map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => viewOrderDetails(order)}
                          title="View Details" 
                          style={{ 
                            padding: '0.5rem 1rem', 
                            background: '#e71d36', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer' 
                          }}
                        >
                          👁️
                        </button>
                        <button 
                          onClick={() => printInvoice(order)}
                          title="Print Invoice" 
                          style={{ 
                            padding: '0.5rem 1rem', 
                            background: '#6c757d', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer' 
                          }}
                        >
                          🖨️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginTop: '2rem',
                padding: '1rem'
              }}>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === 1 ? '#ddd' : '#e71d36',
                    color: currentPage === 1 ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ← Previous
                </button>
                
                <span style={{ padding: '0 1rem', fontWeight: '600' }}>
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === totalPages ? '#ddd' : '#e71d36',
                    color: currentPage === totalPages ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowDetailsModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>📦 Order Details</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ marginBottom: '0.5rem', color: '#e71d36' }}>Order Information</h3>
                <p><strong>Order ID:</strong> #{selectedOrder.id.substring(0, 8)}</p>
                <p><strong>Date:</strong> {selectedOrder.date}</p>
                <p><strong>Status:</strong> <span className={getStatusClass(selectedOrder.status)} style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontWeight: '600' }}>{selectedOrder.status}</span></p>
                <p><strong>Total:</strong> ₹{selectedOrder.total?.toLocaleString()}</p>
              </div>

              <div>
                <h3 style={{ marginBottom: '0.5rem', color: '#e71d36' }}>Customer Information</h3>
                <p><strong>Name:</strong> {selectedOrder.customer}</p>
                <p><strong>Email:</strong> {selectedOrder.email}</p>
                <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#e71d36' }}>Shipping Address</h3>
              {selectedOrder.shippingAddress ? (
                <>
                  <p>{selectedOrder.shippingAddress.address || 'N/A'}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}</p>
                  <p>{selectedOrder.shippingAddress.country || 'India'}</p>
                </>
              ) : (
                <p>No shipping address available</p>
              )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#e71d36' }}>Order Items</h3>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e8e8e8' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>Product</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem' }}>Quantity</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>Price</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '0.75rem' }}>{item.title || 'N/A'}</td>
                        <td style={{ textAlign: 'center', padding: '0.75rem' }}>{item.quantity || 0}</td>
                        <td style={{ textAlign: 'right', padding: '0.75rem' }}>₹{item.price?.toLocaleString() || '0'}</td>
                        <td style={{ textAlign: 'right', padding: '0.75rem' }}>₹{((item.price || 0) * (item.quantity || 0))?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #e8e8e8', fontWeight: '700' }}>
                      <td colSpan="3" style={{ textAlign: 'right', padding: '1rem' }}>Total:</td>
                      <td style={{ textAlign: 'right', padding: '1rem', color: '#e71d36', fontSize: '1.2rem' }}>₹{selectedOrder.total?.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p>No items found in this order</p>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#e71d36' }}>Payment Information</h3>
              <p><strong>Method:</strong> {selectedOrder.paymentMethod || 'Cash on Delivery'}</p>
              <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus || 'Pending'}</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => printInvoice(selectedOrder)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#e71d36',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🖨️ Print Invoice
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Invoice Template */}
      {selectedOrder && (
        <div 
          className="print-only" 
          style={{ display: 'none' }}
        >
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .print-only, .print-only * { visibility: visible; }
              .print-only { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%;
                display: block !important;
              }
            }
          `}</style>
          
          <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '3px solid #e71d36', paddingBottom: '1rem' }}>
              <h1 style={{ color: '#e71d36', margin: '0' }}>DRIFT</h1>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>Tax Invoice</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>Bill To:</h3>
                <p style={{ margin: '0.25rem 0' }}><strong>{selectedOrder.customer}</strong></p>
                <p style={{ margin: '0.25rem 0' }}>{selectedOrder.email}</p>
                <p style={{ margin: '0.25rem 0' }}>{selectedOrder.shippingAddress?.phone}</p>
                <p style={{ margin: '0.25rem 0' }}>{selectedOrder.shippingAddress?.address}</p>
                <p style={{ margin: '0.25rem 0' }}>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Invoice Details:</h3>
                <p style={{ margin: '0.25rem 0' }}><strong>Invoice #:</strong> {selectedOrder.id.substring(0, 8)}</p>
                <p style={{ margin: '0.25rem 0' }}><strong>Date:</strong> {selectedOrder.date}</p>
                <p style={{ margin: '0.25rem 0' }}><strong>Status:</strong> {selectedOrder.status}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e71d36' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', border: '1px solid #ddd' }}>Item</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem', border: '1px solid #ddd' }}>Quantity</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', border: '1px solid #ddd' }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', border: '1px solid #ddd' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{item.title || 'N/A'}</td>
                      <td style={{ textAlign: 'center', padding: '0.75rem', border: '1px solid #ddd' }}>{item.quantity || 0}</td>
                      <td style={{ textAlign: 'right', padding: '0.75rem', border: '1px solid #ddd' }}>₹{item.price?.toLocaleString() || '0'}</td>
                      <td style={{ textAlign: 'right', padding: '0.75rem', border: '1px solid #ddd' }}>₹{((item.price || 0) * (item.quantity || 0))?.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', border: '1px solid #ddd' }}>No items in order</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f5f5f5', fontWeight: '700' }}>
                  <td colSpan="3" style={{ textAlign: 'right', padding: '1rem', border: '1px solid #ddd' }}>Grand Total:</td>
                  <td style={{ textAlign: 'right', padding: '1rem', border: '1px solid #ddd', fontSize: '1.2rem', color: '#e71d36' }}>₹{selectedOrder.total?.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            <div style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #ddd', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
              <p>Thank you for shopping with Drift!</p>
              <p>For any queries, please contact us at support@drift.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
