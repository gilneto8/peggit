'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';

// Utility function to format time
const formatTime = (value: number): string => {
  const hours = Math.floor(value);
  const minutes = (value % 1) * 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

interface MultiRangeSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange?: (values: { min: number; max: number }) => void;
  onChangeEnd: (values: { min: number; max: number }) => void;
  step?: number;
  label?: string;
  formatValue?: (value: number) => string;
}

const MultiRangeSlider: React.FC<MultiRangeSliderProps> = ({
  min,
  max,
  minValue,
  maxValue,
  onChange,
  onChangeEnd,
  step = 0.5,
  label,
  formatValue = formatTime,
}) => {
  const [minVal, setMinVal] = useState(minValue);
  const [maxVal, setMaxVal] = useState(maxValue);
  const minValRef = useRef(minValue);
  const maxValRef = useRef(maxValue);
  const range = useRef<HTMLDivElement>(null);
  const minInputRef = useRef<HTMLInputElement>(null);
  const maxInputRef = useRef<HTMLInputElement>(null);

  // Convert to percentage
  const getPercent = useCallback((value: number) => Math.round(((value - min) / (max - min)) * 100), [min, max]);

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  const handleDragEnd = () => {
    onChangeEnd({ min: minVal, max: maxVal });
  };

  // Prevent unnecessary re-renders and handle prop changes
  useEffect(() => {
    if (minValue !== minVal) {
      setMinVal(minValue);
      minValRef.current = minValue;
    }
  }, [minVal, minValue]);

  useEffect(() => {
    if (maxValue !== maxVal) {
      setMaxVal(maxValue);
      maxValRef.current = maxValue;
    }
  }, [maxVal, maxValue]);

  return (
    <div className='relative'>
      {label && <label className='block text-sm font-medium text-gray-300 mb-2'>{label}</label>}
      <div className='relative h-2 rounded-md bg-gray-700'>
        <div ref={range} className='absolute h-full bg-blue-500 rounded-md' />
      </div>
      <div className='relative'>
        <input
          ref={minInputRef}
          type='range'
          min={min}
          max={max}
          value={minVal}
          step={step}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onChange={event => {
            const value = Math.min(Number(event.target.value), maxVal - step);
            setMinVal(value);
            minValRef.current = value;
            onChange?.({ min: value, max: maxVal });
          }}
          className='absolute w-full h-2 -mt-2 pointer-events-none appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-200 hover:[&::-webkit-slider-thumb]:bg-blue-600'
        />
        <input
          ref={maxInputRef}
          type='range'
          min={min}
          max={max}
          value={maxVal}
          step={step}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onChange={event => {
            const value = Math.max(Number(event.target.value), minVal + step);
            setMaxVal(value);
            maxValRef.current = value;
            onChange?.({ min: minVal, max: value });
          }}
          className='absolute w-full h-2 -mt-2 pointer-events-none appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-200 hover:[&::-webkit-slider-thumb]:bg-blue-600'
        />
      </div>
      <div className='flex justify-between mt-2'>
        <span className='text-sm text-gray-400'>{formatValue(minVal)}</span>
        <span className='text-sm text-gray-400'>{formatValue(maxVal)}</span>
      </div>
    </div>
  );
};

export default React.memo(MultiRangeSlider);
