import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);

  const formatTimestamp = (utcTimestamp: number) => {
    return formatDistanceToNow(new Date(utcTimestamp * 1000), { addSuffix: true });
  };

  const toggleComments = () => {
    setIsCommentsExpanded(!isCommentsExpanded);
  };

  return (
    <div className='bg-gray-800 rounded-lg p-4 space-y-3 shadow-md w-min-[500px] w-[1000px]'>
      {/* Post Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h3 className='text-lg font-semibold text-gray-100 line-clamp-2'>{post.title}</h3>
          <div className='text-sm text-gray-400 flex space-x-2 items-center'>
            <span>r/{post.subreddit}</span>
            <span>•</span>
            <span>u/{post.author}</span>
            <span>•</span>
            <span>{formatTimestamp(post.created_utc)}</span>
          </div>
        </div>

        {/* Post Score */}
        <div className='flex flex-col items-center bg-gray-700 rounded-md px-2 py-1'>
          <span className='text-sm font-bold text-gray-200'>{post.score}</span>
          <span className='text-xs text-gray-400'>points</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className='flex justify-between items-center'>
        <a href={post.url} target='_blank' rel='noopener noreferrer' className='text-blue-400 hover:text-blue-300 text-sm'>
          View on Reddit
        </a>

        {post.comments.length > 0 && (
          <button onClick={toggleComments} className='text-sm text-gray-300 hover:text-gray-100 flex items-center space-x-1'>
            <span>{post.num_comments} Comments</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className={`h-4 w-4 transform transition-transform duration-200 ${isCommentsExpanded ? 'rotate-180' : ''}`}
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        )}
      </div>

      {/* Comments Section */}
      {isCommentsExpanded && post.comments.length > 0 && (
        <div className='mt-2 space-y-2 border-t border-gray-700 pt-2'>
          {post.comments.map(comment => (
            <div key={comment.id} className='bg-gray-700 rounded-md p-2'>
              <div className='flex justify-between items-start'>
                <div>
                  <span className='text-sm font-semibold text-gray-200'>u/{comment.author}</span>
                  <p className='text-sm text-gray-300 mt-1'>{comment.body}</p>
                </div>
                <div className='bg-gray-600 rounded-md px-2 py-1 text-xs text-gray-100'>{comment.score} pts</div>
              </div>
              <div className='text-xs text-gray-400 mt-1'>{formatTimestamp(comment.created_utc)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostCard;
