import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../components/CartProvider";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, savedForLater, saveForLater, moveToCart, removeFromSaved } = useCart();

  return (
    <div className="page-shell" style={{ maxWidth: "1200px" }}>
      <h1>🛒 Your Shopping Cart</h1>
      {items.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Your cart is empty</p>
          <p style={{ fontSize: "1rem", color: "#666", marginBottom: "2rem" }}>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="primary-button" style={{ display: "inline-block", padding: "1rem 3rem" }}>
            🛍️ Start Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((i) => (
              <div key={i.id} className="cart-item">
                <div className="cart-item-image">
                  <img src={i.image} alt={i.title} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
                <div className="cart-item-body" style={{ flex: 1 }}>
                  <h2>{i.title}</h2>
                  <div className="cart-item-price"><span className="currency">₹</span>{i.price.toFixed(2)}</div>
                  <div className="cart-item-each">₹{(i.price * i.quantity).toFixed(2)} total</div>
                  <div className="cart-item-actions">
                    <label>
                      Qty:
                      <input
                        type="number"
                        value={i.quantity}
                        min={1}
                        onChange={(e) => updateQuantity(i.id, Number(e.target.value))}
                        style={{ width: 60, padding: "0.25rem", marginLeft: "0.25rem" }}
                      />
                    </label>
                    <button 
                      onClick={() => saveForLater(i.id)}
                      style={{ 
                        marginLeft: '0.5rem', 
                        padding: '0.5rem 1rem', 
                        background: '#2196f3', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      💾 Save for Later
                    </button>
                    <button onClick={() => removeItem(i.id)}>
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h2 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "1.5rem", color: "#1a1a1a" }}>Order Summary</h2>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "space-between", fontSize: "1rem" }}>
                <span>Subtotal:</span> <strong style={{ color: "#1a1a1a" }}>₹{subtotal.toFixed(2)}</strong>
              </div>
              <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "space-between", fontSize: "1rem" }}>
                <span>Shipping:</span> <strong style={{ color: "#4caf50" }}>FREE</strong>
              </div>
              <div style={{ marginBottom: "1.5rem", fontSize: "0.85rem", color: "#666", fontStyle: "italic" }}>Tax calculated at checkout</div>
            </div>
            <div style={{ paddingTop: "1.5rem", borderTop: "2px solid #e8e8e8" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "1.5rem", color: "#e71d36", display: "flex", justifyContent: "space-between" }}>
                <span>Total:</span> <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="primary-button wide" style={{ display: "block", textAlign: "center", padding: "1rem", fontSize: "1rem" }}>
                🚀 Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Saved for Later Section */}
      {savedForLater && savedForLater.length > 0 && (
        <div style={{ marginTop: '3rem', borderTop: '2px solid #e8e8e8', paddingTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>💾 Saved for Later ({savedForLater.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {savedForLater.map((item) => (
              <div 
                key={item.id}
                style={{
                  background: 'white',
                  border: '1px solid #e8e8e8',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  padding: '1rem'
                }}
              >
                <img 
                  src={item.image} 
                  alt={item.title}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
                />
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#e71d36', marginBottom: '1rem' }}>
                  ₹{item.price?.toFixed(2)}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => moveToCart(item.id)}
                    style={{
                      padding: '0.75rem',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    🛒 Move to Cart
                  </button>
                  <button
                    onClick={() => removeFromSaved(item.id)}
                    style={{
                      padding: '0.75rem',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
