// Admin User Setup Script
// Run this in the browser console after creating a Firebase user

import { ref as dbRef, set } from "firebase/database";
import { database } from "../config/firebase";

/**
 * Creates an admin user in Realtime Database
 * @param {string} uid - Firebase Auth User UID
 * @param {string} email - User email
 * @param {string} fullName - User's full name
 * @param {string} username - Username
 */
export async function createAdminUser(uid, email, fullName, username) {
  try {
    const userRef = dbRef(database, `users/${uid}`);
    await set(userRef, {
      email: email,
      fullName: fullName,
      role: "admin",
      username: username,
      createdAt: Date.now()
    });
    console.log("✓ Admin user created successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error creating admin user:", error);
    return { success: false, error };
  }
}

/**
 * Creates a regular customer user in Realtime Database
 * @param {string} uid - Firebase Auth User UID
 * @param {string} email - User email
 * @param {string} fullName - User's full name
 * @param {string} username - Username
 */
export async function createCustomerUser(uid, email, fullName, username) {
  try {
    const userRef = dbRef(database, `users/${uid}`);
    await set(userRef, {
      email: email,
      fullName: fullName,
      role: "customer",
      username: username,
      createdAt: Date.now()
    });
    console.log("✓ Customer user created successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error creating customer user:", error);
    return { success: false, error };
  }
}

// Example usage (uncomment and modify as needed):
// 
// After creating a user in Firebase Authentication Console:
// 1. Get the User UID from Firebase Console
// 2. Run this in browser console:
//
// createAdminUser(
//   "USER_UID_FROM_FIREBASE",
//   "admin@drift.com",
//   "Admin User",
//   "admin"
// );
