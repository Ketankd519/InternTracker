import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerifyEmail = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/auth/check-email", {
        email,
      });

      alert(res.data.message);

      setEmailVerified(true);

    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Email not found"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await API.put("/auth/update-password", {
        email,
        newPassword,
      });

      alert(res.data.message);

      navigate("/login");

    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Password update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1>Forgot Password</h1>

        <p className="auth-subtitle">
          Reset your InternTrack account password
        </p>

        {!emailVerified ? (

          <form onSubmit={handleVerifyEmail}>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? "Checking..." : "Continue"}
            </button>

          </form>

        ) : (

          <form onSubmit={handleUpdatePassword}>

            <input
              type="email"
              value={email}
              readOnly
            />

            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              minLength="6"
              required
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              minLength="6"
              required
            />

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

          </form>

        )}

        <div className="create-account">

          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>

        </div>

      </div>

    </div>
  );
}