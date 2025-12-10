import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./components/CartProvider";
import { WishlistProvider } from "./contexts/WishlistContext";
import { RecentlyViewedProvider } from "./contexts/RecentlyViewedContext";
import { ToastProvider } from "./contexts/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductManagement from "./pages/ProductManagement";
import AdminSetup from "./pages/AdminSetup";
import AdminDashboard from './pages/AdminDashboard';
import BannerManagement from './pages/BannerManagement';
import HomePageManager from './pages/HomePageManager';
import StockManagement from './pages/StockManagement';
import Analytics from './pages/Analytics';
import OrderManagement from './pages/OrderManagement';
import CustomerManagement from './pages/CustomerManagement';
import ReviewsManagement from './pages/ReviewsManagement';
import RevenueManagement from './pages/RevenueManagement';
import ActivityLogs from './pages/ActivityLogs';
import AdminSettings from './pages/AdminSettings';
import Account from './pages/Account';
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import "./index.css";

export default function App() {
	return (
		<ErrorBoundary>
			<AuthProvider>
				<CartProvider>
					<WishlistProvider>
						<RecentlyViewedProvider>
							<ToastProvider>
								<Header />
								<ScrollToTop />
							<main className="amazon-main">
					<Routes>
						{/* Public Routes */}
						<Route path="/" element={<Home />} />
						<Route path="/products" element={<Products />} />
						<Route path="/products/:id" element={<ProductDetail />} />
						<Route path="/cart" element={<Cart />} />
						<Route path="/wishlist" element={<Wishlist />} />
						<Route path="/checkout" element={<Checkout />} />
						<Route path="/login" element={<Login />} />
						<Route path="/contact" element={<Contact />} />
						<Route path="/about" element={<About />} />
						<Route path="/admin/setup" element={<AdminSetup />} />
						
						{/* Customer Routes */}
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

						{/* Admin Routes - All wrapped in AdminLayout */}
						<Route
							path="/admin"
							element={
								<ProtectedRoute requireAdmin={true}>
									<AdminLayout />
								</ProtectedRoute>
							}
						>
							<Route index element={<AdminDashboard />} />
							<Route path="homepage" element={<HomePageManager />} />
							<Route path="products" element={<ProductManagement />} />
							<Route path="stock" element={<StockManagement />} />
							<Route path="analytics" element={<Analytics />} />
							<Route path="orders" element={<OrderManagement />} />
							<Route path="customers" element={<CustomerManagement />} />
							<Route path="reviews" element={<ReviewsManagement />} />
							<Route path="revenue" element={<RevenueManagement />} />
							<Route path="activity" element={<ActivityLogs />} />
							<Route path="settings" element={<AdminSettings />} />
							<Route path="banners" element={<BannerManagement />} />
						</Route>

						{/* 404 */}
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
							<li><Link to="/about">🏢 About Drift Enterprises</Link></li>
							<li><Link to="/contact">💼 Careers</Link></li>
							<li><Link to="/contact">📰 News & Press</Link></li>
							<li><Link to="/contact">📝 Blog</Link></li>
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
							<li><Link to="/contact">🤝 Partner Program</Link></li>
							<li><Link to="/contact">📢 Advertising</Link></li>
							<li><Link to="/contact">🚚 Logistics</Link></li>
						</ul>
					</div>
					<div className="footer-column">
						<h4>Support</h4>
						<ul>
							<li><Link to="/account">👤 My Account</Link></li>
							<li><Link to="/contact">💬 Support Center</Link></li>
							<li><Link to="/orders">📦 Track Orders</Link></li>
							<li><Link to="/contact">📞 Contact Us</Link></li>
						</ul>
					</div>
				</div>
				<div className="amazon-footer-bottom">
					<div className="footer-logo">⚡ DRIFT ENTERPRISES</div>
					<div className="footer-copyright">© 2024 Drift Enterprises - All Rights Reserved | Crafted with ❤️</div>
				</div>
			</footer>
							</ToastProvider>
						</RecentlyViewedProvider>
					</WishlistProvider>
				</CartProvider>
			</AuthProvider>
		</ErrorBoundary>
	);
}
