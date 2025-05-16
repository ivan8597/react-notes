import React from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../utils/auth';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <button onClick={handleLogout}>
      Выйти
    </button>
  );
};

export default Logout;