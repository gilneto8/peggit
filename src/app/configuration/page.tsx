'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthResponse } from '@/types/auth';
import SubredditConfigComponent from '../components/subreddit-config';
import TimeConfigComponent from '../components/time-config';
import Cookies from 'js-cookie';

const ConfigurationPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [configData, setConfigData] = useState<AuthResponse['configurations'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.debug('Configuration useEffect running...');
    const isLoggedIn = Cookies.get('isLoggedIn');
    const storedUsername = localStorage.getItem('username');
    const storedConfigData = JSON.parse(localStorage.getItem('configData') || 'null');

    console.debug('Auth state:', { isLoggedIn, storedUsername, hasConfigData: !!storedConfigData });

    if (!isLoggedIn || !storedUsername || !storedConfigData) {
      console.debug('Missing required data, redirecting to login...');
      router.push('/');
      return;
    }

    console.debug('Setting configuration state...');
    setUsername(storedUsername);
    setConfigData(storedConfigData);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center'>
        <div className='text-xl font-semibold'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900 text-gray-100'>
      <div className='max-w-[1400px] mx-auto px-6 py-4'>
        <div className='grid grid-cols-[70%_30%] gap-4 pt-16'>
          <div className='pr-2'>{configData && <SubredditConfigComponent username={username} initialData={configData} />}</div>
          <div className='pl-2'>{configData && <TimeConfigComponent username={username} initialData={configData} />}</div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPage;
