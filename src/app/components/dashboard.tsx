'use client';

import React, { useState } from 'react';

const DashboardComponent: React.FC = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scrape-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'current_user', // Replace with actual user ID
          order_by: 'top',
          time_filter: 'day',
          top_posts_limit: 10,
          top_comments_limit: 5,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container p-4 max-w-full flex flex-col justify-center'>
      <div className='mb-8'>
        <h2 className='text-center text-xl font-semibold text-gray-100'>Dashboard</h2>
      </div>
      <button
        onClick={fetchPosts}
        disabled={isLoading}
        className='self-center w-auto px-4 py-2 mb-4 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {isLoading ? 'Fetching...' : 'Fetch posts'}
      </button>

      {error && <div className='text-red-500 text-center mb-4'>{error}</div>}

      <div className='flex-grow overflow-auto max-h-[400px] space-y-4'>
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <div key={index} className='bg-gray-800 p-4 rounded-md'>
              {/* Render post details here */}
              <p>{JSON.stringify(post)}</p>
            </div>
          ))
        ) : (
          <p className='text-center text-gray-500'>{isLoading ? 'Loading...' : 'No posts fetched yet'}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardComponent;
