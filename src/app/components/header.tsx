'use client';

import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/auth';

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { username, isLoggedIn, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    Cookies.remove('isLoggedIn', { path: '/' });
    localStorage.clear();
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <div className='fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-200 z-50'>
      <div className='container mx-auto h-full px-4 flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Link href={isLoggedIn ? '/configuration' : '/'} className='text-white font-medium text-xl'>
            Peggit
          </Link>
        </div>
        {isLoggedIn && (
          <nav className='flex items-center space-x-6'>
            <div className='mr-32 space-x-6'>
              <Link href='/dashboard' className='text-gray-600 hover:text-gray-400 transition-colors pointer-events-none opacity-50'>
                Dashboard
              </Link>
              <Link
                href='/configuration'
                className={`transition-colors ${pathname === '/configuration' ? 'text-white underline' : 'text-gray-600 hover:text-gray-400'}`}
              >
                Configuration
              </Link>
            </div>
            <div className='relative' ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className='flex items-center space-x-1 text-gray-400 hover:text-gray-200 transition-colors focus:outline-none'
              >
                <span>{username}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className='absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50'>
                  <button
                    onClick={handleLogout}
                    className='w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-left'
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};
