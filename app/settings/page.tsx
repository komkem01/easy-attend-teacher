'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { teacherInfoService } from '@/services/apiService';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/components/Toast';

interface Settings {
  profile: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    prefix_name: string;
    gender_name: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    attendanceReminders: boolean;
    weeklyReports: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    theme: string;
  };
  privacy: {
    profileVisibility: string;
    dataSharing: boolean;
    analyticsTracking: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState<Settings>({
    profile: {
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      prefix_name: '',
      gender_name: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      attendanceReminders: true,
      weeklyReports: false
    },
    preferences: {
      language: 'th',
      timezone: 'Asia/Bangkok',
      dateFormat: 'dd/mm/yyyy',
      theme: 'light'
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analyticsTracking: true
    }
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const teacherInfo = await teacherInfoService.getTeacherInfo();
      const teacher = teacherInfo.teacher;

      setSettings(prev => ({
        ...prev,
        profile: {
          firstname: teacher.firstname || '',
          lastname: teacher.lastname || '',
          email: teacher.email || '',
          phone: teacher.phone || '',
          prefix_name: teacher.prefix?.name || '',
          gender_name: teacher.gender?.name || ''
        }
      }));
    } catch (error) {
      console.error('Error loading settings:', error);
      showToast('เกิดข้อผิดพลาดในการโหลดการตั้งค่า', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // In a real app, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      showToast('บันทึกการตั้งค่าสำเร็จ', 'success');
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      authService.logout();
      showToast('ออกจากระบบแล้ว', 'success');
      router.push('/login');
    }
  };

  const tabs = [
    { id: 'profile', name: 'ข้อมูลส่วนตัว', icon: '👤' },
    { id: 'notifications', name: 'การแจ้งเตือน', icon: '🔔' },
    { id: 'preferences', name: 'การตั้งค่า', icon: '⚙️' },
    { id: 'privacy', name: 'ความเป็นส่วนตัว', icon: '🔐' },
    { id: 'account', name: 'บัญชี', icon: '👨‍💼' }
  ];

  if (isLoading) {
    return <LoadingSpinner fullScreen={true} message="กำลังโหลดการตั้งค่า..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-blue-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">การตั้งค่า</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">ข้อมูลส่วนตัว</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
                      <input
                        type="text"
                        value={settings.profile.firstname}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, firstname: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                      <input
                        type="text"
                        value={settings.profile.lastname}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, lastname: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, email: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                      <input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, phone: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">การแจ้งเตือน</h2>
                  <div className="space-y-6">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {key === 'emailNotifications' && 'การแจ้งเตือนทางอีเมล'}
                            {key === 'pushNotifications' && 'การแจ้งเตือนแบบ Push'}
                            {key === 'attendanceReminders' && 'เตือนการเช็คชื่อ'}
                            {key === 'weeklyReports' && 'รายงานรายสัปดาห์'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {key === 'emailNotifications' && 'รับการแจ้งเตือนผ่านทางอีเมล'}
                            {key === 'pushNotifications' && 'รับการแจ้งเตือนแบบ Push notification'}
                            {key === 'attendanceReminders' && 'เตือนเมื่อถึงเวลาเช็คชื่อ'}
                            {key === 'weeklyReports' && 'รับรายงานสรุปรายสัปดาห์'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                [key]: e.target.checked
                              }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">การตั้งค่า</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ภาษา</label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, language: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                      >
                        <option value="th">ไทย</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">เขตเวลา</label>
                      <select
                        value={settings.preferences.timezone}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, timezone: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                      >
                        <option value="Asia/Bangkok">เอเชีย/กรุงเทพ</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">รูปแบบวันที่</label>
                      <select
                        value={settings.preferences.dateFormat}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, dateFormat: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                      >
                        <option value="dd/mm/yyyy">วว/ดด/ปปปป</option>
                        <option value="mm/dd/yyyy">ดด/วว/ปปปป</option>
                        <option value="yyyy-mm-dd">ปปปป-ดด-วว</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ธีม</label>
                      <select
                        value={settings.preferences.theme}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, theme: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                      >
                        <option value="light">สว่าง</option>
                        <option value="dark">มืด</option>
                        <option value="auto">อัตโนมัติ</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">ความเป็นส่วนตัว</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">การมองเห็นโปรไฟล์</label>
                      <select
                        value={settings.privacy.profileVisibility}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, profileVisibility: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                      >
                        <option value="public">สาธารณะ</option>
                        <option value="private">ส่วนตัว</option>
                        <option value="friends">เฉพาะเพื่อน</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-800">การแชร์ข้อมูล</h3>
                        <p className="text-sm text-gray-600">อนุญาตให้แชร์ข้อมูลเพื่อปรับปรุงบริการ</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.dataSharing}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, dataSharing: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-800">การติดตามการใช้งาน</h3>
                        <p className="text-sm text-gray-600">อนุญาตให้ติดตามการใช้งานเพื่อวิเคราะห์</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.analyticsTracking}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, analyticsTracking: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">จัดการบัญชี</h2>
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                      <h3 className="font-semibold text-yellow-800 mb-2">เปลี่ยนรหัสผ่าน</h3>
                      <p className="text-yellow-700 text-sm mb-4">เปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชี</p>
                      <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        เปลี่ยนรหัสผ่าน
                      </button>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <h3 className="font-semibold text-red-800 mb-2">ออกจากระบบ</h3>
                      <p className="text-red-700 text-sm mb-4">ออกจากระบบในอุปกรณ์นี้</p>
                      <button 
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        ออกจากระบบ
                      </button>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-800 mb-2">ลบบัญชี</h3>
                      <p className="text-gray-700 text-sm mb-4">ลบบัญชีและข้อมูลทั้งหมดอย่างถาวร</p>
                      <button 
                        onClick={() => showToast('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน', 'warning')}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        ลบบัญชี
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}