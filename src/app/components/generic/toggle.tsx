'use client';

import React, { useState, useCallback, useEffect } from 'react';

interface ToggleProps<T extends string> {
  values: T[];
  initialValue?: T;
  onChange: (value: T) => void;
  label?: string;
}

const Toggle: React.FC<ToggleProps<string>> = ({ values, initialValue, onChange, label }) => {
  const [selectedValue, setSelectedValue] = useState<string>(initialValue ?? values[0]);

  const handleToggle = useCallback(() => {
    const newValue = selectedValue === values[0] ? values[1] : values[0];
    setSelectedValue(newValue);
    onChange(newValue);
  }, [selectedValue, onChange]);

  // Handle prop changes
  useEffect(() => {
    if (initialValue !== selectedValue) {
      setSelectedValue(initialValue ?? values[0]);
    }
  }, [initialValue, selectedValue]);

  return (
    <div className='relative'>
      {label && <label className='block text-sm font-medium text-gray-300 mb-2'>{label}</label>}

      <div className='flex w-full h-10 bg-gray-700 rounded-lg cursor-pointer overflow-hidden' onClick={handleToggle}>
        <div
          className={`
            w-1/2 flex items-center justify-center 
            transition-all duration-300 ease-in-out
            ${selectedValue === values[0] ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-400 hover:bg-gray-600'}
          `}
        >
          {values[0]}
        </div>
        <div
          className={`
            w-1/2 flex items-center justify-center 
            transition-all duration-300 ease-in-out
            ${selectedValue === values[1] ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-400 hover:bg-gray-600'}
          `}
        >
          {values[1]}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Toggle);
