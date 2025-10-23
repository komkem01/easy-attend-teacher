'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { AuthRequest } from '@/types/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AuthRequest>({
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    phone: '',
    school_name: '',
    prefix_name: '',
    gender_name: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate password confirmation
    if (formData.password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.register(formData);
      
      // ถ้าไม่มี error แสดงว่าสำเร็จ
      setSuccess('ลงทะเบียนสำเร็จ! กำลังเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ...');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // จัดการ error messages ที่หลากหลาย
      let errorMessage = 'เกิดข้อผิดพลาดในการลงทะเบียน';
      
      if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
      } else if (err.response?.status === 400) {
        errorMessage = 'ข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน';
      } else if (err.response?.status === 409) {
        errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น';
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
      <div className="max-w-lg w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Easy Attend
          </h1>
          <h2 className="text-lg sm:text-xl font-semibold text-blue-600 mb-1">
            ลงทะเบียนครู
          </h2>
          <p className="text-sm text-gray-600">
            สร้างบัญชีใหม่เพื่อเข้าใช้ระบบ
          </p>
        </div>
        
        {/* Register Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center">
                      <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      ชื่อ
                    </span>
                  </label>
                  <input
                    id="firstname"
                    name="firstname"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-gray-50/50 hover:bg-white/80"
                    placeholder="ชื่อจริง"
                    value={formData.firstname}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center">
                      <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      นามสกุล
                    </span>
                  </label>
                  <input
                    id="lastname"
                    name="lastname"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-gray-50/50 hover:bg-white/80"
                    placeholder="นามสกุล"
                    value={formData.lastname}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Title and Gender Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prefix_name" className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center">
                      <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      คำนำหน้า
                    </span>
                  </label>
                  <select
                    id="prefix_name"
                    name="prefix_name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-gray-800 bg-gray-50/50 hover:bg-white/80"
                    value={formData.prefix_name}
                    onChange={handleChange}
                  >
                    <option value="">เลือกคำนำหน้า</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="ครู">ครู</option>
                    <option value="อาจารย์">อาจารย์</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="gender_name" className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center">
                      <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      เพศ
                    </span>
                  </label>
                  <select
                    id="gender_name"
                    name="gender_name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-gray-800 bg-gray-50/50 hover:bg-white/80"
                    value={formData.gender_name}
                    onChange={handleChange}
                  >
                    <option value="">เลือกเพศ</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                    <option value="ไม่ระบุ">ไม่ระบุ</option>
                  </select>
                </div>
              </div>

              {/* Email */}
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
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    เบอร์โทรศัพท์ 
                    <span className="text-gray-400 ml-1">(ไม่บังคับ)</span>
                  </span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-gray-50/50 hover:bg-white/80"
                  placeholder="0XX-XXX-XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* School Name */}
              <div>
                <label htmlFor="school_name" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    ชื่อโรงเรียน
                  </span>
                </label>
                <input
                  id="school_name"
                  name="school_name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-gray-50/50 hover:bg-white/80"
                  placeholder="ชื่อโรงเรียนของคุณ"
                  value={formData.school_name}
                  onChange={handleChange}
                />
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-gray-50/50 hover:bg-white/80"
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center">
                      <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ยืนยันรหัสผ่าน
                    </span>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-gray-50/50 hover:bg-white/80"
                    placeholder="ยืนยันรหัสผ่าน"
                    value={confirmPassword}
                    onChange={handleChange}
                  />
                </div>
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

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{success}</span>
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
                    กำลังลงทะเบียน...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    ลงทะเบียน
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
                href="/login"
                className="inline-flex items-center justify-center w-full py-3 px-6 border border-blue-200 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 font-medium transition-all duration-200 transform hover:scale-[1.02]"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                มีบัญชีแล้ว? เข้าสู่ระบบที่นี่
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