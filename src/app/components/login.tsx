import { AuthResponse } from '@/types/auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/auth';

const LoginComponent = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error('Authentication failed');
      const data: AuthResponse = await response.json();

      // Set both cookie and localStorage
      Cookies.set('isLoggedIn', 'true', { path: '/' });
      localStorage.setItem('username', username);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('configData', JSON.stringify(data.configurations));

      login(username);
      toast.success(`Welcome back, ${username}!`);
      router.push('/configuration');
    } catch (err) {
      console.error(err);
      toast.error('Login failed. Please check your credentials.');
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='bg-gray-800 p-6 rounded-lg border border-gray-700'>
      <h1 className='text-xl font-semibold mb-4'>Login</h1>
      {error && <div className='text-red-500 mb-4'>{error}</div>}
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-1'>Username</label>
          <input
            type='text'
            value={username}
            disabled={isLoading}
            onChange={e => setUsername(e.target.value)}
            className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-1'>Password</label>
          <input
            type='password'
            value={password}
            disabled={isLoading}
            onChange={e => setPassword(e.target.value)}
            className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed'
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className='w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default LoginComponent;
