'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { attendanceService, classroomService, studentService, statsService, teacherInfoService } from '@/services/apiService';
import { Attendance, Classroom, Student, AttendanceStats } from '@/types/entities';

interface ClassroomReport {
  classroom: Classroom;
  totalStudents: number;
  attendanceData: Attendance[];
  stats: AttendanceStats;
}

export default function ReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });
  const [reportData, setReportData] = useState<ClassroomReport | null>(null);
  const [overallStats, setOverallStats] = useState<AttendanceStats | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'classroom' | 'student'>('overview');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Get teacher-specific data from teacher info
      const teacherInfo = await teacherInfoService.getTeacherInfo();
      const teacherClassrooms = teacherInfo.classrooms || [];
      
      const [studentsData, attendancesData] = await Promise.all([
        studentService.getMyStudents(), // Get teacher's students only
        attendanceService.getMyAttendances() // Get teacher's attendances only
      ]);
      
      // Use teacher's classrooms if available, otherwise try getMyClassrooms, then fallback to all classrooms
      let classroomsData = teacherClassrooms;
      if (classroomsData.length === 0) {
        try {
          classroomsData = await classroomService.getMyClassrooms();
        } catch (error) {
          console.error('getMyClassrooms failed, using getAllClassrooms:', error);
          classroomsData = await classroomService.getAllClassrooms();
        }
      }
      
      setClassrooms(classroomsData);
      setStudents(studentsData);
      setAttendances(attendancesData);
      
      // Calculate overall stats
      const filteredAttendances = attendancesData.filter(att => 
        att.attendance_date >= dateRange.startDate && att.attendance_date <= dateRange.endDate
      );
      const stats = statsService.calculateAttendanceStats(filteredAttendances);
      setOverallStats(stats);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = () => {
    loadData();
  };

  const generateClassroomReport = async (classroom: Classroom) => {
    try {
      setIsLoading(true);
      const classroomAttendances = await attendanceService.getAttendancesByClassroom(classroom.id);
      
      // Filter by date range
      const filteredAttendances = (classroomAttendances || []).filter(att => 
        att.attendance_date >= dateRange.startDate && att.attendance_date <= dateRange.endDate
      );
      
      // Get classroom students count (you might need to implement this)
      const classroomStudents = (students || []).filter(student => 
        filteredAttendances.some(att => att.student_id === student.id)
      );
      
      const stats = statsService.calculateAttendanceStats(filteredAttendances);
      
      const report: ClassroomReport = {
        classroom,
        totalStudents: classroomStudents.length,
        attendanceData: filteredAttendances,
        stats
      };
      
      setReportData(report);
      setSelectedClassroom(classroom);
      setViewMode('classroom');
    } catch (error) {
      console.error('Error generating classroom report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceByDate = () => {
    const dateMap = new Map<string, { present: number; absent: number; late: number; excused: number }>();
    
    const filteredAttendances = (attendances || []).filter(att => 
      att.attendance_date >= dateRange.startDate && att.attendance_date <= dateRange.endDate
    );
    
    filteredAttendances.forEach(att => {
      const date = att.attendance_date.split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, { present: 0, absent: 0, late: 0, excused: 0 });
      }
      const dayStats = dateMap.get(date)!;
      dayStats[att.status]++;
    });
    
    return Array.from(dateMap.entries()).map(([date, stats]) => ({
      date,
      ...stats,
      total: stats.present + stats.absent + stats.late + stats.excused,
      rate: (stats.present + stats.absent + stats.late + stats.excused) > 0 ? Math.round((stats.present / (stats.present + stats.absent + stats.late + stats.excused)) * 100) : 0
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getStudentAttendanceReport = () => {
    const studentMap = new Map<number, { student: Student; attendances: Attendance[] }>();
    
    const filteredAttendances = (attendances || []).filter(att => 
      att.attendance_date >= dateRange.startDate && att.attendance_date <= dateRange.endDate
    );
    
    filteredAttendances.forEach(att => {
      if (!studentMap.has(att.student_id)) {
        const student = (students || []).find(s => s.id === att.student_id);
        if (student) {
          studentMap.set(att.student_id, { student, attendances: [] });
        }
      }
      studentMap.get(att.student_id)?.attendances.push(att);
    });
    
    return Array.from(studentMap.values()).map(({ student, attendances }) => {
      const stats = statsService.calculateAttendanceStats(attendances);
      return {
        student,
        attendances,
        stats: {
          ...stats,
          total_days: attendances.length
        }
      };
    }).sort((a, b) => b.stats.attendance_rate - a.stats.attendance_rate);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">รายงานการเข้าเรียน</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('overview')}
                className={`py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  viewMode === 'overview' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                ภาพรวม
              </button>
              <button
                onClick={() => setViewMode('student')}
                className={`py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  viewMode === 'student' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                รายนักเรียน
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Date Range Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleDateRangeChange}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                อัปเดตรายงาน
              </button>
            </div>
          </div>
        </div>

        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Overall Stats */}
            {overallStats && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">สถิติรวม</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{overallStats.present_count}</div>
                    <div className="text-sm text-gray-600">มาเรียน</div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
                    <div className="text-2xl font-bold text-red-600">{overallStats.absent_count}</div>
                    <div className="text-sm text-gray-600">ขาดเรียน</div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">{overallStats.late_count}</div>
                    <div className="text-sm text-gray-600">มาสาย</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{overallStats.attendance_rate}%</div>
                    <div className="text-sm text-gray-600">อัตราเข้าเรียน</div>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Attendance Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">การเข้าเรียนรายวัน</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {getAttendanceByDate().map((dayData) => (
                  <div key={dayData.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="font-medium text-gray-800">
                        {new Date(dayData.date).toLocaleDateString('th-TH')}
                      </div>
                      <div className="text-sm text-gray-600">
                        รวม {dayData.total} คน
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">{dayData.present}</span> /
                        <span className="text-red-600 font-medium">{dayData.absent}</span> /
                        <span className="text-yellow-600 font-medium">{dayData.late}</span>
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        {dayData.rate}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Classroom Reports */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">รายงานตามห้องเรียน</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(classrooms || []).map((classroom) => {
                  const classroomAttendances = (attendances || []).filter(att => 
                    att.classroom_id === classroom.id &&
                    att.attendance_date >= dateRange.startDate && 
                    att.attendance_date <= dateRange.endDate
                  );
                  const stats = statsService.calculateAttendanceStats(classroomAttendances);
                  
                  return (
                    <div key={classroom.id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800">{classroom.name}</h3>
                        <button
                          onClick={() => generateClassroomReport(classroom)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">อัตราเข้าเรียน:</span>
                          <span className="font-medium">{stats.attendance_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">มาเรียน:</span>
                          <span className="text-green-600 font-medium">{stats.present_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ขาดเรียน:</span>
                          <span className="text-red-600 font-medium">{stats.absent_count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Student Mode */}
        {viewMode === 'student' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">รายงานการเข้าเรียนรายนักเรียน</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-700">นักเรียน</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">วันที่บันทึก</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">มาเรียน</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">ขาดเรียน</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">มาสาย</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">ลาป่วย</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">อัตราเข้าเรียน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getStudentAttendanceReport().map(({ student, stats }) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-800">
                            {student.firstname} {student.lastname}
                          </div>
                          <div className="text-sm text-gray-600">{student.student_id}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{stats.total_days || 0}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-medium">{stats.present_count}</td>
                      <td className="px-4 py-3 text-center text-red-600 font-medium">{stats.absent_count}</td>
                      <td className="px-4 py-3 text-center text-yellow-600 font-medium">{stats.late_count}</td>
                      <td className="px-4 py-3 text-center text-blue-600 font-medium">{stats.excused_count}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          stats.attendance_rate >= 80 
                            ? 'bg-green-100 text-green-800' 
                            : stats.attendance_rate >= 60 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {stats.attendance_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getStudentAttendanceReport().length === 0 && (
                <div className="text-center py-8 text-gray-500">ไม่มีข้อมูลการเข้าเรียนในช่วงเวลาที่เลือก</div>
              )}
            </div>
          </div>
        )}

        {/* Classroom Report Detail */}
        {viewMode === 'classroom' && reportData && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                รายงาน {reportData.classroom.name}
              </h2>
              <button
                onClick={() => setViewMode('overview')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                กลับไปภาพรวม
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                <div className="text-2xl font-bold text-green-600">{reportData.stats.present_count}</div>
                <div className="text-sm text-gray-600">มาเรียน</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
                <div className="text-2xl font-bold text-red-600">{reportData.stats.absent_count}</div>
                <div className="text-sm text-gray-600">ขาดเรียน</div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{reportData.stats.late_count}</div>
                <div className="text-sm text-gray-600">มาสาย</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{reportData.stats.attendance_rate}%</div>
                <div className="text-sm text-gray-600">อัตราเข้าเรียน</div>
              </div>
            </div>

            {/* Detailed attendance list */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-700">วันที่</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">นักเรียน</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">สถานะ</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">เวลา</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.attendanceData
                    .sort((a, b) => new Date(b.attendance_date).getTime() - new Date(a.attendance_date).getTime())
                    .map((attendance) => {
                      const student = (students || []).find(s => s.id === attendance.student_id);
                      return (
                        <tr key={attendance.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {new Date(attendance.attendance_date).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-4 py-3">
                            {student ? `${student.firstname} ${student.lastname}` : 'ไม่พบข้อมูล'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                              attendance.status === 'absent' ? 'bg-red-100 text-red-800' :
                              attendance.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {attendance.status === 'present' ? 'มาเรียน' :
                               attendance.status === 'absent' ? 'ขาดเรียน' :
                               attendance.status === 'late' ? 'มาสาย' : 'ลาป่วย'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {attendance.check_in_time ? 
                              new Date(attendance.check_in_time).toLocaleTimeString('th-TH') : 
                              '-'
                            }
                          </td>
                          <td className="px-4 py-3">{attendance.notes || '-'}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}