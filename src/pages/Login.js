import { useState } from "react";
import { Navigate } from "react-router-dom";
import { apiService } from "../services/apiService";
import "../styles/_login.scss";

function Login({ setIsAuthenticated }) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [redirect, setRedirect] = useState(false); // ✅ redirect state

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiService.login(credentials);
      setLoading(false);

      if (res && res.success) {
        // Store token
        if (res.token) localStorage.setItem("adminToken", res.token);

        // Update authentication state in App.js
        setIsAuthenticated(true);

        // Trigger redirect
        setRedirect(true);
      } else {
        setError(res?.message || "Invalid username or password");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setLoading(false);
      setError("Something went wrong. Please try again later.");
    }
  };

  // ✅ Conditional redirect
  if (redirect) return <Navigate to="/" replace />;

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <div className="logo">
              <div className="logo-icon">🔐</div>
            </div>
            <h2 className="login-title">Admin Login</h2>
            <p className="login-subtitle">
              Welcome back! Please login to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Logging in...
                </>
              ) : (
                <>
                  <span>Login</span>
                  <span className="arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Secure admin access only</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
