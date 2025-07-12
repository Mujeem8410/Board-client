import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../index.css';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/register`,
        formData
      );

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/board');
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Server error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 className='head-main'>Register</h2>
        <div className="container">

      <form onSubmit={handleRegister}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        /><br /><br />

        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        /><br /><br />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        /><br /><br />

        <button type="submit">Register</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
    </div>
  );
}

export default Register;
