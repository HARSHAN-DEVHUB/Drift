import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import './StockManagement.css';

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, low-stock, out-of-stock
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [editingStock, setEditingStock] = useState({}); // Track local edits
  const [savingStock, setSavingStock] = useState({}); // Track saving state

  // Mock locations - can be fetched from Firebase later
  const locations = ['Main Warehouse', 'Store 1', 'Store 2', 'Online Warehouse'];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
      // Clear editing state after load
      setEditingStock({});
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (productId, newValue) => {
    // Update local state immediately for smooth editing
    setEditingStock(prev => ({
      ...prev,
      [productId]: newValue
    }));
  };

  const updateStock = async (productId, newStock) => {
    // Validate the stock value
    const stockValue = parseInt(newStock);
    if (isNaN(stockValue) || stockValue < 0) {
      alert('Please enter a valid stock quantity (0 or greater)');
      return;
    }

    setSavingStock(prev => ({ ...prev, [productId]: true }));
    
    try {
      await productService.updateProduct(productId, { stock: stockValue });
      
      // Update local products state without full reload
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, stock: stockValue } : p
      ));
      
      // Clear editing state for this product
      setEditingStock(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
      
      // Show success feedback (optional)
      console.log('Stock updated successfully');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock. Please try again.');
    } finally {
      setSavingStock(prev => ({ ...prev, [productId]: false }));
    }
  };

  const filteredProducts = products.filter(product => {
    // Handle both 'name' and 'title' fields (Firebase products use 'title')
    const productName = product.name || product.title || '';
    const productSku = product.sku || product.id || '';
    const productBrand = product.brand || '';
    
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         productBrand.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    const stockLevel = product.stock || 0;
    if (filterBy === 'low-stock') {
      matchesFilter = stockLevel > 0 && stockLevel <= 10;
    } else if (filterBy === 'out-of-stock') {
      matchesFilter = stockLevel === 0;
    }

    return matchesSearch && matchesFilter;
  });

  const totalStockValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="stock-management">
      <div className="page-header">
        <div>
          <h1>📊 Stock Management</h1>
          <p>Track inventory levels, stock valuation, and manage product locations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <p className="stat-value">{products.length}</p>
          </div>
        </div>

        <div className="stat-card alert">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>Low Stock</h3>
            <p className="stat-value">{lowStockCount}</p>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <h3>Out of Stock</h3>
            <p className="stat-value">{outOfStockCount}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Stock Value</h3>
            <p className="stat-value">₹{totalStockValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
            <option value="all">All Products</option>
            <option value="low-stock">Low Stock (≤10)</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
            <option value="all">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="stock-table-container">
        {loading ? (
          <div className="loading-state">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <p>📦 No products found</p>
          </div>
        ) : (
          <table className="stock-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Current Stock</th>
                <th>Price</th>
                <th>Stock Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const stock = product.stock || 0;
                const stockValue = stock * product.price;
                let statusClass = 'in-stock';
                let statusText = 'In Stock';

                if (stock === 0) {
                  statusClass = 'out-of-stock';
                  statusText = 'Out of Stock';
                } else if (stock <= 10) {
                  statusClass = 'low-stock';
                  statusText = 'Low Stock';
                }

                // Check if this product has local edits
                const currentStockValue = editingStock[product.id] !== undefined 
                  ? editingStock[product.id] 
                  : stock;
                const hasChanges = editingStock[product.id] !== undefined && 
                  editingStock[product.id] !== stock.toString();
                const isSaving = savingStock[product.id];

                return (
                  <tr key={product.id}>
                    <td>
                      <img 
                        src={product.images?.[0] || product.image || '/placeholder.png'} 
                        alt={product.name}
                        className="product-thumb"
                      />
                    </td>
                    <td className="product-name">{product.name || product.title || 'Unnamed Product'}</td>
                    <td>{product.sku || product.id || 'N/A'}</td>
                    <td>
                      <div className="stock-edit-container">
                        <input
                          type="number"
                          className={`stock-input ${hasChanges ? 'has-changes' : ''}`}
                          value={currentStockValue}
                          min="0"
                          onChange={(e) => handleStockChange(product.id, e.target.value)}
                          onBlur={(e) => {
                            if (hasChanges) {
                              updateStock(product.id, e.target.value);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && hasChanges) {
                              updateStock(product.id, e.target.value);
                            }
                          }}
                          disabled={isSaving}
                        />
                        {hasChanges && !isSaving && (
                          <button 
                            className="save-stock-btn"
                            onClick={() => updateStock(product.id, currentStockValue)}
                            title="Save changes"
                          >
                            ✓
                          </button>
                        )}
                        {isSaving && <span className="saving-indicator">💾</span>}
                      </div>
                    </td>
                    <td>₹{product.price?.toLocaleString()}</td>
                    <td className="stock-value">₹{stockValue.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${statusClass}`}>
                        {statusText}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="Stock History">
                          📋
                        </button>
                        <button className="btn-icon" title="Adjust Stock">
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="action-cards">
          <button className="action-card">
            <span className="action-icon">📥</span>
            <span>Import Stock CSV</span>
          </button>
          <button className="action-card">
            <span className="action-icon">📤</span>
            <span>Export Stock Report</span>
          </button>
          <button className="action-card">
            <span className="action-icon">🔔</span>
            <span>Set Low Stock Alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
