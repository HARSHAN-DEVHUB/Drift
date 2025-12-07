import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartProvider";
import { productService } from "../services/productService";

export default function ProductDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const { addItem } = useCart();

	useEffect(() => {
		const loadProduct = async () => {
			try {
				const firebaseProduct = await productService.getProductById(id);
				// Transform Firebase product to match expected format
				const transformedProduct = {
					...firebaseProduct,
					image: firebaseProduct.images?.[0] || firebaseProduct.image || 'https://via.placeholder.com/400'
				};
				setProduct(transformedProduct);
			} catch (error) {
				console.error("Error loading product:", error);
				setProduct(null);
			} finally {
				setLoading(false);
			}
		};

		loadProduct();
	}, [id]);

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
		addItem(product);
		alert("✓ Added to cart successfully!");
	};

	const handleBuyNow = () => {
		addItem(product);
		navigate("/checkout");
	};

	const images = product.images || [product.image];
	const currentImage = images[currentImageIndex];

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % images.length);
	};

	const prevImage = () => {
		setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
	};

	return (
		<div className="page-shell product-detail" style={{ maxWidth: "1200px" }}>
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
					<p className="amazon-product-rating">
						{'★'.repeat(Math.round(product.rating))} <span className="rating-number">{product.rating.toFixed(1)}</span>
					</p>
					<p className="product-detail-price">
						{product.mrp && <span style={{ textDecoration: 'line-through', color: '#888', marginRight: '10px' }}>MRP ₹{product.mrp.toFixed(2)}</span>}
						<span className="currency">₹</span>
						{product.price.toFixed(2)}
					</p>
					<p className="product-detail-description">{product.description}</p>
				</div>
				<aside className="product-detail-buybox">
					<p className="product-detail-price">
						{product.mrp && <span style={{ textDecoration: 'line-through', color: '#888', marginRight: '10px' }}>MRP ₹{product.mrp.toFixed(2)}</span>}
						<span className="currency">₹</span>
						{product.price.toFixed(2)}
					</p>
					<p className="text-muted">FREE delivery with DRIFT ENTERPRISES Prime. This is a demo experience.</p>
					<button className="primary-button wide" onClick={handleAddToCart} style={{ width: "100%" }}>
						🛒 Add to Cart
					</button>
					<button className="primary-button wide" onClick={handleBuyNow} style={{ marginTop: ".75rem", width: "100%", background: "linear-gradient(135deg, #1a1a1a 0%, #000000 100%)" }}>
						⚡ Buy Now
					</button>
				</aside>
			</div>
			<p style={{ marginTop: ".75rem", fontSize: ".85rem" }}>
				<Link to="/products" className="amazon-link">
					Back to all products
				</Link>
			</p>
		</div>
	);
}
