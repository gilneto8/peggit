'use client';

import React, { useState, useCallback, useEffect } from 'react';

interface AmPmToggleProps {
  initialValue?: 'AM' | 'PM';
  onChange: (value: 'AM' | 'PM') => void;
  label?: string;
}

const AmPmToggle: React.FC<AmPmToggleProps> = ({ initialValue = 'AM', onChange, label }) => {
  const [selectedTime, setSelectedTime] = useState<'AM' | 'PM'>(initialValue);

  const handleToggle = useCallback(() => {
    const newValue = selectedTime === 'AM' ? 'PM' : 'AM';
    setSelectedTime(newValue);
    onChange(newValue);
  }, [selectedTime, onChange]);

  // Handle prop changes
  useEffect(() => {
    if (initialValue !== selectedTime) {
      setSelectedTime(initialValue);
    }
  }, [initialValue, selectedTime]);

  return (
    <div className='relative'>
      {label && <label className='block text-sm font-medium text-gray-300 mb-2'>{label}</label>}

      <div className='flex w-full h-10 bg-gray-700 rounded-lg cursor-pointer overflow-hidden' onClick={handleToggle}>
        <div
          className={`
            w-1/2 flex items-center justify-center 
            transition-all duration-300 ease-in-out
            ${selectedTime === 'AM' ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-400 hover:bg-gray-600'}
          `}
        >
          AM
        </div>
        <div
          className={`
            w-1/2 flex items-center justify-center 
            transition-all duration-300 ease-in-out
            ${selectedTime === 'PM' ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-400 hover:bg-gray-600'}
          `}
        >
          PM
        </div>
      </div>
    </div>
  );
};

export default React.memo(AmPmToggle);
