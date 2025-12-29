import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../components/CartProvider";

export default function Products() {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchParams, setSearchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
	const [priceRange, setPriceRange] = useState([0, 500000]);
	const [selectedBrands, setSelectedBrands] = useState([]);
	const [stockFilter, setStockFilter] = useState('all');
	const [sortBy, setSortBy] = useState('relevance');
	const [showQuickView, setShowQuickView] = useState(false);
	const [quickViewProduct, setQuickViewProduct] = useState(null);
	const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
	const { addItem } = useCart();
	const navigate = useNavigate();

	useEffect(() => {
		const loadProducts = async () => {
			try {
				const firebaseProducts = await productService.getAllProducts();
				// Transform Firebase products to match the expected format
				const transformedProducts = firebaseProducts.map(p => ({
					...p,
					image: p.images?.[0] || p.image || 'https://via.placeholder.com/300',
					stock: p.stock !== undefined ? p.stock : 100 // Default stock if not set
				}));
				setProducts(transformedProducts);
				
				// Set initial price range based on products
				if (transformedProducts.length > 0) {
					const prices = transformedProducts.map(p => p.price);
					setPriceRange([0, Math.max(...prices)]);
				}
			} catch (error) {
				console.error("Error loading products:", error);
				setProducts([]);
			} finally {
				setLoading(false);
			}
		};

		loadProducts();
	}, []);

	const category = searchParams.get('category');
	const sub = searchParams.get('sub');
	const searchQuery = searchParams.get('q') || '';
	
	// Update search term when URL changes
	useEffect(() => {
		setSearchTerm(searchQuery);
	}, [searchQuery]);

	const handleSearch = (e) => {
		e.preventDefault();
		const params = {};
		if (searchTerm) params.q = searchTerm;
		if (category) params.category = category;
		if (sub) params.sub = sub;
		setSearchParams(params);
	};

	const toggleBrand = (brand) => {
		setSelectedBrands(prev => 
			prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
		);
	};

	const toggleWishlist = (e, product) => {
		e.preventDefault();
		e.stopPropagation();
		if (isInWishlist(product.id)) {
			removeFromWishlist(product.id);
		} else {
			addToWishlist(product);
		}
	};

	const openQuickView = (e, product) => {
		e.preventDefault();
		e.stopPropagation();
		setQuickViewProduct(product);
		setShowQuickView(true);
	};

	// Get unique brands from products
	const availableBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];

	// Filter products
	let filteredProducts = products;
	
	if (category) {
		filteredProducts = filteredProducts.filter(p => p.category?.toLowerCase() === category.toLowerCase());
	}
	if (sub) {
		filteredProducts = filteredProducts.filter(p => 
			(p.subcategory && p.subcategory.toLowerCase() === sub.toLowerCase()) ||
			(p.brand && p.brand.toLowerCase() === sub.toLowerCase())
		);
	}
	if (searchTerm) {
		filteredProducts = filteredProducts.filter(p => 
			p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}
	if (selectedBrands.length > 0) {
		filteredProducts = filteredProducts.filter(p => selectedBrands.includes(p.brand));
	}
	if (stockFilter === 'in-stock') {
		filteredProducts = filteredProducts.filter(p => p.stock > 0);
	} else if (stockFilter === 'out-of-stock') {
		filteredProducts = filteredProducts.filter(p => p.stock === 0);
	}
	
	// Price filter
	filteredProducts = filteredProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

	// Sort products
	switch (sortBy) {
		case 'price-low':
			filteredProducts.sort((a, b) => a.price - b.price);
			break;
		case 'price-high':
			filteredProducts.sort((a, b) => b.price - a.price);
			break;
		case 'rating':
			filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
			break;
		case 'newest':
			filteredProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
			break;
		default:
			// relevance - keep original order
			break;
	}

	const formatTitle = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ') : '';
	const title = searchTerm ? `Search: ${searchTerm}` : (category ? (sub ? `${formatTitle(sub)} - ${formatTitle(category)}` : formatTitle(category)) : "All Products");

	const getStockStatus = (stock) => {
		if (stock === 0) return { text: 'Out of Stock', color: '#f44336', bg: '#ffebee' };
		if (stock < 10) return { text: `Only ${stock} left!`, color: '#ff9800', bg: '#fff3e0' };
		return { text: 'In Stock', color: '#4caf50', bg: '#e8f5e9' };
	};

	if (loading) {
		return (
			<div className="amazon-grid-section">
				<div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
					<p style={{ fontSize: '2rem', color: '#e71d36', fontWeight: '700' }}>⏳ Loading products...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="amazon-grid-section">
			{/* Search Bar */}
			<div style={{ marginBottom: '2rem' }}>
				<form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="🔍 Search products by name, brand..."
						style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
					/>
					<button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#e71d36', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
						Search
					</button>
				</form>
			</div>

			<h1 style={{ padding: "0 0.5rem", fontSize: "2.5rem", fontWeight: "900", color: "#1a1a1a", letterSpacing: "-1px", marginBottom: "1rem" }}>
				{title}
			</h1>

			<p style={{ padding: "0 0.5rem", color: "#666", marginBottom: "2rem" }}>
				{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
			</p>

			<div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexDirection: window.innerWidth < 900 ? 'column' : 'row' }}>
				{/* Filters Sidebar */}
				<div style={{ 
					width: window.innerWidth < 900 ? '100%' : '280px',
					minWidth: window.innerWidth < 900 ? '100%' : '280px',
					maxWidth: '100%',
					flexShrink: 0,
					background: 'white',
					border: '1px solid #e8e8e8',
					borderRadius: '12px',
					padding: '1.5rem',
					position: window.innerWidth < 900 ? 'static' : 'sticky',
					top: '20px'
				}}>
					<h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '700' }}>🔧 Filters</h3>

					{/* Sort By */}
					<div style={{ marginBottom: '2rem' }}>
						<h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '600' }}>Sort By</h4>
						<select 
							value={sortBy} 
							onChange={(e) => setSortBy(e.target.value)}
							style={{ 
								width: '100%', 
								padding: '0.5rem', 
								borderRadius: '6px', 
								border: '1px solid #ddd',
								fontSize: '0.95rem'
							}}
						>
							<option value="relevance">Relevance</option>
							<option value="price-low">Price: Low to High</option>
							<option value="price-high">Price: High to Low</option>
							<option value="rating">Customer Rating</option>
							<option value="newest">Newest First</option>
						</select>
					</div>

					{/* Stock Filter */}
					<div style={{ marginBottom: '2rem' }}>
						<h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '600' }}>Availability</h4>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
							<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
								<input 
									type="radio" 
									name="stock" 
									checked={stockFilter === 'all'}
									onChange={() => setStockFilter('all')}
									style={{ marginRight: '0.5rem' }}
								/>
								All Products
							</label>
							<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
								<input 
									type="radio" 
									name="stock" 
									checked={stockFilter === 'in-stock'}
									onChange={() => setStockFilter('in-stock')}
									style={{ marginRight: '0.5rem' }}
								/>
								In Stock
							</label>
							<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
								<input 
									type="radio" 
									name="stock" 
									checked={stockFilter === 'out-of-stock'}
									onChange={() => setStockFilter('out-of-stock')}
									style={{ marginRight: '0.5rem' }}
								/>
								Out of Stock
							</label>
						</div>
					</div>

					{/* Brand Filter */}
					{availableBrands.length > 0 && (
						<div style={{ marginBottom: '2rem' }}>
							<h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '600' }}>Brand</h4>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
								{availableBrands.map(brand => (
									<label key={brand} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
										<input 
											type="checkbox"
											checked={selectedBrands.includes(brand)}
											onChange={() => toggleBrand(brand)}
											style={{ marginRight: '0.5rem' }}
										/>
										{brand}
									</label>
								))}
							</div>
						</div>
					)}

					{/* Clear Filters */}
					{(selectedBrands.length > 0 || stockFilter !== 'all' || sortBy !== 'relevance') && (
						<button
							onClick={() => {
								setSelectedBrands([]);
								setStockFilter('all');
								setSortBy('relevance');
							}}
							style={{
								width: '100%',
								padding: '0.75rem',
								background: '#6c757d',
								color: 'white',
								border: 'none',
								borderRadius: '8px',
								cursor: 'pointer',
								fontWeight: '600'
							}}
						>
							Clear All Filters
						</button>
					)}
				</div>

				{/* Products Grid */}
				<div style={{ flex: 1, minWidth: 0, width: '100%' }}>
					{filteredProducts.length === 0 ? (
						<div className="empty-state">
							<p style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>No products found</p>
							<p style={{ fontSize: "1rem", color: "#666", marginBottom: "2rem" }}>Try adjusting your filters or search terms</p>
							<button
								onClick={() => {
									setSearchTerm('');
									setSelectedBrands([]);
									setStockFilter('all');
									setSortBy('relevance');
									setSearchParams({});
								}}
								className="primary-button"
								style={{ display: "inline-block", padding: "1rem 2rem" }}
							>
								Clear All & View All Products
							</button>
						</div>
					) : (
						<div className="amazon-product-grid">
							{filteredProducts.map((p) => {
								const stockStatus = getStockStatus(p.stock);
								return (
									<div key={p.id} className="amazon-product-card" style={{ position: 'relative' }}>
										{/* Wishlist Heart */}
										<button
											onClick={(e) => toggleWishlist(e, p)}
											style={{
												position: 'absolute',
												top: '10px',
												right: '10px',
												background: 'white',
												border: 'none',
												borderRadius: '50%',
												width: '40px',
												height: '40px',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												cursor: 'pointer',
												zIndex: 10,
												boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
												fontSize: '1.2rem'
											}}
											title={isInWishlist(p.id) ? 'Remove from wishlist' : 'Add to wishlist'}
										>
											{isInWishlist(p.id) ? '❤️' : '🤍'}
										</button>

										{/* Stock Badge */}
										<div style={{
											position: 'absolute',
											top: '10px',
											left: '10px',
											background: stockStatus.bg,
											color: stockStatus.color,
											padding: '0.25rem 0.75rem',
											borderRadius: '6px',
											fontSize: '0.85rem',
											fontWeight: '600',
											zIndex: 10
										}}>
											{stockStatus.text}
										</div>

										<div className="amazon-product-image-wrapper">
											<img src={p.image} alt={p.title} />
											{/* Quick View Button */}
											<button
												onClick={(e) => openQuickView(e, p)}
												style={{
													position: 'absolute',
													bottom: '10px',
													left: '50%',
													transform: 'translateX(-50%)',
													padding: '0.5rem 1rem',
													background: 'rgba(0,0,0,0.7)',
													color: 'white',
													border: 'none',
													borderRadius: '6px',
													cursor: 'pointer',
													opacity: 0,
													transition: 'opacity 0.3s',
													fontWeight: '600',
													fontSize: '0.9rem'
												}}
												className="quick-view-btn"
											>
												👁️ Quick View
											</button>
										</div>
										<div className="amazon-product-info">
											<div className="amazon-product-category">{p.category}</div>
											{p.brand && (
												<div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
													{p.brand}
												</div>
											)}
											<div className="amazon-product-title">
												<Link to={`/products/${p.id}`}>{p.title}</Link>
											</div>
											<div className="amazon-product-rating">
												{'★'.repeat(Math.round(p.rating || 0))} <span className="rating-number">{p.rating?.toFixed?.(1) || 'N/A'}</span>
											</div>
											<div className="amazon-product-price">
												<span className="currency">₹</span>
												{Number(p.price).toLocaleString()}
											</div>
											<div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
												<Link 
													className="primary-button" 
													to={`/products/${p.id}`}
													style={{ flex: 1, textAlign: 'center', padding: '0.75rem', fontSize: '0.9rem' }}
												>
													View Details
												</Link>
												{p.stock > 0 && (
													<button
														onClick={(e) => {
															e.preventDefault();
															addItem(p);
														}}
														style={{
															padding: '0.75rem',
															background: '#4caf50',
															color: 'white',
															border: 'none',
															borderRadius: '8px',
															cursor: 'pointer',
															fontWeight: '600',
															fontSize: '1.2rem'
														}}
														title="Add to Cart"
													>
														🛒
													</button>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>

			{/* Quick View Modal */}
			{showQuickView && quickViewProduct && (
				<div 
					onClick={() => setShowQuickView(false)}
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: 'rgba(0,0,0,0.5)',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 1000,
						padding: '2rem'
					}}
				>
					<div 
						onClick={(e) => e.stopPropagation()}
						style={{
							background: 'white',
							borderRadius: '12px',
							padding: '2rem',
							maxWidth: '800px',
							width: '100%',
							maxHeight: '90vh',
							overflow: 'auto'
						}}
					>
						<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
							<h2>Quick View</h2>
							<button
								onClick={() => setShowQuickView(false)}
								style={{
									background: 'none',
									border: 'none',
									fontSize: '1.5rem',
									cursor: 'pointer'
								}}
							>
								✕
							</button>
						</div>
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
							<div>
								<img 
									src={quickViewProduct.image} 
									alt={quickViewProduct.title}
									style={{ width: '100%', borderRadius: '8px' }}
								/>
							</div>
							<div>
								<h3 style={{ marginBottom: '0.5rem' }}>{quickViewProduct.title}</h3>
								{quickViewProduct.brand && (
									<p style={{ color: '#666', marginBottom: '0.5rem' }}>{quickViewProduct.brand}</p>
								)}
								<div style={{ marginBottom: '1rem' }}>
									{'★'.repeat(Math.round(quickViewProduct.rating || 0))} 
									<span style={{ marginLeft: '0.5rem', color: '#666' }}>
										{quickViewProduct.rating?.toFixed(1) || 'N/A'}
									</span>
								</div>
								<div style={{ 
									fontSize: '2rem', 
									fontWeight: '700', 
									color: '#e71d36',
									marginBottom: '1rem'
								}}>
									₹{quickViewProduct.price?.toLocaleString()}
								</div>
								<div style={{
									padding: '0.5rem 1rem',
									background: getStockStatus(quickViewProduct.stock).bg,
									color: getStockStatus(quickViewProduct.stock).color,
									borderRadius: '6px',
									display: 'inline-block',
									marginBottom: '1rem',
									fontWeight: '600'
								}}>
									{getStockStatus(quickViewProduct.stock).text}
								</div>
								<p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: '1.6' }}>
									{quickViewProduct.description?.substring(0, 200)}...
								</p>
								<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
									<button
										onClick={() => {
											if (quickViewProduct.stock > 0) {
												addItem(quickViewProduct);
												setShowQuickView(false);
											}
										}}
										disabled={quickViewProduct.stock === 0}
										style={{
											padding: '1rem',
											background: quickViewProduct.stock > 0 ? '#e71d36' : '#ccc',
											color: 'white',
											border: 'none',
											borderRadius: '8px',
											cursor: quickViewProduct.stock > 0 ? 'pointer' : 'not-allowed',
											fontWeight: '600',
											fontSize: '1rem'
										}}
									>
										🛒 Add to Cart
									</button>
									<button
										onClick={() => navigate(`/products/${quickViewProduct.id}`)}
										style={{
											padding: '1rem',
											background: 'white',
											color: '#e71d36',
											border: '2px solid #e71d36',
											borderRadius: '8px',
											cursor: 'pointer',
											fontWeight: '600',
											fontSize: '1rem'
										}}
									>
										View Full Details
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			<style>{`
				.amazon-product-card:hover .quick-view-btn {
					opacity: 1;
				}
			`}</style>
		</div>
	);
}
