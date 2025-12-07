import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import './Analytics.css';

const Analytics = () => {
  const [products, setProducts] = useState([]);
  const [timeFilter, setTimeFilter] = useState('month'); // week, month, year

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Mock calculations (replace with real order data later)
  const totalRevenue = 125000;
  const totalOrders = 342;
  const totalCustomers = 156;
  const avgOrderValue = totalRevenue / totalOrders;

  const topProducts = products.slice(0, 5);

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>📈 Analytics Dashboard</h1>
          <p>Comprehensive insights into sales, products, and customer behavior</p>
        </div>
        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="time-filter">
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card revenue">
          <div className="kpi-icon">💰</div>
          <div className="kpi-info">
            <h3>Total Revenue</h3>
            <p className="kpi-value">₹{totalRevenue.toLocaleString()}</p>
            <span className="kpi-trend positive">↗ +12.5%</span>
          </div>
        </div>

        <div className="kpi-card orders">
          <div className="kpi-icon">🛒</div>
          <div className="kpi-info">
            <h3>Total Orders</h3>
            <p className="kpi-value">{totalOrders}</p>
            <span className="kpi-trend positive">↗ +8.3%</span>
          </div>
        </div>

        <div className="kpi-card customers">
          <div className="kpi-icon">👥</div>
          <div className="kpi-info">
            <h3>Total Customers</h3>
            <p className="kpi-value">{totalCustomers}</p>
            <span className="kpi-trend positive">↗ +15.2%</span>
          </div>
        </div>

        <div className="kpi-card avg-order">
          <div className="kpi-icon">📊</div>
          <div className="kpi-info">
            <h3>Avg Order Value</h3>
            <p className="kpi-value">₹{Math.round(avgOrderValue)}</p>
            <span className="kpi-trend neutral">→ +2.1%</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>📊 Sales Overview</h3>
          <div className="chart-placeholder">
            <p>Interactive sales chart will be displayed here</p>
            <p className="chart-note">(Integration with Chart.js/Recharts coming soon)</p>
          </div>
        </div>

        <div className="chart-card">
          <h3>🎯 Product Performance</h3>
          <div className="chart-placeholder">
            <p>Product performance metrics and trends</p>
            <p className="chart-note">(Integration with Chart.js/Recharts coming soon)</p>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="top-products-section">
        <h3>⭐ Top Selling Products</h3>
        <div className="products-grid">
          {topProducts.map((product, index) => (
            <div key={product.id} className="product-card">
              <div className="rank-badge">#{index + 1}</div>
              <img src={product.images?.[0] || product.image} alt={product.name} />
              <h4>{product.name}</h4>
              <p className="price">₹{product.price?.toLocaleString()}</p>
              <div className="product-stats">
                <span>Sales: 45</span>
                <span>Revenue: ₹{(product.price * 45).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Insights */}
      <div className="insights-section">
        <h3>💡 Customer Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Customer Lifetime Value</h4>
            <p className="insight-value">₹8,500</p>
          </div>
          <div className="insight-card">
            <h4>Customer Acquisition Cost</h4>
            <p className="insight-value">₹1,200</p>
          </div>
          <div className="insight-card">
            <h4>Repeat Customer Rate</h4>
            <p className="insight-value">32%</p>
          </div>
          <div className="insight-card">
            <h4>Conversion Rate</h4>
            <p className="insight-value">2.8%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
