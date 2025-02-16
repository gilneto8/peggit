'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthResponse {
  success: boolean;
  configurations: {
    generalContext: string;
    forums: ForumResponse[];
  };
}

interface ForumResponse {
  id: number;
  identifier: string;
  specific_context: string;
}

export default function LoginPage() {
  const router = useRouter();
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
      localStorage.setItem('username', username);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('configData', JSON.stringify(data.configurations));
      
      router.push('/config');
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-6 max-w-md">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h1 className="text-xl font-semibold mb-4">Login</h1>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={username}
                disabled={isLoading}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                disabled={isLoading}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}