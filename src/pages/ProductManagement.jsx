import React, { useState, useEffect } from 'react';
import { productService, categoryService } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import { initCategories } from '../utils/initCategories';

export default function ProductManagement() {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState('products');
	const [selectedCategory, setSelectedCategory] = useState('appliances');
	const [selectedSubcategory, setSelectedSubcategory] = useState('refrigerator');
	const [formData, setFormData] = useState({
		title: '',
		price: '',
		rating: '',
		description: '',
		brand: '',
		specifications: '',
		isTrending: false,
		isFeatured: false,
		priority: 0
	});
	const [imageFiles, setImageFiles] = useState([]);
	const [imagePreviews, setImagePreviews] = useState([]);
	const [newSubsectionData, setNewSubsectionData] = useState({
		category: 'appliances',
		name: ''
	});
	const [newCategoryData, setNewCategoryData] = useState({
		name: '',
		description: ''
	});
	const [categories, setCategories] = useState({});
	const [allProducts, setAllProducts] = useState([]);
	const [filteredProducts, setFilteredProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
	const [sortBy, setSortBy] = useState('newest');
	const [filterCategory, setFilterCategory] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');

	// Load categories and products on mount
	useEffect(() => {
		loadCategories();
		loadProducts();
	}, []);

	const loadCategories = async () => {
		try {
			const cats = await categoryService.getAllCategories();
			setCategories(cats);
			
			// Set initial category and subcategory
			const firstCategory = Object.keys(cats)[0];
			if (firstCategory) {
				setSelectedCategory(firstCategory);
				setSelectedSubcategory(cats[firstCategory][0] || '');
				setNewSubsectionData({ category: firstCategory, name: '' });
			}
		} catch (error) {
			console.error('Error loading categories:', error);
		}
	};

	const handleInitCategories = async () => {
		try {
			await initCategories();
			alert('✅ Categories initialized! Reloading...');
			await loadCategories();
		} catch (error) {
			alert('❌ Failed to initialize categories');
		}
	};

	const loadProducts = async () => {
		try {
			const products = await productService.getAllProducts();
			setAllProducts(products);
			setFilteredProducts(products);
		} catch (error) {
			console.error('Error loading products:', error);
		}
	};

	// Filter and sort products
	useEffect(() => {
		let filtered = [...allProducts];

		// Filter by category
		if (filterCategory !== 'all') {
			filtered = filtered.filter(p => p.category === filterCategory);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			filtered = filtered.filter(p => 
				p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Sort products
		switch (sortBy) {
			case 'name-asc':
				filtered.sort((a, b) => a.title?.localeCompare(b.title));
				break;
			case 'name-desc':
				filtered.sort((a, b) => b.title?.localeCompare(a.title));
				break;
			case 'price-asc':
				filtered.sort((a, b) => a.price - b.price);
				break;
			case 'price-desc':
				filtered.sort((a, b) => b.price - a.price);
				break;
			case 'priority':
				filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0));
				break;
			case 'newest':
			default:
				filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
				break;
		}

		setFilteredProducts(filtered);
	}, [allProducts, sortBy, filterCategory, searchQuery]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleCategoryChange = (e) => {
		const newCategory = e.target.value;
		setSelectedCategory(newCategory);
		setSelectedSubcategory(categories[newCategory]?.[0] || '');
	};

	const handleImageUpload = (e) => {
		const files = Array.from(e.target.files);
		setImageFiles(files);
		
		// Create previews
		const previews = [];
		files.forEach(file => {
			const reader = new FileReader();
			reader.onloadend = () => {
				previews.push(reader.result);
				if (previews.length === files.length) {
					setImagePreviews(previews);
				}
			};
			reader.readAsDataURL(file);
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitStatus({ type: '', message: '' });

		if (!formData.title || !formData.price || imageFiles.length === 0) {
			setSubmitStatus({ type: 'error', message: 'Please fill all required fields and upload at least one image' });
			return;
		}

		setLoading(true);

		try {
			const productData = {
				category: selectedCategory,
				subcategory: selectedSubcategory,
				title: formData.title,
				price: parseFloat(formData.price),
				rating: parseFloat(formData.rating) || 0,
				description: formData.description,
				brand: formData.brand || selectedSubcategory,
				specifications: formData.specifications,
				isTrending: formData.isTrending,
				isFeatured: formData.isFeatured,
				priority: parseInt(formData.priority) || 0,
				addedBy: user.uid,
				addedByName: user.fullName
			};

			await productService.createProduct(productData, imageFiles);
			
			setSubmitStatus({ type: 'success', message: '✓ Product added successfully!' });
			
			// Reset form
			setFormData({
				title: '',
				price: '',
				rating: '',
				description: '',
				brand: '',
				specifications: '',
				isTrending: false,
				isFeatured: false,
				priority: 0
			});
			setImageFiles([]);
			setImagePreviews([]);
			
			// Reload products
			loadProducts();
			
			// Clear success message after 3 seconds
			setTimeout(() => setSubmitStatus({ type: '', message: '' }), 3000);
		} catch (error) {
			console.error('Error adding product:', error);
			setSubmitStatus({ type: 'error', message: 'Failed to add product. Please try again.' });
		} finally {
			setLoading(false);
		}
	};

	const handleAddSubsection = async (e) => {
		e.preventDefault();
		if (!newSubsectionData.name.trim()) {
			alert('Please enter a subsection name');
			return;
		}

		const subsectionName = newSubsectionData.name.toLowerCase().replace(/\s+/g, '-');
		const updatedCategories = { ...categories };
		
		if (!updatedCategories[newSubsectionData.category]) {
			updatedCategories[newSubsectionData.category] = [];
		}
		
		if (updatedCategories[newSubsectionData.category].includes(subsectionName)) {
			alert('This subsection already exists');
			return;
		}

		updatedCategories[newSubsectionData.category].push(subsectionName);
		
		try {
			await categoryService.saveCategory(
				newSubsectionData.category,
				updatedCategories[newSubsectionData.category]
			);
			setCategories(updatedCategories);
			alert(`Subsection "${subsectionName}" added to ${newSubsectionData.category}!`);
			setNewSubsectionData({ category: newSubsectionData.category, name: '' });
		} catch (error) {
			alert('Failed to add subsection. Please try again.');
		}
	};

	const handleRemoveSubsection = async (category, subsection) => {
		if (window.confirm(`Remove "${subsection}" from ${category}?`)) {
			const updatedCategories = { ...categories };
			updatedCategories[category] = updatedCategories[category].filter(s => s !== subsection);
			
			try {
				await categoryService.saveCategory(category, updatedCategories[category]);
				setCategories(updatedCategories);
				alert(`Subsection "${subsection}" removed!`);
			} catch (error) {
				alert('Failed to remove subsection. Please try again.');
			}
		}
	};

	const handleAddCategory = async (e) => {
		e.preventDefault();
		if (!newCategoryData.name.trim()) {
			alert('Please enter a category name');
			return;
		}

		const categoryName = newCategoryData.name.toLowerCase().replace(/\s+/g, '-');
		const updatedCategories = { ...categories };
		
		if (updatedCategories[categoryName]) {
			alert('This category already exists');
			return;
		}

		updatedCategories[categoryName] = [];
		
		try {
			await categoryService.saveCategory(categoryName, []);
			setCategories(updatedCategories);
			alert(`Category "${categoryName}" added successfully!`);
			setNewCategoryData({ name: '', description: '' });
		} catch (error) {
			alert('Failed to add category. Please try again.');
		}
	};

	const handleRemoveCategory = async (category) => {
		if (window.confirm(`Remove category "${category}" and all its subsections?`)) {
			try {
				await categoryService.deleteCategory(category);
				const updatedCategories = { ...categories };
				delete updatedCategories[category];
				setCategories(updatedCategories);
				alert(`Category "${category}" removed!`);
			} catch (error) {
				alert('Failed to remove category. Please try again.');
			}
		}
	};

	const handleDeleteProduct = async (productId) => {
		if (window.confirm('Are you sure you want to delete this product?')) {
			try {
				await productService.deleteProduct(productId);
				loadProducts();
				alert('Product deleted successfully!');
			} catch (error) {
				alert('Failed to delete product. Please try again.');
			}
		}
	};

	return (
		<div className="page-shell">
			{/* Admin Header */}
			<div style={{ 
				background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', 
				padding: '2rem', 
				borderRadius: '12px', 
				marginBottom: '2rem',
				boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center'
			}}>
				<div>
					<h1 style={{ margin: 0, color: '#fff', fontSize: '2.5rem', fontWeight: '800' }}>
						⚡ Admin Dashboard
					</h1>
					<p style={{ margin: '0.5rem 0 0 0', color: '#e71d36', fontSize: '1.1rem', fontWeight: '600' }}>
						Welcome back, {user?.fullName}
					</p>
					<p style={{ margin: '0.3rem 0 0 0', color: '#aaa', fontSize: '0.95rem' }}>
						Manage products, categories, and inventory
					</p>
				</div>
				{Object.keys(categories).length === 0 && (
					<button
						onClick={handleInitCategories}
						style={{
							padding: '1rem 1.5rem',
							backgroundColor: '#e71d36',
							color: '#fff',
							border: 'none',
							borderRadius: '8px',
							cursor: 'pointer',
							fontWeight: '700',
							fontSize: '1rem',
							boxShadow: '0 2px 8px rgba(231, 29, 54, 0.3)'
						}}
					>
						🔧 Initialize Categories
					</button>
				)}
			</div>

			{/* Tabs Navigation */}
			<div style={{ 
				display: 'flex', 
				gap: '0.5rem', 
				marginBottom: '2rem', 
				borderBottom: '3px solid #1a1a1a',
				flexWrap: 'wrap'
			}}>
				<button 
					onClick={() => setActiveTab('products')}
					style={{ 
						padding: '1rem 2rem', 
						backgroundColor: activeTab === 'products' ? '#e71d36' : 'transparent',
						color: activeTab === 'products' ? '#fff' : '#1a1a1a',
						border: 'none',
						cursor: 'pointer',
						fontWeight: '700',
						fontSize: '1rem',
						borderRadius: '8px 8px 0 0',
						transition: 'all 0.3s ease',
						transform: activeTab === 'products' ? 'translateY(3px)' : 'none'
					}}
				>
					📦 Add Products
				</button>
				<button 
					onClick={() => setActiveTab('list')}
					style={{ 
						padding: '1rem 2rem', 
						backgroundColor: activeTab === 'list' ? '#e71d36' : 'transparent',
						color: activeTab === 'list' ? '#fff' : '#1a1a1a',
						border: 'none',
						cursor: 'pointer',
						fontWeight: '700',
						fontSize: '1rem',
						borderRadius: '8px 8px 0 0',
						transition: 'all 0.3s ease',
						transform: activeTab === 'list' ? 'translateY(3px)' : 'none'
					}}
				>
					📋 Product List
				</button>
				<button 
					onClick={() => setActiveTab('subsections')}
					style={{ 
						padding: '1rem 2rem', 
						backgroundColor: activeTab === 'subsections' ? '#e71d36' : 'transparent',
						color: activeTab === 'subsections' ? '#fff' : '#1a1a1a',
						border: 'none',
						cursor: 'pointer',
						fontWeight: '700',
						fontSize: '1rem',
						borderRadius: '8px 8px 0 0',
						transition: 'all 0.3s ease',
						transform: activeTab === 'subsections' ? 'translateY(3px)' : 'none'
					}}
				>
					🏷️ Manage Subsections
				</button>
				<button 
					onClick={() => setActiveTab('categories')}
					style={{ 
						padding: '1rem 2rem', 
						backgroundColor: activeTab === 'categories' ? '#e71d36' : 'transparent',
						color: activeTab === 'categories' ? '#fff' : '#1a1a1a',
						border: 'none',
						cursor: 'pointer',
						fontWeight: '700',
						fontSize: '1rem',
						borderRadius: '8px 8px 0 0',
						transition: 'all 0.3s ease',
						transform: activeTab === 'categories' ? 'translateY(3px)' : 'none'
					}}
				>
					📁 Manage Categories
				</button>
			</div>

			{/* TAB 1: Add Products */}
			{activeTab === 'products' && (
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
					{/* Form Section */}
					<div>
						<form onSubmit={handleSubmit} style={{ 
							backgroundColor: '#fff', 
							padding: '2rem', 
							borderRadius: '12px', 
							border: '2px solid #1a1a1a',
							boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
						}}>
							<h2 style={{ marginTop: 0, color: '#1a1a1a', fontSize: '1.8rem', fontWeight: '800' }}>
								➕ Add New Product
							</h2>

							{submitStatus.message && (
								<div style={{
									padding: '1rem',
									borderRadius: '8px',
									marginBottom: '1rem',
									backgroundColor: submitStatus.type === 'success' ? '#d4edda' : '#f8d7da',
									color: submitStatus.type === 'success' ? '#155724' : '#721c24',
									border: `1px solid ${submitStatus.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
									fontWeight: '600'
								}}>
									{submitStatus.message}
								</div>
							)}

							<div style={{ marginBottom: '1.2rem' }}>
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a' }}>
									Category *
								</label>
								<select 
									value={selectedCategory}
									onChange={handleCategoryChange}
									style={{ 
										width: '100%', 
										padding: '0.75rem', 
										border: '2px solid #1a1a1a', 
										borderRadius: '8px',
										fontSize: '1rem',
										fontWeight: '600',
										backgroundColor: '#fff'
									}}
								>
									{Object.keys(categories).map(cat => (
										<option key={cat} value={cat}>
											{cat.charAt(0).toUpperCase() + cat.slice(1)}
										</option>
									))}
								</select>
							</div>

							<div style={{ marginBottom: '1.2rem' }}>
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a' }}>
									Subcategory *
								</label>
								<select 
									value={selectedSubcategory}
									onChange={(e) => setSelectedSubcategory(e.target.value)}
									style={{ 
										width: '100%', 
										padding: '0.75rem', 
										border: '2px solid #1a1a1a', 
										borderRadius: '8px',
										fontSize: '1rem',
										fontWeight: '600',
										backgroundColor: '#fff'
									}}
								>
									{(categories[selectedCategory] || []).map(subcat => (
										<option key={subcat} value={subcat}>
											{subcat.charAt(0).toUpperCase() + subcat.slice(1).replace(/-/g, ' ')}
										</option>
									))}
								</select>
							</div>

							<div style={{ marginBottom: '1.2rem' }}>
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a' }}>
									Product Title *
								</label>
								<input 
									type="text"
									name="title"
									value={formData.title}
									onChange={handleInputChange}
									placeholder="Enter product name"
									style={{ 
										width: '100%', 
										padding: '0.75rem', 
										border: '2px solid #1a1a1a', 
										borderRadius: '8px', 
										fontSize: '1rem',
										fontWeight: '600'
									}}
								/>
							</div>

							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
								<div>
									<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a' }}>
										Price (₹) *
									</label>
									<input 
										type="number"
										name="price"
										value={formData.price}
										onChange={handleInputChange}
										placeholder="0.00"
										step="0.01"
										style={{ 
											width: '100%', 
											padding: '0.75rem', 
											border: '2px solid #1a1a1a', 
											borderRadius: '8px', 
											fontSize: '1rem',
											fontWeight: '600'
										}}
									/>
								</div>
								<div>
									<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a' }}>
										Rating (0-5)
									</label>
									<input 
										type="number"
										name="rating"
										value={formData.rating}
										onChange={handleInputChange}
										placeholder="0.0"
										min="0"
										max="5"
										step="0.1"
										style={{ 
											width: '100%', 
											padding: '0.75rem', 
											border: '2px solid #1a1a1a', 
											borderRadius: '8px', 
											fontSize: '1rem',
											fontWeight: '600'
										}}
									/>
								</div>
							</div>

							<div style={{ marginBottom: '1.2rem' }}>
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a' }}>
									Brand
								</label>
								<input 
									type="text"
									name="brand"
									value={formData.brand}
									onChange={handleInputChange}
									placeholder="Brand name (optional)"
									style={{ 
										width: '100%', 
										padding: '0.75rem', 
										border: '2px solid #1a1a1a', 
										borderRadius: '8px', 
										fontSize: '1rem',
										fontWeight: '600'
									}}
								/>
							</div>

							<div style={{ marginBottom: '1.2rem' }}>
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a' }}>
									Description
								</label>
								<textarea 
									name="description"
									value={formData.description}
									onChange={handleInputChange}
									placeholder="Enter product description"
									rows="4"
									style={{ 
										width: '100%', 
										padding: '0.75rem', 
										border: '2px solid #1a1a1a', 
										borderRadius: '8px', 
										fontSize: '1rem', 
										fontFamily: 'inherit',
										fontWeight: '600'
									}}
								/>
							</div>

							<div style={{ marginBottom: '1.2rem' }}>
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a' }}>
									Specifications
								</label>
								<textarea 
									name="specifications"
									value={formData.specifications}
									onChange={handleInputChange}
									placeholder="Enter key specifications (one per line)"
									rows="3"
									style={{ 
										width: '100%', 
										padding: '0.75rem', 
										border: '2px solid #1a1a1a', 
										borderRadius: '8px', 
										fontSize: '1rem', 
										fontFamily: 'inherit',
										fontWeight: '600'
									}}
								/>
							</div>

							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
								<div style={{ 
									padding: '1rem', 
									border: '2px solid #1a1a1a', 
									borderRadius: '8px',
									display: 'flex',
									alignItems: 'center',
									gap: '0.75rem'
								}}>
									<input 
										type="checkbox"
										name="isTrending"
										checked={formData.isTrending}
										onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
										style={{ width: '20px', height: '20px', cursor: 'pointer' }}
									/>
									<label style={{ fontWeight: '700', color: '#1a1a1a', cursor: 'pointer' }} onClick={() => setFormData({ ...formData, isTrending: !formData.isTrending })}>
										🔥 Trending
									</label>
								</div>
								<div style={{ 
									padding: '1rem', 
									border: '2px solid #1a1a1a', 
									borderRadius: '8px',
									display: 'flex',
									alignItems: 'center',
									gap: '0.75rem'
								}}>
									<input 
										type="checkbox"
										name="isFeatured"
										checked={formData.isFeatured}
										onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
										style={{ width: '20px', height: '20px', cursor: 'pointer' }}
									/>
									<label style={{ fontWeight: '700', color: '#1a1a1a', cursor: 'pointer' }} onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}>
										✨ Featured
									</label>
								</div>
								<div>
									<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a', fontSize: '0.9rem' }}>
										Priority Order
									</label>
									<input 
										type="number"
										name="priority"
										value={formData.priority}
										onChange={handleInputChange}
										placeholder="0"
										min="0"
										style={{ 
											width: '100%', 
											padding: '0.75rem', 
											border: '2px solid #1a1a1a', 
											borderRadius: '8px', 
											fontSize: '1rem',
											fontWeight: '600'
										}}
									/>
								</div>
							</div>
							<p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.2rem', fontWeight: '600' }}>
								💡 Higher priority number = shows first. Trending/Featured products appear in special sections.
							</p>

							<div style={{ marginBottom: '1.5rem' }}>
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a' }}>
									Product Images *
								</label>
								<input
									type="file"
									accept="image/*"
									multiple
									onChange={handleImageUpload}
									style={{ 
										width: '100%', 
										padding: '0.75rem', 
										border: '2px solid #1a1a1a', 
										borderRadius: '8px',
										fontSize: '0.95rem',
										fontWeight: '600'
									}}
								/>
								<p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem', fontWeight: '600' }}>
									📸 Recommended: 400x400px, JPG or PNG. You can select multiple images.
								</p>
							</div>

							<button 
								type="submit"
								disabled={loading}
								style={{ 
									width: '100%', 
									padding: '1rem', 
									backgroundColor: loading ? '#999' : '#e71d36', 
									color: '#fff', 
									border: 'none', 
									borderRadius: '8px',
									fontWeight: '800',
									cursor: loading ? 'not-allowed' : 'pointer',
									fontSize: '1.1rem',
									boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
									transition: 'all 0.3s ease'
								}}
							>
								{loading ? '⏳ Adding Product...' : '➕ Add Product'}
							</button>
						</form>
					</div>

					{/* Preview Section */}
					<div>
						<h2 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: '800' }}>
							 Product Preview
						</h2>
						<div style={{ 
							backgroundColor: '#fff', 
							padding: '2rem', 
							borderRadius: '12px', 
							border: '2px solid #1a1a1a',
							boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
						}}>
							<div style={{
								backgroundColor: '#f9f9f9',
								border: '2px solid #e0e0e0',
								borderRadius: '8px',
								overflow: 'hidden',
								textAlign: 'center',
								marginBottom: '1rem'
							}}>
								{imagePreviews.length > 0 ? (
									<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', padding: '1rem' }}>
										{imagePreviews.map((image, index) => (
											<img
												key={index}
												src={image}
												alt={`Product preview ${index + 1}`}
												style={{ 
													width: '100%', 
													height: '150px', 
													objectFit: 'contain', 
													border: '2px solid #e0e0e0', 
													borderRadius: '8px',
													backgroundColor: '#fff'
												}}
											/>
										))}
									</div>
								) : (
									<div style={{ 
										height: '300px', 
										display: 'flex', 
										alignItems: 'center', 
										justifyContent: 'center', 
										color: '#999',
										fontSize: '1.2rem',
										fontWeight: '700'
									}}>
										📷 No images selected
									</div>
								)}
							</div>

							<div>
								<h3 style={{ margin: '0.5rem 0', color: '#1a1a1a', fontSize: '1.5rem', fontWeight: '800' }}>
									{formData.title || 'Product Name'}
								</h3>
								<p style={{ margin: '0.5rem 0', color: '#e71d36', fontSize: '1.8rem', fontWeight: '900' }}>
									₹{formData.price || '0.00'}
								</p>
								<p style={{ margin: '0.5rem 0', color: '#e71d36', fontSize: '1.1rem', fontWeight: '700' }}>
									{'★'.repeat(Math.floor(formData.rating || 0))}{'☆'.repeat(5 - Math.floor(formData.rating || 0))} 
									{formData.rating ? ` (${formData.rating})` : ' (0)'}
								</p>
								{formData.brand && (
									<p style={{ margin: '0.5rem 0', color: '#666', fontSize: '1rem', fontWeight: '700' }}>
										Brand: {formData.brand}
									</p>
								)}
								<p style={{ margin: '1rem 0', color: '#555', fontSize: '0.95rem', lineHeight: '1.6', fontWeight: '600' }}>
									{formData.description || 'Product description will appear here'}
								</p>
								{formData.specifications && (
									<div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
										<p style={{ fontWeight: '700', marginBottom: '0.5rem', color: '#1a1a1a' }}>Specifications:</p>
										<p style={{ fontSize: '0.9rem', color: '#555', whiteSpace: 'pre-line', fontWeight: '600' }}>
											{formData.specifications}
										</p>
									</div>
								)}
							</div>

							<div style={{ 
								marginTop: '1.5rem', 
								padding: '1rem', 
								backgroundColor: '#1a1a1a', 
								borderRadius: '8px', 
								fontSize: '0.9rem', 
								color: '#fff'
							}}>
								<p style={{ marginBottom: '0.5rem', fontWeight: '700' }}>
									<strong>📁 Category:</strong> {selectedCategory}
								</p>
								<p style={{ margin: 0, fontWeight: '700' }}>
									<strong>🏷️ Subcategory:</strong> {selectedSubcategory}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* TAB 2: Product List */}
			{activeTab === 'list' && (
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
						<h2 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
							📋 All Products ({filteredProducts.length} / {allProducts.length})
						</h2>
					</div>

					{/* Filter and Sort Controls */}
					<div style={{ 
						display: 'grid', 
						gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
						gap: '1rem', 
						marginBottom: '1.5rem',
						padding: '1.5rem',
						backgroundColor: '#f9f9f9',
						borderRadius: '12px',
						border: '2px solid #e0e0e0'
					}}>
						<div>
							<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a', fontSize: '0.9rem' }}>
								🔍 Search Products
							</label>
							<input
								type="text"
								placeholder="Search by name, brand, description..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								style={{
									width: '100%',
									padding: '0.75rem',
									border: '2px solid #1a1a1a',
									borderRadius: '8px',
									fontSize: '1rem',
									fontWeight: '600'
								}}
							/>
						</div>

						<div>
							<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a', fontSize: '0.9rem' }}>
								📂 Filter by Category
							</label>
							<select
								value={filterCategory}
								onChange={(e) => setFilterCategory(e.target.value)}
								style={{
									width: '100%',
									padding: '0.75rem',
									border: '2px solid #1a1a1a',
									borderRadius: '8px',
									fontSize: '1rem',
									fontWeight: '600',
									cursor: 'pointer'
								}}
							>
								<option value="all">All Categories</option>
								{Object.keys(categories).map((cat) => (
									<option key={cat} value={cat}>{cat}</option>
								))}
							</select>
						</div>

						<div>
							<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a', fontSize: '0.9rem' }}>
								🔄 Sort By
							</label>
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								style={{
									width: '100%',
									padding: '0.75rem',
									border: '2px solid #1a1a1a',
									borderRadius: '8px',
									fontSize: '1rem',
									fontWeight: '600',
									cursor: 'pointer'
								}}
							>
								<option value="newest">Newest First</option>
								<option value="priority">Highest Priority</option>
								<option value="name-asc">Name (A-Z)</option>
								<option value="name-desc">Name (Z-A)</option>
								<option value="price-asc">Price (Low to High)</option>
								<option value="price-desc">Price (High to Low)</option>
							</select>
						</div>
					</div>

					<div style={{ display: 'grid', gap: '1rem' }}>
						{filteredProducts.length === 0 ? (
							<div style={{ 
								textAlign: 'center', 
								padding: '4rem 2rem', 
								backgroundColor: '#f9f9f9', 
								borderRadius: '12px',
								border: '2px dashed #ccc'
							}}>
								<p style={{ fontSize: '3rem', marginBottom: '1rem' }}>
									{allProducts.length === 0 ? '📦' : '🔍'}
								</p>
								<p style={{ fontSize: '1.3rem', fontWeight: '700', color: '#666' }}>
									{allProducts.length === 0 ? 'No products added yet' : 'No products match your filters'}
								</p>
								<p style={{ color: '#999', marginTop: '0.5rem' }}>
									{allProducts.length === 0 ? 'Add your first product to get started' : 'Try adjusting your search or filters'}
								</p>
							</div>
						) : (
							filteredProducts.map((product) => (
								<div key={product.id} style={{ 
									backgroundColor: '#fff', 
									padding: '1.5rem', 
									borderRadius: '12px', 
									border: '2px solid #1a1a1a',
									display: 'grid',
									gridTemplateColumns: '120px 1fr auto',
									gap: '1.5rem',
									alignItems: 'center',
									boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
								}}>
									<img 
										src={product.images?.[0] || 'https://via.placeholder.com/120'} 
										alt={product.title}
										style={{ 
											width: '120px', 
											height: '120px', 
											objectFit: 'contain', 
											border: '2px solid #e0e0e0', 
											borderRadius: '8px',
											backgroundColor: '#f9f9f9'
										}}
									/>
									<div>
										<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
											<h3 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.3rem', fontWeight: '800' }}>
												{product.title}
											</h3>
											{product.isFeatured && (
												<span style={{ 
													padding: '0.25rem 0.75rem', 
													backgroundColor: '#FFD700', 
													color: '#000', 
													borderRadius: '6px', 
													fontSize: '0.75rem', 
													fontWeight: '700'
												}}>
													✨ Featured
												</span>
											)}
											{product.isTrending && (
												<span style={{ 
													padding: '0.25rem 0.75rem', 
													backgroundColor: '#FF6B6B', 
													color: '#fff', 
													borderRadius: '6px', 
													fontSize: '0.75rem', 
													fontWeight: '700'
												}}>
													🔥 Trending
												</span>
											)}
											{(product.priority || 0) > 0 && (
												<span style={{ 
													padding: '0.25rem 0.75rem', 
													backgroundColor: '#4A90E2', 
													color: '#fff', 
													borderRadius: '6px', 
													fontSize: '0.75rem', 
													fontWeight: '700'
												}}>
													⭐ Priority: {product.priority}
												</span>
											)}
										</div>
										<p style={{ margin: '0.3rem 0', color: '#e71d36', fontSize: '1.3rem', fontWeight: '900' }}>
											₹{product.price}
										</p>
										<p style={{ margin: '0.3rem 0', fontSize: '0.9rem', color: '#666', fontWeight: '700' }}>
											📁 {product.category} / 🏷️ {product.subcategory}
										</p>
										<p style={{ margin: '0.3rem 0', fontSize: '0.85rem', color: '#999', fontWeight: '600' }}>
											Added by: {product.addedByName}
										</p>
									</div>
									<button
										onClick={() => handleDeleteProduct(product.id)}
										style={{
											padding: '0.75rem 1.5rem',
											backgroundColor: '#e71d36',
											color: '#fff',
											border: 'none',
											borderRadius: '8px',
											cursor: 'pointer',
											fontWeight: '700',
											fontSize: '1rem',
											boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
										}}
									>
										🗑️ Delete
									</button>
								</div>
							))
						)}
					</div>
				</div>
			)}

			{/* TAB 3: Manage Subsections */}
			{activeTab === 'subsections' && (
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
					{/* Add Subsection Form */}
					<div>
						<form onSubmit={handleAddSubsection} style={{ 
							backgroundColor: '#fff', 
							padding: '2rem', 
							borderRadius: '12px', 
							border: '2px solid #1a1a1a',
							boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
						}}>
							<h2 style={{ marginTop: 0, color: '#1a1a1a', fontSize: '1.8rem', fontWeight: '800' }}>
								➕ Add New Subsection
							</h2>

							<div style={{ marginBottom: '1.2rem' }}>
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a' }}>
									Select Category *
								</label>
								<select 
									value={newSubsectionData.category}
									onChange={(e) => setNewSubsectionData({ ...newSubsectionData, category: e.target.value })}
									style={{ 
										width: '100%', 
										padding: '0.75rem', 
										border: '2px solid #1a1a1a', 
										borderRadius: '8px',
										fontSize: '1rem',
										fontWeight: '600'
									}}
								>
									{Object.keys(categories).map(cat => (
										<option key={cat} value={cat}>
											{cat.charAt(0).toUpperCase() + cat.slice(1)}
										</option>
									))}
								</select>
							</div>

							<div style={{ marginBottom: '1.5rem' }}>
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a' }}>
									Subsection Name *
								</label>
								<input 
									type="text"
									value={newSubsectionData.name}
									onChange={(e) => setNewSubsectionData({ ...newSubsectionData, name: e.target.value })}
									placeholder="e.g., iPhone, iPad, Apple Watch"
									style={{ 
										width: '100%', 
										padding: '0.75rem', 
										border: '2px solid #1a1a1a', 
										borderRadius: '8px', 
										fontSize: '1rem',
										fontWeight: '600'
									}}
								/>
								<p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem', fontWeight: '600' }}>
									💡 Name will be converted to lowercase with hyphens
								</p>
							</div>

							<button 
								type="submit"
								style={{ 
									width: '100%', 
									padding: '1rem', 
									backgroundColor: '#e71d36', 
									color: '#fff', 
									border: 'none', 
									borderRadius: '8px',
									fontWeight: '800',
									cursor: 'pointer',
									fontSize: '1.1rem',
									boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
								}}
							>
								➕ Add Subsection
							</button>
						</form>
					</div>

					{/* Existing Subsections */}
					<div>
						<h2 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>
							📦 Existing Subsections
						</h2>
						<div style={{ maxHeight: '600px', overflowY: 'auto' }}>
							{Object.entries(categories).map(([category, subs]) => (
								<div key={category} style={{ 
									marginBottom: '1.5rem', 
									backgroundColor: '#fff', 
									padding: '1.5rem', 
									borderRadius: '12px', 
									border: '2px solid #1a1a1a',
									boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
								}}>
									<h3 style={{ margin: '0 0 1rem 0', color: '#e71d36', fontSize: '1.3rem', fontWeight: '800' }}>
										{category.toUpperCase()}
									</h3>
									<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
										{subs.map(sub => (
											<div key={sub} style={{ 
												backgroundColor: '#1a1a1a', 
												color: '#fff', 
												padding: '0.6rem 1rem', 
												borderRadius: '8px', 
												display: 'flex', 
												alignItems: 'center', 
												gap: '0.75rem',
												fontWeight: '700'
											}}>
												<span>{sub}</span>
												<button 
													onClick={() => handleRemoveSubsection(category, sub)}
													style={{ 
														backgroundColor: '#e71d36',
														border: 'none',
														color: '#fff',
														cursor: 'pointer',
														padding: '0.3rem 0.6rem',
														borderRadius: '4px',
														fontSize: '0.85rem',
														fontWeight: '700'
													}}
												>
													✕
												</button>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* TAB 4: Manage Categories */}
			{activeTab === 'categories' && (
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
					{/* Add Category Form */}
					<div>
						<form onSubmit={handleAddCategory} style={{ 
							backgroundColor: '#fff', 
							padding: '2rem', 
							borderRadius: '12px', 
							border: '2px solid #1a1a1a',
							boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
						}}>
							<h2 style={{ marginTop: 0, color: '#1a1a1a', fontSize: '1.8rem', fontWeight: '800' }}>
								➕ Add New Category
							</h2>

							<div style={{ marginBottom: '1.2rem' }}>
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a' }}>
									Category Name *
								</label>
								<input 
									type="text"
									value={newCategoryData.name}
									onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
									placeholder="e.g., Computers, Home & Kitchen"
									style={{ 
										width: '100%', 
										padding: '0.75rem', 
										border: '2px solid #1a1a1a', 
										borderRadius: '8px', 
										fontSize: '1rem',
										fontWeight: '600'
									}}
								/>
								<p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem', fontWeight: '600' }}>
									💡 Name will be converted to lowercase with hyphens
								</p>
							</div>

							<div style={{ marginBottom: '1.5rem' }}>
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1a1a1a' }}>
									Description
								</label>
								<textarea 
									value={newCategoryData.description}
									onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
									placeholder="Optional: Brief description of the category"
									rows="3"
									style={{ 
										width: '100%', 
										padding: '0.75rem', 
										border: '2px solid #1a1a1a', 
										borderRadius: '8px', 
										fontSize: '1rem', 
										fontFamily: 'inherit',
										fontWeight: '600'
									}}
								/>
							</div>

							<button 
								type="submit"
								style={{ 
									width: '100%', 
									padding: '1rem', 
									backgroundColor: '#e71d36', 
									color: '#fff', 
									border: 'none', 
									borderRadius: '8px',
									fontWeight: '800',
									cursor: 'pointer',
									fontSize: '1.1rem',
									boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
								}}
							>
								➕ Add Category
							</button>
						</form>
					</div>

					{/* Existing Categories */}
					<div>
						<h2 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>
							📁 Existing Categories ({Object.keys(categories).length})
						</h2>
						<div style={{ display: 'grid', gap: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
							{Object.entries(categories).map(([category, subs]) => (
								<div key={category} style={{ 
									backgroundColor: '#fff', 
									padding: '1.5rem', 
									borderRadius: '12px', 
									border: '2px solid #1a1a1a',
									boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
								}}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
										<div style={{ flex: 1 }}>
											<h3 style={{ margin: '0 0 0.75rem 0', color: '#1a1a1a', fontSize: '1.4rem', fontWeight: '800' }}>
												{category.charAt(0).toUpperCase() + category.slice(1)}
											</h3>
											<p style={{ margin: '0.5rem 0', color: '#666', fontSize: '1rem', fontWeight: '700' }}>
												📦 {subs.length} subsections
											</p>
											<div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
												{subs.map(sub => (
													<span key={sub} style={{ 
														backgroundColor: '#1a1a1a', 
														color: '#fff', 
														padding: '0.3rem 0.7rem', 
														borderRadius: '6px', 
														fontSize: '0.85rem',
														fontWeight: '700'
													}}>
														{sub}
													</span>
												))}
											</div>
										</div>
										<button 
											onClick={() => handleRemoveCategory(category)}
											style={{ 
												backgroundColor: '#e71d36',
												border: 'none',
												color: '#fff',
												cursor: 'pointer',
												padding: '0.75rem 1rem',
												borderRadius: '8px',
												fontSize: '1rem',
												fontWeight: '800',
												marginLeft: '1rem',
												boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
											}}
										>
											🗑️ Delete
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Statistics Section */}
			<div style={{ 
				marginTop: '3rem', 
				background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', 
				padding: '2rem', 
				borderRadius: '12px', 
				display: 'grid', 
				gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
				gap: '1.5rem',
				boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
			}}>
				<div style={{ 
					padding: '1.5rem', 
					backgroundColor: '#fff', 
					borderRadius: '12px', 
					border: '3px solid #e71d36', 
					textAlign: 'center',
					boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
				}}>
					<p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '1rem', fontWeight: '700' }}>
						📦 Total Products
					</p>
					<h3 style={{ margin: 0, color: '#e71d36', fontSize: '3rem', fontWeight: '900' }}>
						{allProducts.length}
					</h3>
				</div>
				<div style={{ 
					padding: '1.5rem', 
					backgroundColor: '#fff', 
					borderRadius: '12px', 
					border: '3px solid #e71d36', 
					textAlign: 'center',
					boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
				}}>
					<p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '1rem', fontWeight: '700' }}>
						📁 Total Categories
					</p>
					<h3 style={{ margin: 0, color: '#e71d36', fontSize: '3rem', fontWeight: '900' }}>
						{Object.keys(categories).length}
					</h3>
				</div>
				<div style={{ 
					padding: '1.5rem', 
					backgroundColor: '#fff', 
					borderRadius: '12px', 
					border: '3px solid #e71d36', 
					textAlign: 'center',
					boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
				}}>
					<p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '1rem', fontWeight: '700' }}>
						🏷️ Total Subsections
					</p>
					<h3 style={{ margin: 0, color: '#e71d36', fontSize: '3rem', fontWeight: '900' }}>
						{Object.values(categories).reduce((sum, subs) => sum + subs.length, 0)}
					</h3>
				</div>
			</div>
		</div>
	);
}
