# Firebase Setup Guide for Drift Enterprises

## 🚀 Quick Setup Instructions

### 1. Firebase Configuration
The Firebase configuration has been added to `src/config/firebase.js`. Your Firebase project is already connected.

### 2. Create Admin User

Since this is a fresh setup, you'll need to create your first admin user. Follow these steps:

#### Option A: Using Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **driftenterprises-official**
3. Navigate to **Authentication** → **Users** → **Add User**
4. Create a user with your email and password
5. Note the **User UID** (you'll need this for the next step)

6. Navigate to **Firestore Database** → **Start Collection**
   - Collection ID: `users`
   - Document ID: Use the **User UID** from step 5
   - Add fields:
     ```
     email: "your-email@example.com"
     fullName: "Admin Name"
     role: "admin"
     username: "admin"
     createdAt: (timestamp) - current time
     ```

#### Option B: Programmatic Setup (Advanced)
Run this code in your browser console after logging in as a regular user:

```javascript
import { doc, setDoc } from "firebase/firestore";
import { db } from "./config/firebase";

// Replace 'YOUR_USER_UID' with your actual Firebase Auth UID
const updateUserRole = async () => {
  await setDoc(doc(db, "users", "YOUR_USER_UID"), {
    email: "admin@drift.com",
    fullName: "Admin User",
    role: "admin",
    username: "admin",
    createdAt: new Date().toISOString()
  });
  console.log("Admin user created!");
};

updateUserRole();
```

### 3. Firestore Database Rules

Make sure your Firestore has the correct security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read their own data, admins can read all
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products collection - anyone can read, only admins can write
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Categories collection - anyone can read, only admins can write
    match /categories/{categoryId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 4. Firebase Storage Rules

Set up Storage rules for product images:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 5. Enable Authentication Methods

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication

### 6. Start Development

```bash
npm run dev
```

### 7. Login as Admin

1. Navigate to `/login`
2. Use your admin credentials
3. Access admin dashboard at `/admin/products`

## 🎨 Features Implemented

### ✅ Firebase Integration
- Real-time database with Firestore
- Firebase Authentication with email/password
- Firebase Storage for product images
- Secure RBAC (Role-Based Access Control)

### ✅ Admin Dashboard
- Professional modern UI with red, black, and white theme
- Add products with multiple images
- Manage categories and subcategories
- View and delete products
- Real-time statistics
- Image upload to Firebase Storage

### ✅ Product Management
- Products stored in Firestore
- Images stored in Firebase Storage
- Real-time product listing
- Product detail pages with Firebase data
- Filter by category and subcategory

### ✅ Security
- Only admins can add/delete products
- RBAC implemented with Firestore
- Protected admin routes
- Secure Firebase rules

## 📝 User Roles

- **admin**: Can manage products, categories, and access admin dashboard
- **customer**: Can browse products, add to cart, and checkout

## 🔧 Troubleshooting

### "Permission denied" errors
- Make sure you've set up Firestore and Storage rules correctly
- Verify your user has `role: "admin"` in Firestore

### Images not uploading
- Check Firebase Storage rules
- Ensure Storage is enabled in Firebase Console
- Verify file size limits

### Products not displaying
- Check browser console for errors
- Verify Firestore rules allow read access
- Make sure products exist in Firestore `products` collection

## 📚 Collection Structure

### Users Collection (`users`)
```javascript
{
  uid: "user-id",
  email: "user@example.com",
  fullName: "User Name",
  role: "admin" | "customer",
  username: "username",
  createdAt: "timestamp"
}
```

### Products Collection (`products`)
```javascript
{
  id: "auto-generated",
  title: "Product Name",
  description: "Product description",
  price: 999.99,
  rating: 4.5,
  category: "mobiles",
  subcategory: "apple",
  brand: "Apple",
  specifications: "Key specs...",
  images: ["url1", "url2"],
  addedBy: "admin-uid",
  addedByName: "Admin Name",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Categories Collection (`categories`)
```javascript
{
  id: "category-name",
  name: "Category Name",
  subcategories: ["sub1", "sub2"],
  updatedAt: Timestamp
}
```

## 🎉 You're All Set!

Your Drift Enterprises e-commerce platform is now powered by Firebase with full admin capabilities!

**Theme Colors Maintained:**
- ❤️ Red: `#e71d36`
- ⚫ Black: `#1a1a1a`, `#000000`
- ⚪ White: `#ffffff`, `#f9f9f9`
