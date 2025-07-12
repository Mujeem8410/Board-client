import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import KanbanBoard from './pages/KanbanBoard';
import Navbar from './components/Navbar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    window.addEventListener('storage', checkToken);
    window.addEventListener('focus', checkToken);

    return () => {
      window.removeEventListener('storage', checkToken);
      window.removeEventListener('focus', checkToken);
    };
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/board"
          element={isLoggedIn ? <KanbanBoard /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/board" />} />
      </Routes>
    </>
  );
}

export default App;
