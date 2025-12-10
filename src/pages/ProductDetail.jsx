import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ref as dbRef, get, push, serverTimestamp } from "firebase/database";
import { database } from "../config/firebase";
import { useCart } from "../components/CartProvider";
import { useWishlist } from "../contexts/WishlistContext";
import { useRecentlyViewed } from "../contexts/RecentlyViewedContext";
import { useAuth } from "../contexts/AuthContext";
import { productService } from "../services/productService";

export default function ProductDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [product, setProduct] = useState(null);
	const [relatedProducts, setRelatedProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [reviews, setReviews] = useState([]);
	const [reviewsLoading, setReviewsLoading] = useState(false);
	const [showReviewForm, setShowReviewForm] = useState(false);
	const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
	const [submittingReview, setSubmittingReview] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const { addItem } = useCart();
	const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
	const { addToRecentlyViewed, recentlyViewed } = useRecentlyViewed();

	useEffect(() => {
		const loadProduct = async () => {
			try {
				const firebaseProduct = await productService.getProductById(id);
				// Transform Firebase product to match expected format
				const transformedProduct = {
					...firebaseProduct,
					image: firebaseProduct.images?.[0] || firebaseProduct.image || 'https://via.placeholder.com/400',
					stock: firebaseProduct.stock !== undefined ? firebaseProduct.stock : 100
				};
				setProduct(transformedProduct);
				
				// Add to recently viewed
				addToRecentlyViewed(transformedProduct);
				
				// Load related products (same category)
				const allProducts = await productService.getAllProducts();
				const related = allProducts
					.filter(p => p.category === transformedProduct.category && p.id !== id)
					.slice(0, 4);
				setRelatedProducts(related);
			} catch (error) {
				console.error("Error loading product:", error);
				setProduct(null);
			} finally {
				setLoading(false);
			}
		};

		loadProduct();
		loadReviews();
	}, [id]);

	const loadReviews = async () => {
		setReviewsLoading(true);
		try {
			const reviewsRef = dbRef(database, 'reviews');
			const snapshot = await get(reviewsRef);
			if (snapshot.exists()) {
				const allReviews = snapshot.val();
				const productReviews = Object.entries(allReviews)
					.filter(([_, review]) => review.productId === id && review.status === 'approved')
					.map(([key, review]) => ({ id: key, ...review }))
					.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
				setReviews(productReviews);
			}
		} catch (error) {
			console.error('Error loading reviews:', error);
		} finally {
			setReviewsLoading(false);
		}
	};

	const handleSubmitReview = async (e) => {
		e.preventDefault();
		if (!user) {
			alert('Please login to post a review');
			return;
		}
		if (!reviewForm.comment.trim()) {
			alert('Please write a comment');
			return;
		}

		setSubmittingReview(true);
		try {
			const reviewsRef = dbRef(database, 'reviews');
			await push(reviewsRef, {
				productId: id,
				userId: user.uid,
				userName: user.displayName || 'Anonymous',
				rating: parseInt(reviewForm.rating),
				comment: reviewForm.comment,
				status: 'pending',
				createdAt: new Date().toISOString()
			});
			alert('✅ Review submitted! It will appear after admin approval.');
			setReviewForm({ rating: 5, comment: '' });
			setShowReviewForm(false);
		} catch (error) {
			console.error('Error submitting review:', error);
			alert('❌ Failed to submit review');
		} finally {
			setSubmittingReview(false);
		}
	};

	if (loading) {
		return (
			<div className="page-shell" style={{ maxWidth: "1200px", textAlign: "center", padding: "4rem 2rem" }}>
				<p style={{ fontSize: '2rem', color: '#e71d36', fontWeight: '700' }}>⏳ Loading product...</p>
			</div>
		);
	}

	if (!product)
		return (
			<div className="page-shell" style={{ maxWidth: "1200px", textAlign: "center" }}>
				<h1>Product not found</h1>
				<p>The product you're looking for doesn't exist.</p>
				<Link to="/products" style={{ color: "#e50914", fontWeight: "bold" }}>
					Back to products
				</Link>
			</div>
		);

	const handleAddToCart = () => {
		if (product.stock === 0) {
			alert("❌ This product is out of stock!");
			return;
		}
		if (quantity > product.stock) {
			alert(`❌ Only ${product.stock} items available in stock!`);
			return;
		}
		for (let i = 0; i < quantity; i++) {
			addItem(product);
		}
		alert(`✓ Added ${quantity} item(s) to cart successfully!`);
	};

	const handleBuyNow = () => {
		if (product.stock === 0) {
			alert("❌ This product is out of stock!");
			return;
		}
		if (quantity > product.stock) {
			alert(`❌ Only ${product.stock} items available in stock!`);
			return;
		}
		for (let i = 0; i < quantity; i++) {
			addItem(product);
		}
		navigate("/checkout");
	};

	const toggleWishlist = () => {
		if (isInWishlist(product.id)) {
			removeFromWishlist(product.id);
		} else {
			addToWishlist(product);
		}
	};

	const getStockStatus = (stock) => {
		if (stock === 0) return { text: 'Out of Stock', color: '#f44336', bg: '#ffebee' };
		if (stock < 10) return { text: `Only ${stock} left in stock!`, color: '#ff9800', bg: '#fff3e0' };
		return { text: 'In Stock', color: '#4caf50', bg: '#e8f5e9' };
	};

	const images = product.images || [product.image];
	const currentImage = images[currentImageIndex];
	const stockStatus = getStockStatus(product.stock);

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % images.length);
	};

	const prevImage = () => {
		setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
	};

	return (
		<div className="page-shell product-detail" style={{ maxWidth: "1200px" }}>
			{/* Breadcrumbs */}
			<div style={{ 
				padding: '1rem 0.5rem', 
				color: '#666', 
				fontSize: '0.9rem',
				display: 'flex',
				alignItems: 'center',
				gap: '0.5rem'
			}}>
				<Link to="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
				<span>›</span>
				<Link to="/products" style={{ color: '#666', textDecoration: 'none' }}>Products</Link>
				<span>›</span>
				{product.category && (
					<>
						<Link to={`/products?category=${product.category.toLowerCase()}`} style={{ color: '#666', textDecoration: 'none' }}>
							{product.category}
						</Link>
						<span>›</span>
					</>
				)}
				<span style={{ color: '#1a1a1a', fontWeight: '600' }}>{product.title?.substring(0, 30)}...</span>
			</div>

			<div className="product-detail-layout">
				<div className="product-detail-image">
					{images.length > 1 && (
						<div style={{ position: 'relative' }}>
							<button onClick={prevImage} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}>{'<'}</button>
							<img src={currentImage} alt={product.title} style={{ width: '100%', height: 'auto' }} />
							<button onClick={nextImage} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}>{'>'}</button>
							<div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
								{images.map((_, index) => (
									<span key={index} onClick={() => setCurrentImageIndex(index)} style={{ width: '10px', height: '10px', borderRadius: '50%', background: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer' }}></span>
								))}
							</div>
						</div>
					)}
					{images.length === 1 && <img src={currentImage} alt={product.title} />}
				</div>
				<div className="product-detail-main">
					<h1>{product.title}</h1>
					{product.brand && (
						<p style={{ color: '#666', marginBottom: '0.5rem' }}>Brand: <strong>{product.brand}</strong></p>
					)}
					<p className="amazon-product-rating">
						{'★'.repeat(Math.round(product.rating || 0))} <span className="rating-number">{product.rating?.toFixed(1) || 'N/A'}</span>
						<span style={{ marginLeft: '1rem', color: '#666' }}>({reviews.length} reviews)</span>
					</p>
					
					{/* Stock Status Badge */}
					<div style={{
						display: 'inline-block',
						padding: '0.5rem 1rem',
						background: stockStatus.bg,
						color: stockStatus.color,
						borderRadius: '8px',
						fontWeight: '600',
						margin: '1rem 0'
					}}>
						{stockStatus.text}
					</div>

					<p className="product-detail-price">
						{product.mrp && <span style={{ textDecoration: 'line-through', color: '#888', marginRight: '10px' }}>MRP ₹{product.mrp.toFixed(2)}</span>}
						<span className="currency">₹</span>
						{product.price?.toFixed(2)}
						{product.mrp && product.price && (
							<span style={{ marginLeft: '1rem', color: '#4caf50', fontSize: '1rem', fontWeight: '600' }}>
								{Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
							</span>
						)}
					</p>
					<p className="product-detail-description">{product.description}</p>
					
					{/* Key Features */}
					{product.features && product.features.length > 0 && (
						<div style={{ marginTop: '1.5rem' }}>
							<h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>Key Features:</h3>
							<ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
								{product.features.map((feature, index) => (
									<li key={index}>{feature}</li>
								))}
							</ul>
						</div>
					)}
				</div>
				<aside className="product-detail-buybox">
					<p className="product-detail-price">
						{product.mrp && <span style={{ textDecoration: 'line-through', color: '#888', marginRight: '10px' }}>MRP ₹{product.mrp.toFixed(2)}</span>}
						<span className="currency">₹</span>
						{product.price?.toFixed(2)}
					</p>
					
					{/* Stock Status */}
					<div style={{
						padding: '0.75rem',
						background: stockStatus.bg,
						color: stockStatus.color,
						borderRadius: '8px',
						fontWeight: '600',
						marginBottom: '1rem',
						textAlign: 'center'
					}}>
						{stockStatus.text}
					</div>

					<p className="text-muted">FREE delivery with DRIFT ENTERPRISES Prime. This is a demo experience.</p>
					
					{/* Quantity Selector */}
					{product.stock > 0 && (
						<div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
							<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
								Quantity:
							</label>
							<select 
								value={quantity}
								onChange={(e) => setQuantity(Number(e.target.value))}
								style={{ 
									width: '100%', 
									padding: '0.75rem', 
									borderRadius: '8px', 
									border: '1px solid #ddd',
									fontSize: '1rem'
								}}
							>
								{[...Array(Math.min(product.stock, 10))].map((_, i) => (
									<option key={i + 1} value={i + 1}>{i + 1}</option>
								))}
							</select>
						</div>
					)}

					<button 
						className="primary-button wide" 
						onClick={handleAddToCart} 
						disabled={product.stock === 0}
						style={{ 
							width: "100%",
							opacity: product.stock === 0 ? 0.5 : 1,
							cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
						}}
					>
						{product.stock === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
					</button>
					<button 
						className="primary-button wide" 
						onClick={handleBuyNow} 
						disabled={product.stock === 0}
						style={{ 
							marginTop: ".75rem", 
							width: "100%", 
							background: product.stock === 0 ? '#ccc' : "linear-gradient(135deg, #1a1a1a 0%, #000000 100%)",
							cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
						}}
					>
						⚡ Buy Now
					</button>
					<button
						onClick={toggleWishlist}
						style={{
							marginTop: '.75rem',
							width: '100%',
							padding: '0.75rem',
							background: 'white',
							color: isInWishlist(product.id) ? '#e71d36' : '#666',
							border: `2px solid ${isInWishlist(product.id) ? '#e71d36' : '#ddd'}`,
							borderRadius: '8px',
							cursor: 'pointer',
							fontWeight: '600',
							fontSize: '1rem'
						}}
					>
						{isInWishlist(product.id) ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
					</button>
				</aside>
			</div>
			<p style={{ marginTop: ".75rem", fontSize: ".85rem" }}>
				<Link to="/products" className="amazon-link">
					Back to all products
				</Link>
			</p>

			{/* Related Products */}
			{relatedProducts.length > 0 && (
				<div style={{ marginTop: '3rem', borderTop: '2px solid #e8e8e8', paddingTop: '2rem' }}>
					<h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>🔗 Related Products</h2>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
						{relatedProducts.map((related) => (
							<Link 
								key={related.id} 
								to={`/products/${related.id}`}
								style={{ textDecoration: 'none', color: 'inherit' }}
							>
								<div style={{ 
									background: 'white',
									border: '1px solid #e8e8e8',
									borderRadius: '12px',
									overflow: 'hidden',
									transition: 'transform 0.2s, box-shadow 0.2s',
									cursor: 'pointer'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.transform = 'translateY(-5px)';
									e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform = 'translateY(0)';
									e.currentTarget.style.boxShadow = 'none';
								}}
								>
									<img 
										src={related.images?.[0] || related.image} 
										alt={related.title}
										style={{ width: '100%', height: '200px', objectFit: 'cover' }}
									/>
									<div style={{ padding: '1rem' }}>
										<h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
											{related.title}
										</h3>
										<p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#e71d36' }}>
											₹{related.price?.toLocaleString()}
										</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			)}

			{/* Recently Viewed */}
			{recentlyViewed.length > 1 && (
				<div style={{ marginTop: '3rem', borderTop: '2px solid #e8e8e8', paddingTop: '2rem' }}>
					<h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>👁️ Recently Viewed</h2>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
						{recentlyViewed.filter(item => item.id !== id).slice(0, 5).map((viewed) => (
							<Link 
								key={viewed.id} 
								to={`/products/${viewed.id}`}
								style={{ textDecoration: 'none', color: 'inherit' }}
							>
								<div style={{ 
									background: 'white',
									border: '1px solid #e8e8e8',
									borderRadius: '8px',
									overflow: 'hidden',
									fontSize: '0.9rem'
								}}>
									<img 
										src={viewed.image} 
										alt={viewed.title}
										style={{ width: '100%', height: '150px', objectFit: 'cover' }}
									/>
									<div style={{ padding: '0.75rem' }}>
										<p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.25rem' }}>
											{viewed.title}
										</p>
										<p style={{ fontWeight: '700', color: '#e71d36' }}>
											₹{viewed.price?.toLocaleString()}
										</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			)}

			{/* Reviews Section */}
			<div style={{ marginTop: '3rem', borderTop: '2px solid #e8e8e8', paddingTop: '2rem' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
					<h2 style={{ fontSize: '1.5rem' }}>⭐ Reviews ({reviews.length})</h2>
					<button 
						onClick={() => setShowReviewForm(!showReviewForm)}
						style={{ padding: '0.75rem 1.5rem', background: '#e71d36', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
					>
						{showReviewForm ? '❌ Cancel' : '✍️ Write Review'}
					</button>
				</div>

				{showReviewForm && (
					<form onSubmit={handleSubmitReview} style={{ background: '#f9f9f9', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e8e8e8' }}>
						<div style={{ marginBottom: '1.5rem' }}>
							<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Rating:</label>
							<select 
								value={reviewForm.rating}
								onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
								style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
							>
								<option value="5">⭐⭐⭐⭐⭐ Excellent</option>
								<option value="4">⭐⭐⭐⭐ Very Good</option>
								<option value="3">⭐⭐⭐ Good</option>
								<option value="2">⭐⭐ Fair</option>
								<option value="1">⭐ Poor</option>
							</select>
						</div>
						<div style={{ marginBottom: '1.5rem' }}>
							<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Your Review:</label>
							<textarea 
								value={reviewForm.comment}
								onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
								placeholder="Share your experience with this product..."
								style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', minHeight: '120px', fontFamily: 'inherit' }}
							/>
						</div>
						<button 
							type="submit"
							disabled={submittingReview}
							style={{ padding: '0.75rem 2rem', background: '#e71d36', color: 'white', border: 'none', borderRadius: '8px', cursor: submittingReview ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: submittingReview ? 0.6 : 1 }}
						>
							{submittingReview ? '⏳ Submitting...' : '📤 Submit Review'}
						</button>
					</form>
				)}

				{reviewsLoading ? (
					<p style={{ textAlign: 'center', color: '#666' }}>⏳ Loading reviews...</p>
				) : reviews.length === 0 ? (
					<p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No reviews yet. Be the first to review!</p>
				) : (
					<div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
						{reviews.map((review) => (
							<div 
								key={review.id}
								style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e8e8e8' }}
							>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
									<div>
										<p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{review.userName}</p>
										<p style={{ color: '#999', fontSize: '0.85rem' }}>
											{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
										</p>
									</div>
									<p style={{ fontSize: '1.1rem' }}>{'⭐'.repeat(review.rating)}</p>
								</div>
								<p style={{ color: '#333', lineHeight: '1.6' }}>{review.comment}</p>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
