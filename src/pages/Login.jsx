import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell" style={{ maxWidth: "500px", margin: "4rem auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔐</div>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Welcome Back</h1>
        <p style={{ color: "#666", fontSize: "1rem" }}>Sign in to your account</p>
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

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "0.5rem", 
            fontWeight: "700",
            color: "#1a1a1a",
            fontSize: "0.95rem"
          }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
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

        <div style={{ marginBottom: "2rem" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "0.5rem", 
            fontWeight: "700",
            color: "#1a1a1a",
            fontSize: "0.95rem"
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
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
          {loading ? "Signing in..." : "🚀 Sign In"}
        </button>

        <div style={{ 
          textAlign: "center", 
          paddingTop: "1.5rem", 
          borderTop: "1px solid #e8e8e8",
          marginTop: "1rem"
        }}>
          <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            <strong>Note:</strong> Use Firebase Authentication
          </p>
          <p style={{ color: "#999", fontSize: "0.85rem", marginBottom: "1rem" }}>
            Admin users must be configured in Firestore with role: "admin"
          </p>
          <p style={{ color: "#666", fontSize: "0.85rem" }}>
            💡 Create an account or contact admin for access
          </p>
        </div>
      </form>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link to="/" style={{ color: "#666", fontSize: "0.9rem", textDecoration: "underline" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
