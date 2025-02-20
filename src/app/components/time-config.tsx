'use client';

import React, { useCallback } from 'react';
import MultiRangeSlider from './generic/multi-range-slider';
import { useConfig } from '@/contexts/config';
import { TimeRange } from '@/types/auth';

const TimeConfigComponent: React.FC = () => {
  const { timeRanges, setTimeRanges } = useConfig();

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
  }, [timeRanges, setTimeRanges]);

  const removeTimeRange = useCallback(
    (rangeId: string) => {
      setTimeRanges(currentRanges => currentRanges.filter(range => range.id !== rangeId));
    },
    [setTimeRanges],
  );

  const updateTimeRange = useCallback(
    (rangeId: string, updates: Partial<TimeRange>) => {
      setTimeRanges(currentRanges => currentRanges.map(range => (range.id === rangeId ? { ...range, ...updates } : range)));
    },
    [setTimeRanges],
  );

  return (
    <div className='container mx-auto p-4 max-w-4xl'>
      <div className='flex justify-between items-center mb-8'>
        <h2 className='text-xl font-semibold text-gray-100'>Time Configuration</h2>
      </div>
      <button
        onClick={addNewTimeRange}
        className='px-4 py-2 mb-4 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed'
      >
        Add Time Range
      </button>

      <div className='flex-grow overflow-auto max-h-[400px] space-y-4'>
        {timeRanges.map(range => (
          <div key={range.id} className='rounded-lg py-2 flex flex-row space-x-4 px-2'>
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
    </div>
  );
};

export default TimeConfigComponent;
