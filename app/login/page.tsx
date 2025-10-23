'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { LoginRequest } from '@/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Starting login with:', formData);
      const response = await authService.login(formData);
      console.log('Login response received:', response);
      
      if (response.success) {
        // Login successful, redirect to dashboard
        console.log('Login successful, token stored, redirecting to dashboard...');
        
        // Wait a moment for token to be stored, then redirect
        setTimeout(() => {
          window.location.replace('/dashboard');
        }, 100);
      } else {
        console.log('Login failed:', response.message);
        setError(response.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (err: any) {
      console.error('Login error details:', err);
      
      // จัดการ error messages ที่หลากหลาย
      let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      
      if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
        errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
      } else if (err.response?.status === 401) {
        errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      } else if (err.response?.status === 500) {
        errorMessage = 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่ในภายหลัง';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Easy Attend
          </h1>
          <h2 className="text-lg sm:text-xl font-semibold text-blue-600 mb-1">
            เข้าสู่ระบบครู
          </h2>
          <p className="text-sm text-gray-600">
            ระบบจัดการการเข้าเรียนออนไลน์
          </p>
        </div>
        
        {/* Login Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    อีเมล
                  </span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-gray-50/50 hover:bg-white/80"
                  placeholder="กรอกอีเมลของคุณ"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    รหัสผ่าน
                  </span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-gray-50/50 hover:bg-white/80"
                  placeholder="กรอกรหัสผ่านของคุณ"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  จำฉันไว้
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-3 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center justify-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    เข้าสู่ระบบ
                  </>
                )}
              </span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">หรือ</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center w-full py-3 px-6 border border-blue-200 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 font-medium transition-all duration-200 transform hover:scale-[1.02]"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                ยังไม่มีบัญชี? ลงทะเบียนที่นี่
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © 2025 Easy Attend. ระบบจัดการการเข้าเรียนออนไลน์
          </p>
        </div>
      </div>
    </div>
  );
}