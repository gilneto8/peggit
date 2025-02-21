import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { useConfig } from '@/contexts/config';

const SubredditConfigComponent: React.FC = () => {
  const { username, userId, forums, setForums, generalContext, setGeneralContext, isSaving } = useConfig();
  const [pendingValidation, setPendingValidation] = useState<{ id: string; value: string } | null>(null);

  const validateSubreddit = useCallback(
    async (forumId: string, identifier: string) => {
      if (!identifier) return false;

      // Set validating state
      setForums(currentForums => currentForums.map(f => (f.id === forumId ? { ...f, isValidating: true } : f)));

      try {
        const response = await fetch(`/api/validate-subreddit?name=${identifier}&username=${username}&userId=${userId}`);
        const { exists } = await response.json();
        setForums(currentForums =>
          currentForums.map(f =>
            f.id === forumId
              ? {
                  ...f,
                  isValid: exists,
                  validationError: exists ? null : 'Invalid subreddit',
                  isValidating: false,
                }
              : f,
          ),
        );
        return exists;
      } catch (error) {
        console.error(error);
        setForums(currentForums =>
          currentForums.map(f =>
            f.id === forumId
              ? {
                  ...f,
                  isValid: false,
                  validationError: 'Validation failed',
                  isValidating: false,
                }
              : f,
          ),
        );
        return false;
      }
    },
    [userId, setForums, username],
  );

  const debouncedIdentifier = useDebounce(pendingValidation, 500);

  useEffect(() => {
    if (debouncedIdentifier) {
      validateSubreddit(debouncedIdentifier.id, debouncedIdentifier.value);
    }
  }, [debouncedIdentifier, validateSubreddit]);

  return (
    <div className='container mx-auto p-4 max-w-4xl'>
      <h2 className='text-xl font-semibold mb-4 text-gray-100'>Subreddit configuration</h2>
      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-300 mb-1'>General Context</label>
        <textarea
          value={generalContext}
          onChange={e => setGeneralContext(e.target.value)}
          disabled={isSaving}
          className={`w-full min-h-[80px] max-h-[200px] px-3 py-2 bg-gray-700 border-2 rounded-md text-gray-100 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent overflow-auto
            disabled:opacity-50 disabled:cursor-not-allowed
            ${!generalContext.trim() ? 'border-red-500' : 'border-gray-600'}`}
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
                  isValid: undefined,
                  isValidating: false,
                },
              ])
            }
            disabled={isSaving}
            className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
              disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Add Forum
          </button>
        </div>

        <div className='space-y-4 overflow-auto max-h-[400px]'>
          {forums.map(forum => (
            <div key={forum.id} className='p-4 border border-gray-700 rounded-md bg-gray-800'>
              <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4'>
                <div className='relative flex-1'>
                  <label className='text-sm font-medium text-gray-300 mb-1'>Subreddit</label>
                  <div className='flex flex-row space-x-2'>
                    <input
                      type='text'
                      value={forum.identifier}
                      disabled={isSaving}
                      onChange={e => {
                        const newValue = e.target.value;
                        setForums(currentForums =>
                          currentForums.map(f =>
                            f.id === forum.id ? { ...f, identifier: newValue, isValid: undefined, validationError: null } : f,
                          ),
                        );
                        setPendingValidation({ id: forum.id, value: newValue });
                      }}
                      placeholder='Subreddit name'
                      className={`px-3 py-2 pr-10 bg-gray-700 border-2 rounded-md text-gray-100 w-full 
                      ${forum.isValidating ? 'border-yellow-500' : forum.isValid === false ? 'border-red-500' : 'border-gray-600'}
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    <div className='absolute right-28 top-1/2 -translate-y-1/2 pt-5'>
                      {forum.isValidating ? (
                        <span className='bg-yellow-500 text-white font-bold text-[10px] px-2 py-1 rounded'>Validating</span>
                      ) : forum.isValid === false ? (
                        <span className='bg-red-500 text-white font-bold text-[10px] px-2 py-1 rounded'>Invalid</span>
                      ) : forum.isValid ? (
                        <span className='bg-green-500 text-white font-bold text-[10px] px-2 py-1 rounded'>Valid</span>
                      ) : null}
                    </div>
                    <button
                      onClick={() => setForums(forums.filter(f => f.id !== forum.id))}
                      disabled={isSaving}
                      className='px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
                    disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              <label className='block text-sm font-medium text-gray-300 mb-1'>Specific Context</label>
              <textarea
                value={forum.specificContext}
                disabled={isSaving}
                className={`w-full min-h-[80px] max-h-[200px] px-3 py-2 bg-gray-700 border-2 rounded-md text-gray-100 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent overflow-auto
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${forum.isValid === false ? 'border-red-500' : 'border-gray-600'}`}
                placeholder='Enter specific context for this subreddit...'
                onChange={e => {
                  const newForums = forums.map(f => (f.id === forum.id ? { ...f, specificContext: e.target.value } : f));
                  setForums(newForums);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubredditConfigComponent;
