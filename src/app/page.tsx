'use client';

import { useState, useEffect } from 'react';

interface Forum {
  id: string;
  identifier: string;
  specificContext: string;
}

interface DbForum {
  id: number;
  config_id: number;
  identifier: string | null;
  specific_context: string | null;
}

export default function ForumConfig() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [generalContext, setGeneralContext] = useState('');
  const [forums, setForums] = useState<Forum[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/config');
      const { data } = await response.json();
      
      if (data) {
        setUsername(data.username || '');
        setPassword(data.password || '');
        setGeneralContext(data.general_context || '');
        setForums(data.forums.map((f: DbForum) => ({
          id: f.id.toString(),
          identifier: f.identifier || '',
          specificContext: f.specific_context || ''
        })));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    setSaving(true);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          generalContext,
          forums
        })
      });
    } catch (error) {
      console.error('Error saving data:', error);
    }
    setSaving(false);
  };

  const addForum = () => {
    const newForum: Forum = {
      id: Math.random().toString(36).substr(2, 9),
      identifier: '',
      specificContext: ''
    };
    setForums([...forums, newForum]);
  };

  const removeForum = (id: string) => {
    setForums(forums.filter(forum => forum.id !== id));
  };

  const updateForum = (id: string, field: keyof Forum, value: string) => {
    setForums(forums.map(forum => 
      forum.id === id ? { ...forum, [field]: value } : forum
    ));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex justify-end mb-4">
          <button
            onClick={saveData}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
              focus:ring-offset-gray-900 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="generalContext">
            General Context
          </label>
          <textarea
            id="generalContext"
            value={generalContext}
            onChange={(e) => setGeneralContext(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md h-32 text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter general context here..."
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-100">Forums</h2>
            <button
              onClick={addForum}
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
                    onChange={(e) => updateForum(forum.id, 'identifier', e.target.value)}
                    placeholder="Forum Identifier"
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md flex-1 text-gray-100 
                      focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeForum(forum.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 
                      focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={forum.specificContext}
                  onChange={(e) => updateForum(forum.id, 'specificContext', e.target.value)}
                  placeholder="Enter specific context for this forum..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md h-24 text-gray-100 
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}