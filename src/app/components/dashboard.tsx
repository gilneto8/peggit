'use client';

import React, { useState } from 'react';
import PostCard from './generic/PostCard';
import { Post, ScrapePostsResponse } from '@/types/post';
import { AuthResponse } from '@/types/auth';

interface DashboardComponentProps {
  userId: string;
  configData: AuthResponse['configurations'];
}

const DashboardComponent: React.FC<DashboardComponentProps> = ({ userId, configData }) => {
  const [posts, setPosts] = useState<Post[]>([]);
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
          user_id: userId,
          order_by: configData.orderBy,
          last_hours: configData.lastHours,
          time_filter: configData.timeFilter,
          top_posts_limit: configData.topPostsLimit,
          top_comments_limit: configData.topCommentsLimit,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data: ScrapePostsResponse = await response.json();
      setPosts(data.data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='relative h-full'>
      <div className='sticky top-0 z-10 bg-gray-900 pt-4 pb-4 flex flex-col justify-center'>
        <div className='mb-4'>
          <h2 className='text-center text-xl font-semibold text-gray-100'>Dashboard</h2>
        </div>
        <button
          onClick={fetchPosts}
          disabled={isLoading}
          className='self-center w-auto px-4 py-2 mb-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
              disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? 'Fetching...' : 'Fetch posts'}
        </button>

        {error && <div className='text-red-500 text-center mb-2'>{error}</div>}
      </div>

      <div className='flex-grow overflow-auto space-y-4'>
        {posts.length > 0 ? (
          posts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <p className='text-center text-gray-500'>{isLoading ? 'Loading...' : 'No posts fetched yet'}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardComponent;
