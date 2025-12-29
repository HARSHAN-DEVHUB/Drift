import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./CartProvider";
import { useWishlist } from "../contexts/WishlistContext";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
	const { totalItems } = useCart();
	const { wishlistCount } = useWishlist();
	const { user, isAuthenticated, logout, isAdmin } = useAuth();
	const [openGroup, setOpenGroup] = useState(null);
	const [mobileCategory, setMobileCategory] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const navigate = useNavigate();
	
	// Memoize auth checks to prevent unnecessary re-renders
	const userIsAuthenticated = useMemo(() => isAuthenticated(), [user]);
	const userIsAdmin = useMemo(() => isAdmin(), [user]);

	const handleLogout = () => {
		logout();
		navigate("/");
	};

	const handleSearch = (e) => {
		e.preventDefault();
		const params = new URLSearchParams();
		// use `q` param for query string to match product search logic
		if (searchTerm) params.set('q', searchTerm);
		const query = params.toString();
		navigate(`/products${query ? `?${query}` : ''}`);
		setSearchTerm('');
	};

	return (
		<header className="header">
			<div className="header-container">
				<Link to="/" className="logo">
					<img src="/assets/logo.png" alt="DRIFT" style={{ height: '40px' }} />
					<span>DRIFT</span>
				</Link>
				
				<form className="search-bar" onSubmit={handleSearch}>
					<input 
						type="text"
						placeholder="Search products..." 
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<button type="submit">Search</button>
				</form>

				<nav className="nav-links">
					{userIsAdmin && (
						<Link to="/admin">Settings</Link>
					)}
					{userIsAuthenticated ? (
						<>
							<Link to="/account">{user?.username || "Account"}</Link>
							<button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "white" }}>
								Logout
							</button>
						</>
					) : (
						<Link to="/login">Sign In</Link>
					)}
					<Link to="/wishlist">Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</Link>
					<Link to={userIsAdmin ? "/admin/orders" : "/orders"}>Orders</Link>
					<Link to="/cart">Cart ({totalItems})</Link>
				</nav>

				<button className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
					☰
				</button>
			</div>

			{mobileMenuOpen && (
				<>
					<div className="menu-overlay" onClick={() => setMobileMenuOpen(false)}></div>
					<nav className="mobile-menu">
						<button className="close-menu" onClick={() => setMobileMenuOpen(false)}>✕</button>
						
						{userIsAdmin && <Link to="/admin/products" onClick={() => setMobileMenuOpen(false)}>Admin</Link>}
						{userIsAuthenticated ? (
							<>
								<Link to="/account" onClick={() => setMobileMenuOpen(false)}>{user?.username || "Account"}</Link>
								<button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Logout</button>
							</>
						) : (
							<Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
						)}
						<Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>Wishlist ({wishlistCount})</Link>
						<Link to={userIsAdmin ? "/admin/orders" : "/orders"} onClick={() => setMobileMenuOpen(false)}>Orders</Link>
						<Link to="/cart" onClick={() => setMobileMenuOpen(false)}>Cart ({totalItems})</Link>
						
						<div className="mobile-menu-divider"></div>
						
						<div className="mobile-category-section">
							<div className="mobile-category-header">Categories</div>
							
							<div className="mobile-category-group">
								<button className="mobile-category-toggle" onClick={() => setMobileCategory(mobileCategory === 'appliances' ? null : 'appliances')}>
									<span>Appliances</span>
									<span className={`arrow ${mobileCategory === 'appliances' ? 'open' : ''}`}>›</span>
								</button>
								{mobileCategory === 'appliances' && (
									<div className="mobile-dropdown">
										<Link to="/products?category=appliances&sub=refrigerator" onClick={() => setMobileMenuOpen(false)}>Refrigerator</Link>
										<Link to="/products?category=appliances&sub=air-conditioner" onClick={() => setMobileMenuOpen(false)}>Air Conditioner</Link>
									</div>
								)}
							</div>
							
							<div className="mobile-category-group">
								<button className="mobile-category-toggle" onClick={() => setMobileCategory(mobileCategory === 'mobiles' ? null : 'mobiles')}>
									<span>Mobiles</span>
									<span className={`arrow ${mobileCategory === 'mobiles' ? 'open' : ''}`}>›</span>
								</button>
								{mobileCategory === 'mobiles' && (
									<div className="mobile-dropdown">
										<Link to="/products?category=mobiles&sub=apple" onClick={() => setMobileMenuOpen(false)}>Apple</Link>
										<Link to="/products?category=mobiles&sub=poco" onClick={() => setMobileMenuOpen(false)}>Poco</Link>
										<Link to="/products?category=mobiles&sub=vivo" onClick={() => setMobileMenuOpen(false)}>Vivo</Link>
										<Link to="/products?category=mobiles&sub=oppo" onClick={() => setMobileMenuOpen(false)}>Oppo</Link>
										<Link to="/products?category=mobiles&sub=realme" onClick={() => setMobileMenuOpen(false)}>Realme</Link>
										<Link to="/products?category=mobiles&sub=oneplus" onClick={() => setMobileMenuOpen(false)}>OnePlus</Link>
										<Link to="/products?category=mobiles&sub=motorola" onClick={() => setMobileMenuOpen(false)}>Motorola</Link>
									</div>
								)}
							</div>
							
							<div className="mobile-category-group">
								<button className="mobile-category-toggle" onClick={() => setMobileCategory(mobileCategory === 'electronics' ? null : 'electronics')}>
									<span>Electronics</span>
									<span className={`arrow ${mobileCategory === 'electronics' ? 'open' : ''}`}>›</span>
								</button>
								{mobileCategory === 'electronics' && (
									<div className="mobile-dropdown">
										<Link to="/products?category=electronics&sub=home-theater" onClick={() => setMobileMenuOpen(false)}>Home Theater</Link>
										<Link to="/products?category=electronics&sub=sound-bar" onClick={() => setMobileMenuOpen(false)}>Sound Bar</Link>
									</div>
								)}
							</div>
							
							<div className="mobile-category-group">
								<button className="mobile-category-toggle" onClick={() => setMobileCategory(mobileCategory === 'tv' ? null : 'tv')}>
									<span>TV</span>
									<span className={`arrow ${mobileCategory === 'tv' ? 'open' : ''}`}>›</span>
								</button>
								{mobileCategory === 'tv' && (
									<div className="mobile-dropdown">
										<Link to="/products?category=tv&sub=toshiba" onClick={() => setMobileMenuOpen(false)}>Toshiba</Link>
										<Link to="/products?category=tv&sub=mi" onClick={() => setMobileMenuOpen(false)}>Mi</Link>
										<Link to="/products?category=tv&sub=realme" onClick={() => setMobileMenuOpen(false)}>Realme</Link>
										<Link to="/products?category=tv&sub=samsung" onClick={() => setMobileMenuOpen(false)}>Samsung</Link>
										<Link to="/products?category=tv&sub=lg" onClick={() => setMobileMenuOpen(false)}>LG</Link>
										<Link to="/products?category=tv&sub=assembled-tv" onClick={() => setMobileMenuOpen(false)}>Assembled TV</Link>
										<Link to="/products?category=tv&sub=tcl" onClick={() => setMobileMenuOpen(false)}>TCL</Link>
									</div>
								)}
							</div>
							
							<div className="mobile-category-group">
								<button className="mobile-category-toggle" onClick={() => setMobileCategory(mobileCategory === 'trending' ? null : 'trending')}>
									<span>Trending</span>
									<span className={`arrow ${mobileCategory === 'trending' ? 'open' : ''}`}>›</span>
								</button>
								{mobileCategory === 'trending' && (
									<div className="mobile-dropdown">
										<Link to="/products?category=trending&sub=best-sellers" onClick={() => setMobileMenuOpen(false)}>Best Sellers</Link>
										<Link to="/products?category=trending&sub=new-arrivals" onClick={() => setMobileMenuOpen(false)}>New Arrivals</Link>
									</div>
								)}
							</div>
						</div>
					</nav>
				</>
			)}

			<nav className="categories">
				<div onMouseEnter={() => setOpenGroup('appliances')} onMouseLeave={() => setOpenGroup(null)}>
					<span>Appliances</span>
					{openGroup === 'appliances' && (
						<div className="dropdown">
							<Link to="/products?category=appliances&sub=refrigerator">Refrigerator</Link>
							<Link to="/products?category=appliances&sub=air-conditioner">Air Conditioner</Link>
						</div>
					)}
				</div>
				<div onMouseEnter={() => setOpenGroup('mobiles')} onMouseLeave={() => setOpenGroup(null)}>
					<span>Mobiles</span>
					{openGroup === 'mobiles' && (
						<div className="dropdown">
							<Link to="/products?category=mobiles&sub=apple">Apple</Link>
							<Link to="/products?category=mobiles&sub=poco">Poco</Link>
							<Link to="/products?category=mobiles&sub=vivo">Vivo</Link>
							<Link to="/products?category=mobiles&sub=oppo">Oppo</Link>
							<Link to="/products?category=mobiles&sub=realme">Realme</Link>
							<Link to="/products?category=mobiles&sub=oneplus">OnePlus</Link>
							<Link to="/products?category=mobiles&sub=motorola">Motorola</Link>
						</div>
					)}
				</div>
				<div onMouseEnter={() => setOpenGroup('electronics')} onMouseLeave={() => setOpenGroup(null)}>
					<span>Electronics</span>
					{openGroup === 'electronics' && (
						<div className="dropdown">
							<Link to="/products?category=electronics&sub=home-theater">Home Theater</Link>
							<Link to="/products?category=electronics&sub=sound-bar">Sound Bar</Link>
						</div>
					)}
				</div>
				<div onMouseEnter={() => setOpenGroup('tv')} onMouseLeave={() => setOpenGroup(null)}>
					<span>TV</span>
					{openGroup === 'tv' && (
						<div className="dropdown">
							<Link to="/products?category=tv&sub=toshiba">Toshiba</Link>
							<Link to="/products?category=tv&sub=mi">Mi</Link>
							<Link to="/products?category=tv&sub=realme">Realme</Link>
							<Link to="/products?category=tv&sub=samsung">Samsung</Link>
							<Link to="/products?category=tv&sub=lg">LG</Link>
							<Link to="/products?category=tv&sub=assembled-tv">Assembled TV</Link>
							<Link to="/products?category=tv&sub=tcl">TCL</Link>
						</div>
					)}
				</div>
				<div onMouseEnter={() => setOpenGroup('trending')} onMouseLeave={() => setOpenGroup(null)}>
					<span>Trending</span>
					{openGroup === 'trending' && (
						<div className="dropdown">
							<Link to="/products?category=trending&sub=best-sellers">Best Sellers</Link>
							<Link to="/products?category=trending&sub=new-arrivals">New Arrivals</Link>
						</div>
					)}
				</div>
			</nav>
		</header>
	);
}
