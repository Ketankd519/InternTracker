import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await login(email, password, rememberMe);
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      alert( err.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Account Login</h1>
        <p className="auth-subtitle">Login to your InternTrack account</p>
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <input type="email" placeholder="Email" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <input type="password" placeholder="Password"
            autoComplete="current-password" value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Remember Me + Forgot Password */}
          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
              />
              <span>Remember Me</span>
            </label>

            <button type="button" className="forgot-password-btn"
              onClick={() => navigate("/forgot-password")}
            >
            Forgot Password?
            </button>
          </div>

          {/* Login */}
          <button type="submit" className="auth-btn">Login</button>
        </form>

        {/* Create Account */}
        <div className="create-account">
          <span>Don't have an account? </span>
          <button type="button" onClick={() => navigate("/register")}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}