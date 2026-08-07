import { useNavigate } from 'react-router-dom';

export default function Card({ title, description, link }) {
  const navigate = useNavigate();
  return (
    <div className="card">
      <h2>{title}</h2>
      <p>{description}</p>
      <button className="btn" onClick={() => navigate(link)}>Open</button>
    </div>
  );
}