# 🚀 DRIFT ENTERPRISES

A modern, fully responsive e-commerce platform built with React and Firebase, offering a seamless shopping experience across all devices.

![DRIFT ENTERPRISES](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18-blue)
![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-orange)
![Responsive](https://img.shields.io/badge/Design-Fully%20Responsive-green)

## ✨ Features

- 🛍️ **Full E-Commerce Functionality** - Browse, cart, and checkout system
- 📱 **Fully Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- 🔥 **Firebase Integration** - Real-time database and authentication
- 👨‍💼 **Admin Dashboard** - Product management with CRUD operations
- 🛒 **Shopping Cart** - Real-time cart updates with quantity management
- 🔐 **User Authentication** - Secure login/signup with Firebase Auth
- 📦 **Product Categories** - Organized product browsing (Mobiles, Electronics, Appliances)
- 💳 **Checkout System** - Streamlined checkout process
- 🎨 **Modern UI/UX** - Sleek design with smooth animations and transitions
- ⚡ **Fast Performance** - Optimized for speed and efficiency

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6
- **Build Tool**: Vite
- **Backend**: Firebase (Realtime Database, Authentication)
- **Styling**: Custom CSS with responsive design
- **State Management**: React Context API

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/HARSHAN-DEVHUB/Drift.git
cd Drift
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a Firebase project at [Firebase Console](https://console.firebase.google.com/) and update `src/config/firebase.js` with your credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app in your browser.

### 5. Build for Production

```bash
npm run build
npm run preview
```

## 👨‍💼 Admin Access

To access the admin dashboard:

1. Navigate to `/login`
2. Sign in with admin credentials
3. Access admin panel at `/admin/products`

**Default Admin Credentials** (Change in production):
- Email: `admin@drift.com`
- Password: `admin123`

## 📁 Project Structure

```
Drift/
├── public/
│   └── assets/          # Images and static assets
├── src/
│   ├── components/      # Reusable React components
│   │   ├── CartProvider.jsx
│   │   ├── Header.jsx
│   │   └── ProtectedRoute.jsx
│   ├── config/          # Firebase configuration
│   │   └── firebase.js
│   ├── contexts/        # React Context providers
│   │   └── AuthContext.jsx
│   ├── data/            # Static product data
│   │   └── products.js
│   ├── pages/           # Page components
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Login.jsx
│   │   ├── Account.jsx
│   │   ├── Orders.jsx
│   │   └── ProductManagement.jsx
│   ├── services/        # API services
│   │   └── productService.js
│   ├── utils/           # Utility functions
│   │   └── initCategories.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Key Features Breakdown

### Responsive Design
- **Mobile-First Approach**: Optimized for all screen sizes
- **Breakpoints**: 360px, 480px, 768px, 1024px, 1200px+
- **Touch-Friendly**: Minimum 44px touch targets on mobile
- **Adaptive Layouts**: Grids, cards, and navigation adapt seamlessly

### Product Management
- Add, edit, and delete products
- Multiple image support
- Category organization
- Real-time updates

### Shopping Experience
- Product browsing with filters
- Detailed product pages
- Shopping cart with quantity management
- Secure checkout process
- Order history

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Laptop**: 1024px - 1200px
- **Tablet**: 768px - 1024px
- **Mobile**: 480px - 768px
- **Small Mobile**: 360px - 480px

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**HARSHAN-DEVHUB**
- GitHub: [@HARSHAN-DEVHUB](https://github.com/HARSHAN-DEVHUB)

## 🙏 Acknowledgments

- Firebase for backend services
- React community for excellent documentation
- Vite for blazing fast development experience

---

Made with ❤️ by HARSHAN-DEVHUB
