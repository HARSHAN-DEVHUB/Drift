# Firebase Realtime Database Setup Guide

## 🔥 Firebase Realtime Database Integration Complete!

Your Drift Enterprises application is now configured to use **Firebase Realtime Database** instead of Firestore.

## 📋 Database Structure

Your Realtime Database will have the following structure:

```
driftenterprises-official-default-rtdb/
├── users/
│   └── {userId}/
│       ├── email: "user@example.com"
│       ├── fullName: "User Name"
│       ├── username: "username"
│       ├── role: "admin" or "customer"
│       └── createdAt: 1234567890
│
├── products/
│   └── {productId}/
│       ├── title: "Product Name"
│       ├── price: 999.99
│       ├── rating: 4.5
│       ├── category: "mobiles"
│       ├── subcategory: "apple"
│       ├── brand: "Apple"
│       ├── description: "..."
│       ├── specifications: "..."
│       ├── images: ["url1", "url2"]
│       ├── addedBy: "admin-uid"
│       ├── addedByName: "Admin Name"
│       ├── createdAt: 1234567890
│       └── updatedAt: 1234567890
│
└── categories/
    ├── mobiles: ["apple", "vivo", "oppo", ...]
    ├── tv: ["toshiba", "mi", "samsung", ...]
    ├── appliances: ["refrigerator", "air-conditioner"]
    └── electronics: ["home-theater", "sound-bar"]
```

## 🚀 Setup Steps

### 1. Enable Realtime Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **driftenterprises-official**
3. Navigate to **Build** → **Realtime Database**
4. Click **Create Database**
5. Select location: **United States (us-central1)** (or closest to you)
6. Start in **Test mode** (we'll add security rules later)
7. Click **Enable**

### 2. Enable Email/Password Authentication

1. Go to **Build** → **Authentication**
2. Click **Get Started** (if not already enabled)
3. Go to **Sign-in method** tab
4. Enable **Email/Password**
5. Click **Save**

### 3. Enable Firebase Storage

1. Go to **Build** → **Storage**
2. Click **Get Started**
3. Start in **Test mode**
4. Select location (same as Realtime Database)
5. Click **Done**

### 4. Create Your First Admin User

#### Step 4.1: Create User in Authentication
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter your email: `admin@driftenterprises.com`
4. Enter a strong password
5. Click **Add User**
6. **IMPORTANT**: Copy the **User UID** (you'll need this!)

#### Step 4.2: Add User to Realtime Database
1. Go to **Realtime Database**
2. Click on the **+** icon next to the root
3. Create this structure:

```json
{
  "users": {
    "YOUR_USER_UID_HERE": {
      "email": "admin@driftenterprises.com",
      "fullName": "Admin User",
      "username": "admin",
      "role": "admin",
      "createdAt": 1733500800000
    }
  }
}
```

**Replace `YOUR_USER_UID_HERE` with the actual UID you copied!**

## 🔒 Security Rules

### Realtime Database Rules

After testing, update your Realtime Database rules for production:

1. Go to **Realtime Database** → **Rules** tab
2. Replace with these rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "products": {
      ".read": true,
      "$productId": {
        ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "categories": {
      ".read": true,
      ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
    }
  }
}
```

3. Click **Publish**

### Storage Rules

1. Go to **Storage** → **Rules** tab
2. Replace with these rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     firestore.exists(/databases/(default)/documents/users/$(request.auth.uid)) &&
                     firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

3. Click **Publish**

## 🎮 Using the Application

### 1. Start Development Server

```bash
npm run dev
```

### 2. Login as Admin

1. Navigate to: `http://localhost:3001/login`
2. Use your admin credentials
3. You should be logged in successfully

### 3. Access Admin Dashboard

1. Go to: `http://localhost:3001/admin/products`
2. You should see the admin dashboard with 4 tabs:
   - 📦 Add Products
   - 📋 Product List
   - 🏷️ Manage Subsections
   - 📁 Manage Categories

### 4. Add Your First Product

1. Select **Add Products** tab
2. Fill in the product details:
   - Title
   - Price
   - Rating
   - Category
   - Subcategory
   - Brand
   - Description
   - Specifications
3. Upload images (supports multiple images)
4. Preview your product in the right panel
5. Click **Add Product**
6. Product will be saved to Realtime Database!

### 5. View Products on Site

1. Go to: `http://localhost:3001/products`
2. Your products will load from Firebase Realtime Database
3. Click on any product to see details

## 📊 Database Operations

### Key Differences from Firestore

| Feature | Firestore | Realtime Database |
|---------|-----------|-------------------|
| Data Structure | Documents & Collections | JSON Tree |
| Queries | Rich queries with filters | Basic queries, filter in code |
| Offline Support | Built-in | Built-in |
| Pricing | Pay per read/write | Pay per GB stored + bandwidth |
| Real-time | Yes | Yes (faster) |
| Timestamps | `Timestamp.now()` | `Date.now()` |

### Updated Files

1. **src/config/firebase.js**
   - Changed from `getFirestore` to `getDatabase`
   - Export `database` instead of `db`

2. **src/services/productService.js**
   - Uses `ref`, `push`, `set`, `update`, `remove`, `get` from `firebase/database`
   - All queries converted to Realtime Database format
   - Categories stored as simple key-value pairs

3. **src/contexts/AuthContext.jsx**
   - Uses `ref`, `get`, `set` from `firebase/database`
   - User data stored in `/users/{uid}` path

4. **src/utils/createAdminUser.js**
   - Updated to use Realtime Database

## 🎨 Features Maintained

✅ Red/Black/White theme preserved
✅ Professional admin dashboard
✅ Role-Based Access Control (RBAC)
✅ Image upload to Firebase Storage
✅ Product CRUD operations
✅ Category management
✅ Real-time updates
✅ Protected admin routes

## 🔧 Troubleshooting

### Issue: "Permission Denied"
**Solution**: Make sure you've published the Database Rules above

### Issue: "User role is 'customer' instead of 'admin'"
**Solution**: Check the Realtime Database console and verify the user's role is set to "admin"

### Issue: "Products not showing"
**Solution**: Check browser console for errors. Verify Realtime Database rules allow read access

### Issue: "Cannot upload images"
**Solution**: Check Storage rules and verify admin role is properly set

## 📖 API Reference

### Product Service

```javascript
// Create product
await productService.createProduct(productData, imageFiles);

// Get all products
const products = await productService.getAllProducts();

// Get product by ID
const product = await productService.getProductById(productId);

// Update product
await productService.updateProduct(productId, updates);

// Delete product
await productService.deleteProduct(productId);
```

### Category Service

```javascript
// Get all categories
const categories = await categoryService.getAllCategories();

// Save category
await categoryService.saveCategory(categoryName, subcategories);

// Delete category
await categoryService.deleteCategory(categoryName);
```

## 🎉 You're All Set!

Your Drift Enterprises application is now fully integrated with Firebase Realtime Database. The admin dashboard is ready to use for managing products, categories, and subcategories.

**Next Steps:**
1. Complete the setup steps above
2. Create your admin user
3. Set up security rules
4. Start adding products!

---

**Need Help?** Check the Firebase documentation:
- [Realtime Database Docs](https://firebase.google.com/docs/database)
- [Authentication Docs](https://firebase.google.com/docs/auth)
- [Storage Docs](https://firebase.google.com/docs/storage)
