"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import {
  teacherInfoService,
  studentService,
  classroomService,
  attendanceService,
} from "@/services/apiService";
import { Teacher, Student, Classroom, Attendance } from "@/types/entities";
import DashboardLayout from "@/components/DashboardLayout";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClassrooms: 0,
    todayAttendance: 0,
    attendanceRate: 95,
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load teacher info with integrated stats
      const teacherInfoData = await teacherInfoService.getTeacherInfo();
      console.log('Teacher info data:', teacherInfoData);
      
      // Extract teacher data
      setTeacher(teacherInfoData.teacher || teacherInfoData);

      // Use stats from teacher info response
      const statsData = teacherInfoData.total_stats || {};
      
      setStats({
        totalStudents: statsData.total_students || 0,
        totalClassrooms: statsData.total_classrooms || 0,
        todayAttendance: statsData.total_attendance || 0,
        attendanceRate: statsData.attendance_rate || 95,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };  const handleLogout = async () => {
    // Clear local session and redirect
    authService.logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                ยินดีต้อนรับ{" "}
                {teacher
                  ? `${teacher.prefix?.name || ""}${teacher.firstname} ${
                      teacher.lastname
                    }`
                  : "ครู"}
                ! 👋
              </h2>
              <p className="text-blue-100 text-lg">
                เริ่มต้นจัดการการเข้าเรียนของนักเรียนได้เลย
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">23</div>
                  <div className="text-sm text-blue-100">ตุลาคม 2025</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Primary Features */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Student Management */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      รายชื่อนักเรียน
                    </h3>
                    <p className="text-sm text-gray-600">
                      จัดการข้อมูลนักเรียน
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 text-sm">
                  ดูรายชื่อ เพิ่ม แก้ไข และจัดกลุ่มนักเรียนในระบบ
                </p>
                <button
                  onClick={() => router.push("/students")}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  ดูรายชื่อนักเรียน
                </button>
              </div>

              {/* Attendance Recording */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      บันทึกการเข้าเรียน
                    </h3>
                    <p className="text-sm text-gray-600">เช็คชื่อประจำวัน</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 text-sm">
                  บันทึกการเข้าเรียนของนักเรียนแต่ละวัน
                </p>
                <button
                  onClick={() => router.push("/attendance")}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  บันทึกการเข้าเรียน
                </button>
              </div>
            </div>

            {/* Reports */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      รายงานการเข้าเรียน
                    </h3>
                    <p className="text-sm text-gray-600">
                      สถิติและข้อมูลการเข้าเรียน
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.attendanceRate}%
                  </div>
                  <div className="text-xs text-gray-500">เข้าเรียนเฉลี่ย</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalStudents}
                  </div>
                  <div className="text-xs text-gray-500">นักเรียนทั้งหมด</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.todayAttendance}
                  </div>
                  <div className="text-xs text-gray-500">เข้าเรียนวันนี้</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.totalClassrooms}
                  </div>
                  <div className="text-xs text-gray-500">ห้องเรียน</div>
                </div>
              </div>
              <button
                onClick={() => router.push("/reports")}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                ดูรายงานทั้งหมด
              </button>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  className="h-5 w-5 text-blue-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                การดำเนินการด่วน
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors duration-200 flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-600 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium">การตั้งค่า</span>
                </button>
                <button className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors duration-200 flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-600 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span className="text-sm font-medium">ข้อมูลโรงเรียน</span>
                </button>
                <button className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors duration-200 flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-600 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium">ความช่วยเหลือ</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  className="h-5 w-5 text-blue-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                สถิติรวดเร็ว
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">วันนี้เข้าเรียน</span>
                  <span className="text-lg font-bold text-green-600">
                    {stats.todayAttendance}/{stats.totalStudents}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">อัตราเข้าเรียน</span>
                  <span className="text-lg font-bold text-blue-600">
                    {stats.attendanceRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ห้องเรียน</span>
                  <span className="text-lg font-bold text-purple-600">
                    {stats.totalClassrooms}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
