import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (!fullName.trim()) {
        setError("Please enter your full name");
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await register(email, password, fullName);
        alert("Account created successfully! Welcome to Drift Enterprises.");
        navigate(from, { replace: true });
      } else {
        await login(email, password);
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Authentication error:", err);
      
      // User-friendly error messages
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
  };

  return (
    <div className="page-shell" style={{ maxWidth: "500px", margin: "4rem auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{isSignUp ? "🎉" : "🔐"}</div>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>
        <p style={{ color: "#666", fontSize: "1rem" }}>
          {isSignUp ? "Join Drift Enterprises today" : "Sign in to your account"}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ 
        background: "linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)",
        padding: "2.5rem",
        borderRadius: "20px",
        border: "1px solid #e8e8e8",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)"
      }}>
        {error && (
          <div style={{ 
            background: "linear-gradient(135deg, #fee 0%, #fdd 100%)",
            color: "#c41530",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            marginBottom: "1.5rem",
            border: "1px solid #f5c6cb",
            fontSize: "0.9rem",
            fontWeight: "600"
          }}>
            ⚠️ {error}
          </div>
        )}

        {isSignUp && (
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontWeight: "700",
              color: "#1a1a1a",
              fontSize: "0.95rem"
            }}>
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required={isSignUp}
              placeholder="Enter your full name"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "2px solid #e8e8e8",
                borderRadius: "12px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                background: "#fafafa"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#e71d36";
                e.target.style.background = "#ffffff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e8e8e8";
                e.target.style.background = "#fafafa";
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "0.5rem", 
            fontWeight: "700",
            color: "#1a1a1a",
            fontSize: "0.95rem"
          }}>
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              border: "2px solid #e8e8e8",
              borderRadius: "12px",
              fontSize: "1rem",
              transition: "all 0.3s ease",
              background: "#fafafa"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#e71d36";
              e.target.style.background = "#ffffff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e8e8e8";
              e.target.style.background = "#fafafa";
            }}
          />
        </div>

        <div style={{ marginBottom: isSignUp ? "1.5rem" : "2rem" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "0.5rem", 
            fontWeight: "700",
            color: "#1a1a1a",
            fontSize: "0.95rem"
          }}>
            Password *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            minLength="6"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              border: "2px solid #e8e8e8",
              borderRadius: "12px",
              fontSize: "1rem",
              transition: "all 0.3s ease",
              background: "#fafafa"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#e71d36";
              e.target.style.background = "#ffffff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e8e8e8";
              e.target.style.background = "#fafafa";
            }}
          />
          {isSignUp && (
            <small style={{ color: "#666", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
              Password must be at least 6 characters
            </small>
          )}
        </div>

        {isSignUp && (
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontWeight: "700",
              color: "#1a1a1a",
              fontSize: "0.95rem"
            }}>
              Confirm Password *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required={isSignUp}
              placeholder="Re-enter your password"
              minLength="6"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "2px solid #e8e8e8",
                borderRadius: "12px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                background: "#fafafa"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#e71d36";
                e.target.style.background = "#ffffff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e8e8e8";
                e.target.style.background = "#fafafa";
              }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="primary-button"
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1.05rem",
            marginBottom: "1rem",
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? (isSignUp ? "Creating Account..." : "Signing in...") : (isSignUp ? "🎉 Create Account" : "🚀 Sign In")}
        </button>

        <div style={{ 
          textAlign: "center", 
          position: "relative",
          margin: "1.5rem 0"
        }}>
          <div style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: "1px",
            backgroundColor: "#e8e8e8"
          }}></div>
          <span style={{
            position: "relative",
            backgroundColor: "#f9f9f9",
            padding: "0 1rem",
            color: "#666",
            fontSize: "0.85rem"
          }}>OR</span>
        </div>

        <button
          type="button"
          onClick={toggleMode}
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.875rem",
            backgroundColor: "white",
            color: "#e71d36",
            border: "2px solid #e8e8e8",
            borderRadius: "12px",
            fontSize: "0.95rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            opacity: loading ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.borderColor = "#e71d36";
              e.target.style.backgroundColor = "#fff5f5";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = "#e8e8e8";
            e.target.style.backgroundColor = "white";
          }}
        >
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </button>

        {isSignUp && (
          <p style={{ 
            textAlign: "center", 
            color: "#666", 
            fontSize: "0.8rem", 
            marginTop: "1.5rem",
            lineHeight: "1.5"
          }}>
            By creating an account, you agree to Drift Enterprises' Terms of Service and Privacy Policy
          </p>
        )}
      </form>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link to="/" style={{ color: "#666", fontSize: "0.9rem", textDecoration: "underline" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
