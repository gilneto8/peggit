'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthResponse } from '@/types/auth';
import ConfigComponent from '../components/config';
import Cookies from 'js-cookie';

const DashboardPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [configData, setConfigData] = useState<AuthResponse['configurations'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.debug('Dashboard useEffect running...');
    const isLoggedIn = Cookies.get('isLoggedIn');
    const storedUsername = localStorage.getItem('username');
    const storedConfigData = JSON.parse(localStorage.getItem('configData') || 'null');

    console.debug('Auth state:', { isLoggedIn, storedUsername, hasConfigData: !!storedConfigData });

    if (!isLoggedIn || !storedUsername || !storedConfigData) {
      console.debug('Missing required data, redirecting to login...');
      router.push('/');
      return;
    }

    console.debug('Setting dashboard state...');
    setUsername(storedUsername);
    setConfigData(storedConfigData);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('isLoggedIn', { path: '/' });
    localStorage.clear();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center'>
        <div className='text-xl font-semibold'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900 text-gray-100'>
      <div className='container mx-auto p-6'>
        {configData && <ConfigComponent username={username} initialData={configData} onLogout={handleLogout} />}
      </div>
    </div>
  );
};

export default DashboardPage;
