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
    const fetchConfigData = async () => {
      const isLoggedIn = Cookies.get('isLoggedIn');
      const storedUsername = localStorage.getItem('username');

      if (!isLoggedIn || !storedUsername) {
        router.push('/');
        return;
      }

      try {
        // Fetch fresh data from server
        const response = await fetch(`/api/config/get?username=${encodeURIComponent(storedUsername)}`);

        if (!response.ok) throw new Error('Failed to fetch configuration');

        const data = await response.json();

        // Update localStorage with fresh data
        localStorage.setItem('configData', JSON.stringify(data.configurations));

        setUsername(storedUsername);
        setConfigData(data.configurations);
      } catch (error) {
        console.error('Failed to fetch configuration:', error);
        // Fallback to stored data if server fetch fails
        const storedConfigData = JSON.parse(localStorage.getItem('configData') || 'null');
        if (storedConfigData) {
          setUsername(storedUsername);
          setConfigData(storedConfigData);
        } else {
          router.push('/');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfigData();
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
