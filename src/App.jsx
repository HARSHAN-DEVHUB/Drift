import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./components/CartProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductManagement from "./pages/ProductManagement";
import AdminSetup from "./pages/AdminSetup";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import "./index.css";

export default function App() {
	return (
		<AuthProvider>
			<CartProvider>
				<Header />
				<main className="amazon-main">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/products" element={<Products />} />
						<Route path="/products/:id" element={<ProductDetail />} />
						<Route path="/cart" element={<Cart />} />
						<Route path="/checkout" element={<Checkout />} />
						<Route path="/login" element={<Login />} />
						<Route path="/admin/setup" element={<AdminSetup />} />
						<Route 
							path="/admin/products" 
							element={
								<ProtectedRoute requireAdmin={true}>
									<ProductManagement />
								</ProtectedRoute>
							} 
						/>
						<Route 
							path="/account" 
							element={
								<ProtectedRoute>
									<Account />
								</ProtectedRoute>
							} 
						/>
						<Route 
							path="/orders" 
							element={
								<ProtectedRoute>
									<Orders />
								</ProtectedRoute>
							} 
						/>
						<Route path="*" element={<NotFound />} />
					</Routes>
				</main>
			<footer className="amazon-footer">
				<div className="amazon-footer-back">
					<button className="back-to-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
						⬆️ Back to Top
					</button>
				</div>
				<div className="amazon-footer-main">
					<div className="footer-column">
						<h4>About Us</h4>
						<ul>
							<li><Link to="/">🏢 About Drift Enterprises</Link></li>
							<li><Link to="/">💼 Careers</Link></li>
							<li><Link to="/">📰 News & Press</Link></li>
							<li><Link to="/">📝 Blog</Link></li>
						</ul>
					</div>
					<div className="footer-column">
						<h4>Connect</h4>
						<ul>
							<li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">📘 Facebook</a></li>
							<li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">🐦 Twitter</a></li>
							<li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">📸 Instagram</a></li>
							<li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">💼 LinkedIn</a></li>
						</ul>
					</div>
					<div className="footer-column">
						<h4>For Sellers</h4>
						<ul>
							<li><Link to="/admin/products">🛒 Sell with Drift</Link></li>
							<li><Link to="/">🤝 Partner Program</Link></li>
							<li><Link to="/">📢 Advertising</Link></li>
							<li><Link to="/">🚚 Logistics</Link></li>
						</ul>
					</div>
					<div className="footer-column">
						<h4>Support</h4>
						<ul>
							<li><Link to="/account">👤 My Account</Link></li>
							<li><Link to="/">💬 Support Center</Link></li>
							<li><Link to="/">📞 Contact Support</Link></li>
							<li><Link to="/account">⚙️ Preferences</Link></li>
						</ul>
					</div>
				</div>
				<div className="amazon-footer-bottom">
					<div className="footer-logo">⚡ DRIFT ENTERPRISES</div>
					<div className="footer-copyright">© 2024 Drift Enterprises - All Rights Reserved | Crafted with ❤️</div>
				</div>
			</footer>
			</CartProvider>
		</AuthProvider>
	);
}
