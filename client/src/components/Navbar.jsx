import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header>
      <div className="header-title">
        InternTrack - Internship Tracking System
      </div>

      <nav className="nav-bar">
        <Link to="/">
          <button>Home</button>
        </Link>

        {user?.role === 'student' && (
          <Link to="/student/dashboard">
            <button>Student</button>
          </Link>
        )}

        {user?.role === 'teacher' && (
          <Link to="/teacher/dashboard">
            <button>Teacher</button>
          </Link>
        )}

        {user?.role === 'manager' && (
          <Link to="/manager/dashboard">
            <button>Manager</button>
          </Link>
        )}

        {user && (
          <Link to="/certificate">
            <button>Certificate</button>
          </Link>
        )}

        {user ? (
          <button className="btn-logout" onClick={handleLogout}>
            Logout ({user.name})
          </button>
        ) : (
          <>
            <Link to="/login">
              <button>Login</button>
            </Link>

            <Link to="/register">
              <button>Register</button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}