import React from 'react';

export default function About() {
  return (
    <div className="page-shell" style={{ maxWidth: '900px' }}>
      <h1>🚀 About DRIFT ENTERPRISES</h1>
      
      <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#444' }}>
        <p style={{ marginBottom: '1.5rem' }}>
          Welcome to <strong style={{ color: '#e71d36' }}>DRIFT ENTERPRISES</strong> - your premier destination for cutting-edge electronics and technology products. Founded with a vision to make premium tech accessible to everyone, we've been serving customers across India with dedication and excellence.
        </p>
        
        <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1a1a1a' }}>Our Mission</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          To provide customers with the latest technology products at competitive prices, backed by exceptional customer service and fast, reliable delivery.
        </p>
        
        <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1a1a1a' }}>Why Choose Us?</h2>
        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', borderLeft: '4px solid #e71d36' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>✅ Authentic Products</h3>
            <p>100% genuine products directly from authorized distributors</p>
          </div>
          
          <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', borderLeft: '4px solid #e71d36' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>🚚 Fast Delivery</h3>
            <p>Free shipping across India with 5-day delivery guarantee</p>
          </div>
          
          <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', borderLeft: '4px solid #e71d36' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>💯 Quality Assurance</h3>
            <p>Rigorous quality checks on every product before dispatch</p>
          </div>
          
          <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', borderLeft: '4px solid #e71d36' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>🔄 Easy Returns</h3>
            <p>Hassle-free 7-day return policy for your peace of mind</p>
          </div>
        </div>
        
        <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1a1a1a' }}>Our Promise</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          At DRIFT ENTERPRISES, customer satisfaction is our top priority. We continuously strive to improve our services, expand our product range, and provide you with the best online shopping experience.
        </p>
        
        <div style={{ marginTop: '3rem', padding: '2rem', background: 'linear-gradient(135deg, #e71d36 0%, #c41530 100%)', color: 'white', borderRadius: '16px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Join thousands of satisfied customers!</h3>
          <p style={{ fontSize: '1.1rem' }}>Experience the DRIFT difference today.</p>
        </div>
      </div>
    </div>
  );
}
