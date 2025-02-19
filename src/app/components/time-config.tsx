'use client';

import React, { useState, useCallback } from 'react';
import MultiRangeSlider from './generic/multi-range-slider';
import { AuthResponse } from '@/types/auth';

type TimeConfigProps = { username: string; initialData: AuthResponse['configurations'] };

const TimeConfigComponent: React.FC<TimeConfigProps> = () => {
  const [rangeValues, setRangeValues] = useState({ min: 2, max: 4 });

  const handleRangeChange = useCallback(({ min, max }: { min: number; max: number }) => {
    // console.log(`Range updated: ${min} - ${max}`);
    setRangeValues({ min, max });
  }, []);

  return (
    <div className='bg-gray-800 rounded-lg h-full p-4'>
      <h2 className='text-xl font-semibold mb-4 text-gray-100'>Time configuration</h2>
      <div className='p-4'>
        <MultiRangeSlider
          min={0}
          max={23.5}
          step={0.5}
          minValue={rangeValues.min}
          maxValue={rangeValues.max}
          onChange={handleRangeChange}
        />
      </div>
    </div>
  );
};

export default TimeConfigComponent;
