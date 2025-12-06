# Add Admin User to Realtime Database

You've created the user in Firebase Authentication with:
- **Email**: admin@drift.com
- **Password**: admin123

Now you need to add this user to the Realtime Database with admin role.

## Option 1: Using Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **driftenterprises-official**
3. Go to **Authentication** → **Users**
4. Find the user: `admin@drift.com`
5. **Copy the User UID** (long string like `abc123def456...`)

6. Go to **Realtime Database** (in the left menu)
7. Click the **+** icon next to the database root
8. Add this structure:

```json
{
  "users": {
    "PASTE_YOUR_USER_UID_HERE": {
      "email": "admin@drift.com",
      "fullName": "Admin User",
      "username": "admin",
      "role": "admin",
      "createdAt": 1733500800000
    }
  }
}
```

**IMPORTANT**: Replace `PASTE_YOUR_USER_UID_HERE` with the actual UID you copied in step 5!

9. Click **Add**

## Option 2: Using Browser Console (Quick)

1. Open your app: http://localhost:3000/
2. Open Browser DevTools (F12 or Right-click → Inspect)
3. Go to **Console** tab
4. Paste this code (replace `YOUR_USER_UID` with the actual UID from Firebase Authentication):

```javascript
import { ref as dbRef, set } from 'firebase/database';
import { database } from './src/config/firebase.js';

const userUid = 'YOUR_USER_UID_HERE'; // Replace with actual UID from Firebase Auth Console

const userRef = dbRef(database, `users/${userUid}`);
await set(userRef, {
  email: "admin@drift.com",
  fullName: "Admin User",
  username: "admin",
  role: "admin",
  createdAt: Date.now()
});

console.log("✅ Admin user added to database!");
```

5. Press Enter
6. You should see: "✅ Admin user added to database!"

## Option 3: Temporary Admin Creation Page

I can create a one-time setup page that will automatically add the admin role when you first login. Would you like me to create that?

## After Adding Admin User

1. Go to: http://localhost:3000/login
2. Login with:
   - **Email**: admin@drift.com
   - **Password**: admin123
3. You should be logged in as admin
4. Navigate to: http://localhost:3000/admin/products
5. You should see the admin dashboard! 🎉

## Verify Admin Role

To verify the admin role was set correctly:

1. Go to Firebase Console → Realtime Database
2. You should see this structure:
```
users
  └── {your-uid}
      ├── email: "admin@drift.com"
      ├── fullName: "Admin User"
      ├── username: "admin"
      ├── role: "admin"
      └── createdAt: 1733500800000
```

---

**Which option do you prefer?** Let me know if you need help with any of these steps!
