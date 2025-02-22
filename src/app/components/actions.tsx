'use client';

import React from 'react';
import { useConfig } from '@/contexts/config';

const ActionComponent: React.FC = () => {
  const { saveConfiguration, isSaving, canSave } = useConfig();

  return (
    <div className='w-full flex justify-center items-center'>
      <button
        onClick={saveConfiguration}
        disabled={!canSave || isSaving}
        className={`w-[300px] px-4 py-3 rounded-md text-lg font-semibold transition-colors duration-300 
          ${
            !canSave || isSaving
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
      >
        {isSaving ? 'Saving...' : 'Save Configuration'}
      </button>
    </div>
  );
};

export default ActionComponent;
