'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { attendanceService, classroomService, classroomMemberService, studentService, teacherInfoService } from '@/services/apiService';
import { Attendance, Classroom, ClassroomMember, Student, CreateAttendanceRequest } from '@/types/entities';

interface AttendanceRecord {
  student: Student;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export default function AttendancePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [existingAttendance, setExistingAttendance] = useState<Attendance[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<Attendance[]>([]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    loadClassrooms();
  }, [router]);

  const loadClassrooms = async () => {
    try {
      setIsLoading(true);
      
      // Get teacher-specific classrooms from teacher info
      const teacherInfo = await teacherInfoService.getTeacherInfo();
      const teacherClassrooms = teacherInfo.classrooms || [];
      
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
    } catch (error) {
      console.error('Error loading classrooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClassroomStudents = async (classroom: Classroom) => {
    try {
      setIsLoading(true);
      const [members, myStudents] = await Promise.all([
        classroomMemberService.getClassroomMembersByClassroomId(classroom.id),
        studentService.getMyStudents() // Get teacher's students only
      ]);

      const classroomStudents = members
        .map(member => (myStudents || []).find(student => student.id === member.member_id))
        .filter(student => student !== undefined) as Student[];

      setStudents(classroomStudents);
      
      // Check for existing attendance on selected date
      const existing = await attendanceService.getAttendancesByClassroom(classroom.id);
      const todayAttendance = existing.filter(att => 
        att.attendance_date?.split('T')[0] === attendanceDate
      );
      setExistingAttendance(todayAttendance);

      // Initialize attendance records
      const records: AttendanceRecord[] = (classroomStudents || []).map(student => {
        const existingRecord = (todayAttendance || []).find(att => att.student_id === student.id);
        return {
          student,
          status: existingRecord?.status || 'present',
          notes: existingRecord?.notes || ''
        };
      });
      
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error loading classroom students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassroomChange = (classroomId: string) => {
    const classroom = (classrooms || []).find(c => c.id === parseInt(classroomId));
    if (classroom) {
      setSelectedClassroom(classroom);
      loadClassroomStudents(classroom);
    }
  };

  const handleStatusChange = (studentId: number, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.student.id === studentId 
          ? { ...record, status }
          : record
      )
    );
  };

  const handleNotesChange = (studentId: number, notes: string) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.student.id === studentId 
          ? { ...record, notes }
          : record
      )
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassroom) return;

    try {
      setIsSaving(true);
      
      for (const record of attendanceRecords) {
        const attendanceData: CreateAttendanceRequest = {
          classroom_id: selectedClassroom.id,
          student_id: record.student.id,
          attendance_date: attendanceDate,
          status: record.status,
          check_in_time: new Date().toISOString(),
          notes: record.notes
        };

        // Check if attendance already exists for this student on this date
        const existing = (existingAttendance || []).find(att => att.student_id === record.student.id);
        
        if (existing) {
          // Update existing attendance
          await attendanceService.updateAttendance(existing.id, attendanceData);
        } else {
          // Create new attendance
          await attendanceService.createAttendance(attendanceData);
        }
      }

      alert('บันทึกการเข้าเรียนสำเร็จ!');
      
      // Reload to get updated data
      if (selectedClassroom) {
        loadClassroomStudents(selectedClassroom);
      }
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  const loadAttendanceHistory = async () => {
    if (!selectedClassroom) return;

    try {
      const history = await attendanceService.getAttendancesByClassroom(selectedClassroom.id);
      setHistoryData(history);
      setShowHistory(true);
    } catch (error) {
      console.error('Error loading attendance history:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">บันทึกการเข้าเรียน</h1>
            </div>
            <div className="flex space-x-3">
              {selectedClassroom && (
                <button
                  onClick={loadAttendanceHistory}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  ดูประวัติ
                </button>
              )}
              {attendanceRecords.length > 0 && (
                <button
                  onClick={handleSaveAttendance}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเข้าเรียน'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Selection Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เลือกห้องเรียน</label>
              <select
                value={selectedClassroom?.id || ''}
                onChange={(e) => handleClassroomChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
              >
                <option value="">เลือกห้องเรียน</option>
                {(classrooms || []).map(classroom => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name} {classroom.grade_level && classroom.class_section ? 
                      `(${classroom.grade_level}/${classroom.class_section})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันที่</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => {
                  setAttendanceDate(e.target.value);
                  if (selectedClassroom) {
                    loadClassroomStudents(selectedClassroom);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Attendance List */}
        {selectedClassroom && attendanceRecords.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedClassroom.name} - {new Date(attendanceDate).toLocaleDateString('th-TH')}
              </h2>
              <div className="text-sm text-gray-600">
                จำนวนนักเรียน: {attendanceRecords.length} คน
              </div>
            </div>

            <div className="space-y-4">
              {(attendanceRecords || []).map((record) => (
                <div key={record.student.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {record.student.firstname.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {record.student.firstname} {record.student.lastname}
                        </h3>
                        <p className="text-sm text-gray-600">รหัส: {record.student.student_id}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(record.status)}`}>
                      {getStatusText(record.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    {['present', 'absent', 'late', 'excused'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(record.student.id, status as any)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          record.status === status
                            ? getStatusColor(status) + ' ring-2 ring-offset-2 ring-blue-400'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {getStatusText(status)}
                      </button>
                    ))}
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      placeholder="หมายเหตุ (ถ้ามี)"
                      value={record.notes}
                      onChange={(e) => handleNotesChange(record.student.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {['present', 'absent', 'late', 'excused'].map((status) => {
                const count = (attendanceRecords || []).filter(r => r.status === status).length;
                return (
                  <div key={status} className={`rounded-xl p-4 text-center ${getStatusColor(status)}`}>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm">{getStatusText(status)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedClassroom && attendanceRecords.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">ไม่พบนักเรียนในห้องเรียนนี้</h3>
            <p className="text-gray-500">กรุณาเพิ่มนักเรียนในห้องเรียนก่อน</p>
          </div>
        )}

        {!selectedClassroom && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">เลือกห้องเรียนเพื่อเริ่มบันทึกการเข้าเรียน</h3>
            <p className="text-gray-500">เลือกห้องเรียนและวันที่ด้านบน</p>
          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  ประวัติการเข้าเรียน - {selectedClassroom?.name}
                </h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium text-gray-700">วันที่</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">นักเรียน</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">สถานะ</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">เวลา</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(historyData || []).map((attendance) => {
                      const student = (students || []).find(s => s.id === attendance.student_id);
                      return (
                        <tr key={attendance.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {new Date(attendance.attendance_date).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-4 py-3">
                            {student ? `${student.firstname} ${student.lastname}` : 'ไม่พบข้อมูล'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                              {getStatusText(attendance.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
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
                {historyData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">ไม่มีข้อมูลประวัติการเข้าเรียน</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}