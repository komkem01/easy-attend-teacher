'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authService } from '@/services/authService';
import { classroomService, classroomMemberService, studentService, attendanceService } from '@/services/apiService';
import { Classroom, Student, Attendance } from '@/types/entities';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';

export default function ClassroomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const classroomId = parseInt(params.id as string);
  const { showToast, ToastContainer } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadClassroomData();
  }, [router, classroomId]);

  const loadClassroomData = async () => {
    try {
      setIsLoading(true);
      
      const [classroomData, membersData, attendanceData] = await Promise.all([
        classroomService.getClassroomById(classroomId),
        classroomMemberService.getClassroomMembersByClassroomId(classroomId),
        attendanceService.getAttendancesByClassroom(classroomId)
      ]);

      setClassroom(classroomData);
      const studentsList = membersData.map(member => member.student).filter(Boolean) as Student[];
      setStudents(studentsList);

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendanceData.filter(att => att.attendance_date === today);
      setRecentAttendance(attendanceData.slice(0, 10)); // Last 10 records

      // Calculate stats
      const totalStudents = studentsList.length;
      const presentToday = todayAttendance.filter(att => att.status === 'present').length;
      const absentToday = todayAttendance.filter(att => att.status === 'absent').length;
      const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

      setStats({
        totalStudents,
        presentToday,
        absentToday,
        attendanceRate
      });

    } catch (error) {
      console.error('Error loading classroom data:', error);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm('คุณต้องการลบนักเรียนคนนี้ออกจากห้องเรียนหรือไม่?')) return;

    try {
      await classroomMemberService.removeMemberFromClassroom(classroomId, studentId);
      showToast('ลบนักเรียนออกจากห้องเรียนแล้ว', 'success');
      loadClassroomData();
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการลบนักเรียน', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'มาเรียน';
      case 'absent': return 'ขาดเรียน';
      case 'late': return 'มาสาย';
      case 'excused': return 'ลาป่วย';
      default: return status;
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen={true} message="กำลังโหลดข้อมูลห้องเรียน..." />;
  }

  if (!classroom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <EmptyState
          title="ไม่พบห้องเรียน"
          description="ห้องเรียนที่คุณต้องการดูไม่มีอยู่ในระบบ"
          action={{
            label: "กลับไปหน้าห้องเรียน",
            onClick: () => router.push('/classrooms')
          }}
        />
      </div>
    );
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
                onClick={() => router.push('/classrooms')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">{classroom.name}</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push('/attendance')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                บันทึกการเข้าเรียน
              </button>
              <button
                onClick={() => router.push('/reports')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                ดูรายงาน
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Classroom Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">{classroom.name}</h2>
                <p className="text-gray-600 leading-relaxed">{classroom.description || 'ไม่มีคำอธิบาย'}</p>
                <p className="text-sm text-gray-500 leading-relaxed">วิชา: {classroom.subject || 'ไม่ระบุ'}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
              <div className="text-sm text-blue-600">นักเรียนทั้งหมด</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.presentToday}</div>
              <div className="text-sm text-green-600">มาเรียนวันนี้</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.absentToday}</div>
              <div className="text-sm text-red-600">ขาดเรียนวันนี้</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.attendanceRate}%</div>
              <div className="text-sm text-purple-600">อัตราการเข้าเรียน</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">รายชื่อนักเรียน</h3>
              <span className="text-sm text-gray-500">{students.length} คน</span>
            </div>

            {students.length > 0 ? (
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {student.firstname?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {student.prefix?.name || ''}{student.firstname} {student.lastname}
                        </div>
                        <div className="text-sm text-gray-600">รหัส: {student.student_id}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(student.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="ยังไม่มีนักเรียน"
                description="ห้องเรียนนี้ยังไม่มีนักเรียน"
                action={{
                  label: "เพิ่มนักเรียน",
                  onClick: () => router.push('/students')
                }}
              />
            )}
          </div>

          {/* Recent Attendance */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">การเข้าเรียนล่าสุด</h3>
              <button
                onClick={() => router.push(`/reports?classroom=${classroomId}`)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ดูทั้งหมด →
              </button>
            </div>

            {recentAttendance.length > 0 ? (
              <div className="space-y-3">
                {recentAttendance.map((attendance) => (
                  <div key={attendance.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-600">
                        {new Date(attendance.attendance_date).toLocaleDateString('th-TH')}
                      </div>
                      <div className="font-medium text-gray-800">
                        {attendance.student?.firstname} {attendance.student?.lastname}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                      {getStatusText(attendance.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="ยังไม่มีการบันทึกการเข้าเรียน"
                description="เริ่มต้นเช็คชื่อนักเรียนในห้องเรียนนี้"
                action={{
                  label: "เช็คชื่อ",
                  onClick: () => router.push(`/attendance?classroom=${classroomId}`)
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}