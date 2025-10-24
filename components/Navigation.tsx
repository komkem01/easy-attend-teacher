'use client';

import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';

interface NavigationProps {
  title: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export default function Navigation({ title, showBackButton = true, backUrl = '/dashboard' }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      authService.logout();
      router.push('/login');
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-blue-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <button
                onClick={() => router.push(backUrl)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{title}</h1>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => router.push('/dashboard')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/dashboard')
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              แดชบอร์ด
            </button>
            <button
              onClick={() => router.push('/students')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/students')
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              นักเรียน
            </button>
            <button
              onClick={() => router.push('/classrooms')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/classrooms')
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              ห้องเรียน
            </button>
            <button
              onClick={() => router.push('/attendance')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/attendance')
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              เช็คชื่อ
            </button>
            <button
              onClick={() => router.push('/reports')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/reports')
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              รายงาน
            </button>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => {
                  // Toggle mobile menu logic here if needed
                }}
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}