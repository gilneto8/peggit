'use client';

import React, { useState, useCallback, useMemo } from 'react';
import MultiRangeSlider from './generic/multi-range-slider';
import { AuthResponse } from '@/types/auth';
import toast from 'react-hot-toast';

type TimeRange = {
  id: string;
  min: number;
  max: number;
  context?: string;
};

type TimeConfigProps = {
  username: string;
  initialData: AuthResponse['configurations'];
};

const TimeConfigComponent: React.FC<TimeConfigProps> = ({ username, initialData }) => {
  const initialTimeRanges = useMemo(
    () =>
      initialData.timeRanges?.map((range, index) => ({
        id: (index + 1).toString(),
        min: range.min,
        max: range.max,
      })) || [{ id: '1', min: 2, max: 4 }],
    [initialData],
  );

  const [timeRanges, setTimeRanges] = useState<TimeRange[]>(initialTimeRanges);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addNewTimeRange = useCallback(() => {
    const newId = (timeRanges.length + 1).toString();
    setTimeRanges(currentRanges => [
      ...currentRanges,
      {
        id: newId,
        min: 12,
        max: 16,
      },
    ]);
  }, [timeRanges]);

  const removeTimeRange = useCallback((rangeId: string) => {
    setTimeRanges(currentRanges => currentRanges.filter(range => range.id !== rangeId));
  }, []);

  const updateTimeRange = useCallback((rangeId: string, updates: Partial<TimeRange>) => {
    setTimeRanges(currentRanges => currentRanges.map(range => (range.id === rangeId ? { ...range, ...updates } : range)));
  }, []);

  const saveTimeRanges = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/time-ranges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          timeRanges: timeRanges.map(range => ({
            min: range.min,
            max: range.max,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to save time configuration');

      const data = await response.json();

      // Update localStorage with new time ranges
      const storedConfig = JSON.parse(localStorage.getItem('configData') || '{}');
      storedConfig.configurations = {
        ...storedConfig.configurations,
        timeRanges: data.timeRanges,
      };
      localStorage.setItem('configData', JSON.stringify(storedConfig));

      toast.success('Time ranges saved successfully!');
      setError(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save time ranges. Please try again.');
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  }, [username, timeRanges]);

  const isSaveButtonDisabled = useMemo(() => {
    // Disable save if saving is in progress or no changes have been made
    return isSaving || timeRanges.length === 0 || JSON.stringify(timeRanges) === JSON.stringify(initialTimeRanges);
  }, [isSaving, timeRanges, initialTimeRanges]);

  return (
    <div className='bg-gray-800 rounded-lg h-full p-4 flex flex-col'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold text-gray-100'>Time Configuration</h2>
        <button
          onClick={addNewTimeRange}
          className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Add Time Range
        </button>
      </div>

      <div className='flex-grow overflow-auto max-h-[400px] space-y-4'>
        {timeRanges.map(range => (
          <div key={range.id} className='rounded-lg py-4 flex flex-row space-x-4'>
            <div className='w-[80%]'>
              <MultiRangeSlider
                min={0}
                max={23.5}
                step={0.5}
                minValue={range.min}
                maxValue={range.max}
                onChange={({ min, max }) => {
                  // Update local state for smooth dragging
                  setTimeRanges(prev => prev.map(r => (r.id === range.id ? { ...r, min, max } : r)));
                }}
                onChangeEnd={({ min, max }) => {
                  // Update final state when dragging ends
                  updateTimeRange(range.id, { min, max });
                }}
              />
            </div>
            <div className='w-[20%] flex items-center justify-end'>
              <button
                onClick={() => removeTimeRange(range.id)}
                className='px-1 text-xs py-1 bg-red-600 text-white rounded-md hover:bg-red-700 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
                    disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <div className='bg-red-500 text-white p-3 rounded-md mb-4'>{error}</div>}

      <div className='mt-4'>
        <button
          onClick={saveTimeRanges}
          disabled={isSaveButtonDisabled}
          className={`w-full px-4 py-3 rounded-md text-lg font-semibold transition-colors duration-300 
            ${
              isSaveButtonDisabled
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
        >
          Save Time Configuration
        </button>
      </div>
    </div>
  );
};

export default TimeConfigComponent;
