import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { ref as dbRef, get, set } from "firebase/database";
import { auth, database } from "../config/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user role from Realtime Database
        try {
          const userRef = dbRef(database, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              username: userData.username || firebaseUser.email.split('@')[0],
              fullName: userData.fullName || firebaseUser.displayName || "User",
              role: userData.role || "customer",
              loginTime: new Date().toISOString()
            });
          } else {
            // If user document doesn't exist, create one with default role
            const defaultUserData = {
              email: firebaseUser.email,
              username: firebaseUser.email.split('@')[0],
              fullName: firebaseUser.displayName || "User",
              role: "customer",
              createdAt: Date.now()
            };
            await set(userRef, defaultUserData);
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              username: defaultUserData.username,
              fullName: defaultUserData.fullName,
              role: defaultUserData.role,
              loginTime: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (email, password, fullName) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Realtime Database
      const userRef = dbRef(database, `users/${user.uid}`);
      await set(userRef, {
        email: email,
        username: email.split('@')[0],
        fullName: fullName || "User",
        role: "customer", // Default role
        createdAt: Date.now()
      });
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const isAdmin = () => {
    return user && user.role === "admin";
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
