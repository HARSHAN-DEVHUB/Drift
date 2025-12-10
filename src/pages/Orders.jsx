import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ref as dbRef, get, update } from "firebase/database";
import { database } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../components/CartProvider";

export default function Orders() {
  const { user } = useAuth();
  const { orders: localOrders } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      if (user) {
        const ordersRef = dbRef(database, 'orders');
        const snapshot = await get(ordersRef);
        if (snapshot.exists()) {
          const allOrders = snapshot.val();
          const userOrders = Object.entries(allOrders)
            .filter(([_, order]) => order.userId === user.uid)
            .map(([id, order]) => ({ id, ...order }))
            .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
          setOrders(userOrders);
        } else {
          setOrders(localOrders || []);
        }
      } else {
        setOrders(localOrders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders(localOrders || []);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order?.status !== 'pending') {
      alert('❌ Can only cancel pending orders');
      return;
    }
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      const orderRef = dbRef(database, `orders/${orderId}`);
      await update(orderRef, { status: 'cancelled', cancelledAt: new Date().toISOString() });
      alert('✅ Order cancelled successfully!');
      loadOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('❌ Failed to cancel order');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem 2rem' }}><p style={{ fontSize: '1.5rem' }}>⏳ Loading orders...</p></div>;
  }

  return (
    <div className="page-shell" style={{ maxWidth: "1200px" }}>
      <h1>📦 Your Orders</h1>
      
      {orders.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>No orders yet</p>
          <p style={{ fontSize: "1rem", color: "#666", marginBottom: "2rem" }}>
            Looks like you haven't placed any orders. Start shopping now!
          </p>
          <Link to="/products" className="primary-button" style={{ display: "inline-block", padding: "1rem 3rem" }}>
            🛍️ Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ marginTop: "2rem" }}>
          <p style={{ color: "#666", marginBottom: "2rem" }}>
            You have {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {orders.map((order) => (
              <div 
                key={order.id} 
                style={{ 
                  background: "linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)",
                  border: "1px solid #e8e8e8",
                  borderRadius: "20px",
                  padding: "2rem",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem", alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "1.2rem", color: "#1a1a1a", marginBottom: "0.5rem" }}>
                      Order #{order.id.substring(0, 8)}
                    </h3>
                    <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: '0.5rem' }}>
                      Placed on {new Date(order.createdAt || order.placedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>Status: </span>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        background: order.status === 'delivered' ? '#28a745' : order.status === 'cancelled' ? '#dc3545' : order.status === 'shipped' ? '#007bff' : '#ffc107',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}>
                        {order.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.25rem" }}>Order Total</p>
                    <p style={{ fontSize: "1.8rem", fontWeight: "800", color: "#e71d36", marginBottom: '1rem' }}>
                      ₹{(order.total || order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0).toFixed(2)}
                    </p>
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => cancelOrder(order.id)}
                        style={{ padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}
                      >
                        ❌ Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Tracking Timeline */}
                {order.status !== 'cancelled' && (
                  <div style={{ margin: '1.5rem 0', padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#1a1a1a' }}>📦 Order Tracking:</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                      {/* Progress Line */}
                      <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '2%',
                        right: '2%',
                        height: '4px',
                        background: '#e0e0e0',
                        borderRadius: '2px',
                        zIndex: 0
                      }}>
                        <div style={{
                          height: '100%',
                          background: '#4caf50',
                          borderRadius: '2px',
                          width: order.status === 'pending' ? '0%' : 
                                  order.status === 'shipped' ? '50%' : 
                                  order.status === 'delivered' ? '100%' : '0%',
                          transition: 'width 0.5s ease'
                        }}></div>
                      </div>

                      {/* Timeline Steps */}
                      {[
                        { key: 'pending', icon: '📝', label: 'Order Placed' },
                        { key: 'shipped', icon: '🚚', label: 'Shipped' },
                        { key: 'delivered', icon: '✅', label: 'Delivered' }
                      ].map((step, index) => {
                        const isCompleted = 
                          (step.key === 'pending') ||
                          (step.key === 'shipped' && ['shipped', 'delivered'].includes(order.status)) ||
                          (step.key === 'delivered' && order.status === 'delivered');
                        const isCurrent = order.status === step.key;

                        return (
                          <div key={step.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: isCompleted ? '#4caf50' : isCurrent ? '#2196f3' : '#e0e0e0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                              marginBottom: '0.5rem',
                              border: isCurrent ? '3px solid #1976d2' : 'none',
                              transition: 'all 0.3s ease'
                            }}>
                              {step.icon}
                            </div>
                            <p style={{ 
                              fontSize: '0.85rem', 
                              fontWeight: isCompleted || isCurrent ? '600' : '400',
                              color: isCompleted || isCurrent ? '#1a1a1a' : '#999',
                              textAlign: 'center'
                            }}>
                              {step.label}
                            </p>
                            {isCompleted && (
                              <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                                {new Date(order.placedAt || order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: "1.5rem" }}>
                  <h4 style={{ fontSize: "1rem", marginBottom: "1rem", color: "#1a1a1a" }}>Items ({order.items?.length || 0}):</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {(order.items || []).map((item, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          padding: "0.75rem",
                          background: "#ffffff",
                          borderRadius: "12px",
                          border: "1px solid #f0f0f0"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                          {item.image && <img 
                            src={item.image} 
                            alt={item.title}
                            style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
                          />}
                          <div>
                            <p style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{item.title || 'Product'}</p>
                            <p style={{ color: "#999", fontSize: "0.85rem" }}>Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p style={{ fontWeight: "600", minWidth: "80px", textAlign: "right" }}>₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {order.shippingAddress && (
                  <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#f5f5f5", borderRadius: "12px" }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem" }}>📍 Shipping Address:</p>
                    <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: "1.6" }}>
                      {order.shippingAddress.name}<br/>
                      {order.shippingAddress.address}<br/>
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br/>
                      <strong>Phone:</strong> {order.shippingAddress.phone}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
