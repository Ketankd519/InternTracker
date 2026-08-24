import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Card({ title, description, link, role }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleOpen = () => {
    // User is not logged in
    if (!user) {
      navigate('/login', {
        state: {from: link,},
      });
      return;
    }

    // User is logged in but does not have required role
    if (user.role !== role) {
      alert(`Access denied. This portal is only for ${role}s.`);
      return;
    }

    // Correct role
    navigate(link);
  };

  return (
    <div className="card">
      <h2>{title}</h2>
      <p>{description}</p>
      <button className="btn" onClick={handleOpen}>
        Open
      </button>
    </div>
  );
}