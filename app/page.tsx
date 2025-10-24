'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        router.push('/dashboard');
      } else {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const features = [
    {
      icon: (
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: 'บันทึกการเข้าเรียน',
      description: 'เช็คชื่อนักเรียนได้อย่างรวดเร็วและง่ายดาย',
    },
    {
      icon: (
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'จัดการนักเรียน',
      description: 'เพิ่ม แก้ไข และจัดกลุ่มนักเรียนตามห้องเรียน',
    },
    {
      icon: (
        <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'จัดการห้องเรียน',
      description: 'สร้างและจัดการห้องเรียนพร้อมสมาชิก',
    },
    {
      icon: (
        <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'รายงานและสถิติ',
      description: 'ดูรายงานการเข้าเรียนและสถิติต่างๆ อย่างละเอียด',
    },
    {
      icon: (
        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: 'จัดการโรงเรียน',
      description: 'ดูข้อมูลโรงเรียนและจัดการระบบโดยรวม',
    },
    {
      icon: (
        <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'การตั้งค่า',
      description: 'ปรับแต่งการตั้งค่าระบบและข้อมูลส่วนตัว',
    },
  ];

  if (isAuthenticated || isChecking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800">Easy Attend Teacher</span>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                สมัครสมาชิก
              </Link>
              <Link
                href="/login"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
              ระบบจัดการ
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
                การเข้าเรียน
              </span>
              <br />
              สำหรับครู
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              จัดการการเข้าเรียนของนักเรียนได้อย่างง่ายดายและมีประสิทธิภาพ
              พร้อมระบบรายงานที่ครบถ้วนและใช้งานง่าย
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                เริ่มใช้งานตอนนี้
              </Link>
              <Link
                href="#features"
                className="bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-600 font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-lg"
              >
                เรียนรู้เพิ่มเติม
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              ฟีเจอร์ที่ครบครัน
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ทุกสิ่งที่ครูต้องการสำหรับการจัดการการเข้าเรียนอย่างมีประสิทธิภาพ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-blue-100 group hover:scale-105"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-xl mb-6 group-hover:bg-blue-50 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl shadow-2xl p-12 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              พร้อมเริ่ม จัดการการเข้าเรียนแล้วหรือยัง?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              เข้าสู่ระบบและเริ่มใช้งานได้ทันที ง่าย รวดเร็ว มีประสิทธิภาพ
            </p>
            <Link
              href="/login"
              className="inline-block bg-white text-blue-600 font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              เข้าสู่ระบบตอนนี้
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <span className="text-xl font-bold">Easy Attend Teacher</span>
              </div>
              <p className="text-gray-300">
                ระบบจัดการการเข้าเรียนที่ง่ายและมีประสิทธิภาพสำหรับครู
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">ฟีเจอร์หลัก</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• บันทึกการเข้าเรียน</li>
                <li>• จัดการนักเรียนและห้องเรียน</li>
                <li>• รายงานและสถิติ</li>
                <li>• การตั้งค่าที่ยืดหยุ่น</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">เกี่ยวกับเรา</h3>
              <p className="text-gray-300">
                พัฒนาขึ้นเพื่อช่วยให้ครูสามารถจัดการการเข้าเรียนได้อย่างง่ายดายและมีประสิทธิภาพ
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Easy Attend Teacher. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
