'use client';

import LoginComponent from './components/login';

const HomePage = () => {
  return (
    <div className='min-h-screen bg-gray-900 text-gray-100'>
      <div className='container mx-auto p-6'>
        <div className='max-w-md mx-auto'>
          <LoginComponent />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
