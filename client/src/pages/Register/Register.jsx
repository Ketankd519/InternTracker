import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register(formData);
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Register Account</h2>
        <input placeholder="Full Name" autoComplete="name" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        <input type="email" placeholder="Email" autoComplete="email" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Password" autoComplete="new-password" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
        <select onChange={(e) => setFormData({...formData, role: e.target.value})}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="manager">Manager</option>
        </select>
        <button type="submit" className="btn">Register</button>
      </form>
    </div>
  );
}