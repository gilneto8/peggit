import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { AuthResponse, TimeRange } from '@/types/auth';
import { Forum } from '@/types/config';
import toast from 'react-hot-toast';

type ConfigContextType = {
  // Data
  userId: string;
  username: string;
  generalContext: string;
  topPostsLimit: number;
  topCommentsLimit: number;
  lastHours?: number;
  forums: Forum[];
  timeRanges: TimeRange[];

  // State
  isSaving: boolean;
  canSave: boolean;

  // Actions
  setGeneralContext: (context: string) => void;
  setTopPostsLimit: (limit: number) => void;
  setTopCommentsLimit: (limit: number) => void;
  setLastHours: (hours: number) => void;
  setForums: (forums: Forum[] | ((prev: Forum[]) => Forum[])) => void;
  setTimeRanges: (ranges: TimeRange[] | ((prev: TimeRange[]) => TimeRange[])) => void;
  saveConfiguration: () => Promise<void>;
};

const ConfigContext = createContext<ConfigContextType | null>(null);

export function ConfigProvider({
  children,
  userId,
  username,
  initialData,
}: {
  children: ReactNode;
  userId: string;
  username: string;
  initialData: AuthResponse['configurations'];
}) {
  // State
  const [generalContext, setGeneralContext] = useState(initialData.generalContext || '');
  const [topPostsLimit, setTopPostsLimit] = useState(initialData.topPostsLimit || 10);
  const [topCommentsLimit, setTopCommentsLimit] = useState(initialData.topCommentsLimit || 10);
  const [lastHours, setLastHours] = useState(initialData.lastHours || 24);
  const [forums, setForums] = useState<Forum[]>(
    initialData.forums?.map(f => ({
      id: f.id.toString(),
      identifier: f.identifier,
      specificContext: f.specific_context || '',
      isValid: undefined,
      isValidating: false,
    })) || [],
  );

  const [timeRanges, setTimeRanges] = useState<TimeRange[]>(
    initialData.timeRanges?.map((range, index) => ({
      id: (index + 1).toString(),
      min: range.min,
      max: range.max,
    })) || [],
  );
  const [isSaving, setIsSaving] = useState(false);

  // Computed
  const canSave = useMemo(() => {
    const hasValidForums = forums.length === 0 || forums.every(forum => forum.isValid !== false);
    const isValidating = forums.some(forum => forum.isValidating);
    const hasGeneralContext = generalContext.trim().length > 0;
    const hasChanges =
      generalContext !== initialData.generalContext ||
      topPostsLimit !== initialData.topPostsLimit ||
      topCommentsLimit !== initialData.topCommentsLimit ||
      lastHours !== initialData.lastHours ||
      forums.length !== initialData.forums?.length ||
      timeRanges.length !== initialData.timeRanges?.length ||
      forums.some(f => {
        const initial = initialData.forums?.find(inf => inf.id.toString() === f.id);
        return !initial || initial.specific_context !== f.specificContext;
      }) ||
      timeRanges.some((r, i) => {
        const initial = initialData.timeRanges?.[i];
        return !initial || initial.min !== r.min || initial.max !== r.max;
      });

    return hasValidForums && !isValidating && hasGeneralContext && hasChanges;
  }, [forums, generalContext, timeRanges, initialData, topPostsLimit, topCommentsLimit, lastHours]);

  // Actions
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
    [username, userId],
  );

  const validateAllSubreddits = useCallback(async () => {
    const results = await Promise.all(forums.map(forum => validateSubreddit(forum.id, forum.identifier)));
    return results.every(Boolean);
  }, [forums, validateSubreddit]);

  const saveConfiguration = useCallback(async () => {
    if (isSaving || !canSave) return;
    setIsSaving(true);

    try {
      const isValid = await validateAllSubreddits();
      if (!isValid) {
        toast.error('One or more subreddits are invalid. Please check and try again.');
        setIsSaving(false);
        return;
      }

      // Use the latest state values directly
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          generalContext,
          topPostsLimit,
          topCommentsLimit,
          lastHours,
          forums,
          timeRanges: timeRanges.map(range => ({
            min: range.min,
            max: range.max,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to save configuration');

      const data = await response.json();

      // Update localStorage
      localStorage.setItem('configData', JSON.stringify(data.configurations));

      toast.success('Configuration saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [
    userId,
    generalContext,
    forums,
    timeRanges,
    isSaving,
    canSave,
    validateAllSubreddits,
    topPostsLimit,
    topCommentsLimit,
    lastHours,
    forums,
  ]);

  const value = {
    // Data
    userId,
    username,
    generalContext,
    topPostsLimit,
    topCommentsLimit,
    lastHours,
    forums,
    timeRanges,

    // State
    isSaving,
    canSave,

    // Actions
    setGeneralContext,
    setTopPostsLimit,
    setTopCommentsLimit,
    setLastHours,
    setForums,
    setTimeRanges,
    saveConfiguration,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
