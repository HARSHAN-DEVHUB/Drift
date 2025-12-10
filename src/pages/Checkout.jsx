import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../components/CartProvider";
import { useToast } from "../contexts/ToastContext";
import { ref as dbRef, get, set, update } from "firebase/database";
import { database } from "../config/firebase";
import { validateEmail, validatePhone, validatePincode, validateForm } from "../components/CartProvider";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, placeOrder, subtotal, tax, total, updateQuantity } = useCart();
  const toast = useToast();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    if (user) loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      const userRef = dbRef(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setAddresses(userData.addresses || []);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const deductStock = async () => {
    try {
      for (const item of items) {
        const productRef = dbRef(database, `products/${item.id}`);
        const snapshot = await get(productRef);
        if (snapshot.exists()) {
          const product = snapshot.val();
          const currentStock = product.stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          await update(productRef, { stock: newStock });
        }
      }
    } catch (error) {
      console.error('Error deducting stock:', error);
      throw error;
    }
  };

  const applyPromoCode = () => {
    const promoCodes = {
      'DRIFT10': 10,
      'WELCOME20': 20,
      'SAVE50': 50
    };
    
    if (promoCodes[promoCode.toUpperCase()]) {
      const discountAmount = promoCodes[promoCode.toUpperCase()];
      setDiscount(discountAmount);
      toast.success(`Promo code applied! ₹${discountAmount} discount`);
    } else {
      toast.error('Invalid promo code');
      setDiscount(0);
    }
  };

  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today.setDate(today.getDate() + 5));
    return deliveryDate.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const finalTotal = Math.max(0, total - discount);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.warning("Your cart is empty!");
      return;
    }

    let finalAddress = formData;
    if (selectedAddress) {
      finalAddress = addresses.find(a => a.id === parseInt(selectedAddress));
    }

    const validation = validateForm({ ...formData, ...finalAddress }, ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 'pincode']);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!validatePhone(finalAddress.phone || formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (!validatePincode(finalAddress.pincode || formData.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    try {
      const order = placeOrder();
      if (order) {
        const orderRef = dbRef(database, `orders/${order.id}`);
        await set(orderRef, {
          ...order,
          userId: user?.uid,
          customerEmail: formData.email,
          shippingAddress: finalAddress,
          paymentMethod,
          discount,
          finalTotal,
          placedAt: new Date().toISOString()
        });
        
        // Deduct stock after order is saved
        await deductStock();
        
        toast.success(`Order placed successfully! Order ID: ${order.id}`);
        navigate("/orders");
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell" style={{ maxWidth: "1200px" }}>
      <h1 className="checkout-page">💳 Secure Checkout</h1>

      {items.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: "1.2rem" }}>Your cart is empty. Add items to proceed with checkout.</p>
        </div>
      ) : (
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            <section>
              <h2>📦 Shipping Address</h2>
              {addresses.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Use Saved Address:</label>
                  <select value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <option value="">Or enter new address below</option>
                    {addresses.map(addr => (
                      <option key={addr.id} value={addr.id}>{addr.name} - {addr.address}, {addr.city}</option>
                    ))}
                  </select>
                </div>
              )}
              {!selectedAddress && (
                <div className="form-grid">
                  <label>First Name <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} placeholder="Enter first name" required /></label>
                  <label>Last Name <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} placeholder="Enter last name" required /></label>
                  <label>Email <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Enter email" required /></label>
                  <label>Phone <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="10-digit phone" required /></label>
                  <label style={{ gridColumn: "1 / -1" }}>Address <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Street address, P.O. box" required /></label>
                  <label>City <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="City" required /></label>
                  <label>State <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} placeholder="State/Province" required /></label>
                  <label>PIN Code <input type="text" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} placeholder="6-digit PIN" required /></label>
                </div>
              )}
            </section>

            <section>
              <h2>💳 Payment Method</h2>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <span>💵 Cash on Delivery</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <span>💳 Razorpay (Coming Soon)</span>
                </label>
              </div>
              {paymentMethod === 'cod' && <p style={{ color: '#666', fontSize: '0.9rem' }}>✅ Pay securely when your order arrives</p>}
            </section>
          </form>

          <div className="checkout-summary">
            <h2>📋 Order Summary</h2>
            
            {/* Cart Items with Images */}
            <div style={{ marginBottom: '1.5rem' }}>
              {items.map((item) => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  padding: '1rem', 
                  borderBottom: '1px solid #f0f0f0',
                  alignItems: 'center'
                }}>
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      objectFit: 'contain',
                      borderRadius: '8px',
                      background: '#f8f8f8'
                    }} 
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      Qty: 
                      <input 
                        type="number" 
                        min="1" 
                        max={item.stock}
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        style={{ 
                          width: '60px', 
                          marginLeft: '0.5rem',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', color: '#e71d36' }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                🎟️ Promo Code
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code"
                  style={{ 
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  type="button"
                  onClick={applyPromoCode}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Apply
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                Try: DRIFT10, WELCOME20, SAVE50
              </div>
            </div>

            {/* Estimated Delivery */}
            <div style={{ 
              background: '#f0f8ff', 
              padding: '1rem', 
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              <strong>🚚 Estimated Delivery:</strong>
              <div style={{ marginTop: '0.5rem', color: '#2196f3', fontWeight: '600' }}>
                {getEstimatedDelivery()}
              </div>
            </div>

            <div className="checkout-totals">
              <div><span>Subtotal ({items.length} items)</span> <span>₹{subtotal.toFixed(2)}</span></div>
              <div><span>Tax (18% GST)</span> <span>₹{tax.toFixed(2)}</span></div>
              {discount > 0 && (
                <div style={{ color: '#4caf50' }}>
                  <span>Discount</span> <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div><span>Shipping</span> <span style={{ color: "#4caf50", fontWeight: "700" }}>FREE</span></div>
              <div className="checkout-total-row">
                <span>Order Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              type="submit"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="primary-button"
              style={{ width: "100%", marginTop: "1.5rem", padding: "1rem", fontSize: "1.05rem" }}
            >
              {loading ? '⏳ Placing Order...' : '🚀 Place Order'}
            </button>
            <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#666", textAlign: "center", lineHeight: "1.6" }}>
              By placing your order, you agree to our terms and conditions. Your payment information is secure and encrypted.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
