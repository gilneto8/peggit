// app/forum-config/page.tsx
'use client';

import { useState } from 'react';

interface Forum {
  id: string;
  identifier: string;
  specificContext: string;
}

interface LoginState {
  isLoggedIn: boolean;
  username: string;
}

export default function ForumConfig() {
  const [loginState, setLoginState] = useState<LoginState>({ isLoggedIn: false, username: '' });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [generalContext, setGeneralContext] = useState('');
  const [forums, setForums] = useState<Forum[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error('Authentication failed');

      setLoginState({ isLoggedIn: true, username });
      setError(null);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    setLoginState({ isLoggedIn: false, username: '' });
    setGeneralContext('');
    setForums([]);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginState.username,
          password,
          generalContext,
          forums
        }),
      });

      if (!response.ok) throw new Error('Failed to save configuration');
      setError(null);
    } catch (err) {
      setError('Failed to save configuration. Please try again.');
    }
  };

  if (!loginState.isLoggedIn) {
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
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Welcome, {loginState.username}</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          >
            Logout
          </button>
        </div>
        
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            General Context
          </label>
          <textarea
            value={generalContext}
            onChange={(e) => setGeneralContext(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md h-32 text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter general context here..."
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Forums</h2>
            <button
              onClick={() => setForums([...forums, { id: Math.random().toString(36).substr(2, 9), identifier: '', specificContext: '' }])}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Add Forum
            </button>
          </div>

          <div className="space-y-4">
            {forums.map(forum => (
              <div key={forum.id} className="p-4 border border-gray-700 rounded-md bg-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <input
                    type="text"
                    value={forum.identifier}
                    onChange={(e) => {
                      const newForums = forums.map(f => 
                        f.id === forum.id ? { ...f, identifier: e.target.value } : f
                      );
                      setForums(newForums);
                    }}
                    placeholder="Forum Identifier"
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md flex-1 text-gray-100 
                      focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setForums(forums.filter(f => f.id !== forum.id))}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 
                      focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={forum.specificContext}
                  onChange={(e) => {
                    const newForums = forums.map(f => 
                      f.id === forum.id ? { ...f, specificContext: e.target.value } : f
                    );
                    setForums(newForums);
                  }}
                  placeholder="Enter specific context for this forum..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md h-24 text-gray-100 
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
}