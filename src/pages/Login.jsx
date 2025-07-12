import React, { useState } from 'react';
import '../index.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        { email, password }
      );

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);

        // 🟢 Notify App.jsx that token changed
        window.dispatchEvent(new Event('storage'));

        // ✅ Navigate to board
        navigate('/board');
      } else {
        setError('Login failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Server error');
    }
  };

  return (
    <div>
      <h2 className='head-main'>Login</h2>
      <div className="container">
        <form onSubmit={handleLogin}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>

      <p className="heading">
        Don't have an account?{' '}
        <span
          onClick={() => navigate('/register')}
          style={{ color: 'blue', cursor: 'pointer' }}
        >
          Register here
        </span>
      </p>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
    </div>
  );
}

export default Login;
