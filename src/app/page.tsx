'use client';

import { useState, useEffect } from 'react';
import { AuthResponse } from '@/types/auth';
import ConfigComponent from './components/config';
import LoginComponent from './components/login';

const MainPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [configData, setConfigData] = useState<AuthResponse['configurations'] | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    const storedConfigData = JSON.parse(localStorage.getItem('configData') || 'null');

    if (storedLoginStatus && storedUsername && storedConfigData) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setConfigData(storedConfigData);
    }
  }, []);

  const handleLogin = (data: AuthResponse) => {
    setIsLoggedIn(true);
    setUsername(localStorage.getItem('username') || '');
    setConfigData(data.configurations);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUsername('');
    setConfigData(null);
  };

  return (
    <div className='min-h-screen bg-gray-900 text-gray-100'>
      <div className='container mx-auto p-6'>
        {!isLoggedIn ? (
          <div className='max-w-md mx-auto'>
            <LoginComponent onLogin={handleLogin} />
          </div>
        ) : configData ? (
          <ConfigComponent username={username} initialData={configData} onLogout={handleLogout} />
        ) : (
          <div className='text-center'>Loading configuration...</div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
