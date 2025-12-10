import React from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
  return (
    <div className="page-shell" style={{ maxWidth: '1000px' }}>
      <h1>📞 Contact Us</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem', color: '#e71d36' }}>📍 Address</h3>
          <p>DRIFT ENTERPRISES<br/>
          123 Tech Street<br/>
          Bangalore, Karnataka 560001<br/>
          India</p>
        </div>
        
        <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem', color: '#e71d36' }}>📧 Email</h3>
          <p>General: <a href="mailto:info@driftenterprises.com">info@driftenterprises.com</a><br/>
          Support: <a href="mailto:support@driftenterprises.com">support@driftenterprises.com</a><br/>
          Sales: <a href="mailto:sales@driftenterprises.com">sales@driftenterprises.com</a></p>
        </div>
        
        <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem', color: '#e71d36' }}>📱 Phone</h3>
          <p>Customer Support:<br/>
          <a href="tel:+911234567890">+91 123-456-7890</a><br/>
          Mon-Sat: 9 AM - 6 PM IST</p>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem' }}>Send us a Message</h2>
      <form style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <strong>Name *</strong>
            <input type="text" placeholder="Your full name" required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <strong>Email *</strong>
            <input type="email" placeholder="your@email.com" required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
          </label>
        </div>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <strong>Subject *</strong>
          <input type="text" placeholder="How can we help?" required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
        </label>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <strong>Message *</strong>
          <textarea rows="6" placeholder="Your message..." required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}></textarea>
        </label>
        
        <button type="submit" className="primary-button" style={{ padding: '1rem 2rem' }}>
          📧 Send Message
        </button>
      </form>

      <div style={{ marginTop: '3rem', padding: '2rem', background: '#f0f8ff', borderRadius: '16px' }}>
        <h3 style={{ marginBottom: '1rem' }}>❓ Frequently Asked Questions</h3>
        <details style={{ marginBottom: '1rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: '600', padding: '0.75rem', background: 'white', borderRadius: '8px' }}>
            What are your shipping charges?
          </summary>
          <p style={{ padding: '1rem', lineHeight: '1.7' }}>We offer FREE shipping on all orders across India!</p>
        </details>
        
        <details style={{ marginBottom: '1rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: '600', padding: '0.75rem', background: 'white', borderRadius: '8px' }}>
            How can I track my order?
          </summary>
          <p style={{ padding: '1rem', lineHeight: '1.7' }}>
            Visit the <Link to="/orders" style={{ color: '#e71d36', fontWeight: '600' }}>Orders page</Link> to track your shipment in real-time.
          </p>
        </details>
        
        <details style={{ marginBottom: '1rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: '600', padding: '0.75rem', background: 'white', borderRadius: '8px' }}>
            What is your return policy?
          </summary>
          <p style={{ padding: '1rem', lineHeight: '1.7' }}>
            We offer a 7-day return policy for most products. Visit our <Link to="/returns" style={{ color: '#e71d36', fontWeight: '600' }}>Returns page</Link> for details.
          </p>
        </details>
      </div>
    </div>
  );
}
