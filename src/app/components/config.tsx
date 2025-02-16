import { AuthResponse } from '@/types/auth';
import { Forum, StoredForum } from '@/types/config';
import { useState } from 'react';

const ConfigComponent = ({
  username,
  initialData,
  onLogout,
}: {
  username: string;
  initialData: AuthResponse['configurations'];
  onLogout: () => void;
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [generalContext, setGeneralContext] = useState(initialData.generalContext || '');
  const [forums, setForums] = useState<Forum[]>(
    initialData.forums?.map((f: StoredForum) => ({
      id: f.id.toString(),
      identifier: f.identifier,
      specificContext: f.specific_context,
    })) || [],
  );
  const [error, setError] = useState<string | null>(null);

  // const validateSubreddits = async () => {
  //   const validationResults = await Promise.all(
  //     forums.map(async forum => {
  //       if (!forum.identifier) return { ...forum, isValid: false };
  //       try {
  //         const response = await fetch(`/api/validate-subreddit?name=${forum.identifier}`);
  //         const { exists } = await response.json();
  //         return { ...forum, isValid: exists };
  //       } catch (error) {
  //         return { ...forum, isValid: false };
  //       }
  //     }),
  //   );

  //   setForums(validationResults);
  //   return validationResults.every(forum => forum.isValid);
  // };

  const handleSubmit = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);

    try {
      const isValid = true; // await validateSubreddits();
      if (!isValid) {
        setError('One or more subreddits are invalid. Please check and try again.');
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          generalContext,
          forums,
        }),
      });

      if (!response.ok) throw new Error('Failed to save configuration');
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='container mx-auto p-6 max-w-4xl'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-xl font-semibold'>Welcome, {username}</h1>
        <button
          onClick={onLogout}
          disabled={isSaving}
          className='px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600
            disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Logout
        </button>
      </div>

      {error && <div className='text-red-500 mb-4'>{error}</div>}

      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-300 mb-1'>General Context</label>
        <textarea
          value={generalContext}
          onChange={e => setGeneralContext(e.target.value)}
          disabled={isSaving}
          className='w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md h-32 text-gray-100 
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed'
          placeholder='Enter general context here...'
        />
      </div>

      <div className='mb-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Forums</h2>
          <button
            onClick={() =>
              setForums([
                ...forums,
                {
                  id: Math.random().toString(36).substr(2, 9),
                  identifier: '',
                  specificContext: '',
                },
              ])
            }
            disabled={isSaving}
            className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900
              disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Add Forum
          </button>
        </div>

        <div className='space-y-4'>
          {forums.map(forum => (
            <div key={forum.id} className='p-4 border border-gray-700 rounded-md bg-gray-800'>
              <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4'>
                <div className='relative flex-1'>
                  <input
                    type='text'
                    value={forum.identifier}
                    disabled={isSaving}
                    onChange={e => {
                      const newForums = forums.map(f => (f.id === forum.id ? { ...f, identifier: e.target.value, isValid: undefined } : f));
                      setForums(newForums);
                    }}
                    placeholder="Subreddit name (e.g. 'programming')"
                    className={`px-3 py-2 bg-gray-700 border-2 rounded-md text-gray-100 w-full
                      focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        forum.isValid === false
                          ? 'border-red-500 bg-red-900/20'
                          : forum.isValid
                            ? 'border-green-500 bg-green-900/20'
                            : 'border-gray-600'
                      }`}
                  />
                  {forum.isValid === false && (
                    <span className='absolute right-3 top-1/2 -translate-y-1/2 text-red-500'>Invalid subreddit</span>
                  )}
                </div>
                <button
                  onClick={() => setForums(forums.filter(f => f.id !== forum.id))}
                  disabled={isSaving}
                  className='px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900
                    disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Remove
                </button>
              </div>
              <textarea
                value={forum.specificContext}
                disabled={isSaving}
                onChange={e => {
                  const newForums = forums.map(f => (f.id === forum.id ? { ...f, specificContext: e.target.value } : f));
                  setForums(newForums);
                }}
                placeholder='Enter specific context for this forum...'
                className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md h-24 text-gray-100 
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed'
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSaving}
        className='px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900
          disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {isSaving ? 'Saving...' : 'Save Configuration'}
      </button>
    </div>
  );
};

export default ConfigComponent;
