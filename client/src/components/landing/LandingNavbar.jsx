import React from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../Layout/Container'; // Assuming shared layout
import Button from '../Button/Button';

const LandingNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">TaxSaas</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
                Login
            </button>
            <Button size="sm" onClick={() => navigate('/register')}>
                Register
            </Button>
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default LandingNavbar;
