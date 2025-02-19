import { AuthResponse } from '@/types/auth';
import { Forum, StoredForum } from '@/types/config';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import toast from 'react-hot-toast';

type SubredditConfigProps = { username: string; initialData: AuthResponse['configurations'] };

const SubredditConfigComponent: React.FC<SubredditConfigProps> = ({ username, initialData }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [generalContext, setGeneralContext] = useState(initialData.generalContext || '');
  const initialForums = useMemo(
    () => new Map(initialData.forums?.map(f => [f.id.toString(), f.specific_context || '']) || []),
    [initialData],
  );
  const [forums, setForums] = useState<Forum[]>(
    initialData.forums?.map((f: StoredForum) => ({
      id: f.id.toString(),
      identifier: f.identifier,
      specificContext: f.specific_context || '',
      isValid: undefined,
      isValidating: false,
    })) || [],
  );
  const [error, setError] = useState<string | null>(null);
  const [pendingValidation, setPendingValidation] = useState<{ id: string; value: string } | null>(null);

  const validateSubreddit = useCallback(
    async (forumId: string, identifier: string) => {
      if (!identifier) return false;

      // Set validating state
      setForums(currentForums => currentForums.map(f => (f.id === forumId ? { ...f, isValidating: true } : f)));

      try {
        const response = await fetch(`/api/validate-subreddit?name=${identifier}&username=${username}`);
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
    [username],
  );

  const debouncedIdentifier = useDebounce(pendingValidation, 500);

  // Effect to trigger validation when debounced value changes
  useEffect(() => {
    if (debouncedIdentifier) {
      validateSubreddit(debouncedIdentifier.id, debouncedIdentifier.value);
    }
  }, [debouncedIdentifier, validateSubreddit]);

  const validateAllSubreddits = async () => {
    const results = await Promise.all(forums.map(forum => validateSubreddit(forum.id, forum.identifier)));
    return results.every(Boolean);
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);

    try {
      const isValid = await validateAllSubreddits();
      if (!isValid) {
        toast.error('One or more subreddits are invalid. Please check and try again.');
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

      // Update localStorage with new forums and general context
      const storedConfig = JSON.parse(localStorage.getItem('configData') || '{}');
      storedConfig.configurations = {
        ...storedConfig.configurations,
        forums: forums,
        generalContext,
      };
      localStorage.setItem('configData', JSON.stringify(storedConfig));

      toast.success('Configuration saved successfully!');
      setError(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isSaveButtonDisabled = useMemo(() => {
    const hasValidForums = forums.length === 0 || forums.every(forum => forum.isValid !== false);
    const isValidating = forums.some(forum => forum.isValidating);
    const hasGeneralContext = generalContext.trim().length > 0;

    // Check if there are any changes
    const hasForumChanges =
      // Different number of forums
      forums.length !== initialData.forums?.length ||
      // Changed forums
      forums.some(forum => {
        // New forum
        if (!initialForums.has(forum.id)) {
          return forum.identifier !== '';
        }
        // Changed context
        const initialContext = initialForums.get(forum.id) || '';
        return forum.specificContext !== initialContext;
      });

    const hasGeneralContextChanges = generalContext !== initialData.generalContext;
    const hasChanges = hasForumChanges || hasGeneralContextChanges;

    return isSaving || !hasValidForums || isValidating || !hasGeneralContext || !hasChanges;
  }, [isSaving, forums, generalContext, initialData, initialForums]);

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

        {error && <p className='text-red-500 mt-4'>{error}</p>}

        <div className='mt-6'>
          <button
            onClick={handleSubmit}
            disabled={isSaveButtonDisabled}
            className={`w-full px-4 py-3 rounded-md text-lg font-semibold transition-colors duration-300 
              ${
                isSaveButtonDisabled
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubredditConfigComponent;
