'use client';

import React, { useCallback } from 'react';
import MultiRangeSlider from './generic/multi-range-slider';
import { useConfig } from '@/contexts/config';
import { TimeRange } from '@/types/auth';
import Toggle from './generic/toggle';

const GeneralConfigComponent: React.FC = () => {
  const {
    timeRanges,
    setTimeRanges,
    topCommentsLimit,
    setTopCommentsLimit,
    topPostsLimit,
    setTopPostsLimit,
    lastHours,
    setLastHours,
    timeFilter,
    setTimeFilter,
    orderBy,
    setOrderBy,
  } = useConfig();

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
        <h2 className='text-xl font-semibold text-gray-100'>General Configuration</h2>
      </div>
      <div>
        <div className='border-b border-gray-700 mb-4'>
          <div className='grid grid-cols-2 space-x-2'>
            <div className='mb-6'>
              <Toggle values={['new', 'top']} initialValue={orderBy} onChange={v => setOrderBy(v as 'new' | 'top')} label='Fetch' />
            </div>
            {orderBy === 'new' ? (
              <div className='mb-6'>
                <label className='block text-sm font-medium text-gray-300 mb-1'>New from the last (hours)</label>
                <input
                  type='number'
                  min={1}
                  max={12}
                  value={lastHours}
                  onChange={e => setLastHours(Number(e.target.value))}
                  className='w-full px-3 py-2 bg-gray-700 border-2 rounded-md text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              border-gray-600'
                  placeholder='Enter last hours'
                />
              </div>
            ) : (
              <div className='mb-6'>
                <label className='block text-sm font-medium text-gray-300 mb-1'>Top in the last</label>
                <select
                  value={timeFilter}
                  onChange={e => setTimeFilter(e.target.value as 'hour' | 'day')}
                  className='h-[42px] w-full px-3 py-2 bg-gray-700 border-2 rounded-md text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              border-gray-600'
                >
                  <option value='hour'>Hour</option>
                  <option value='day'>Day</option>
                </select>
              </div>
            )}
          </div>
          <div className='grid grid-cols-2 space-x-2'>
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-300 mb-1'>Max # of posts</label>
              <input
                type='number'
                min={1}
                max={10}
                value={topPostsLimit}
                onChange={e => setTopPostsLimit(Number(e.target.value))}
                className='w-full px-3 py-2 bg-gray-700 border-2 rounded-md text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              border-gray-600'
                placeholder='Enter top posts limit'
              />
            </div>
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-300 mb-1'>Max # of comments</label>
              <input
                type='number'
                min={1}
                max={15}
                value={topCommentsLimit}
                onChange={e => setTopCommentsLimit(Number(e.target.value))}
                className='w-full px-3 py-2 bg-gray-700 border-2 rounded-md text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              border-gray-600'
                placeholder='Enter top comments limit'
              />
            </div>
          </div>
        </div>

        <label className='block text-sm font-medium text-gray-300 mb-4'>Post fetch time ranges</label>
        <button
          onClick={addNewTimeRange}
          className='px-4 py-2 mb-4 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 
            disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Add
        </button>
        <div className='flex-grow space-y-4'>
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
    </div>
  );
};

export default GeneralConfigComponent;
