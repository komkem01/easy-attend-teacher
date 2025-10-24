'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { attendanceService, classroomService, classroomMemberService, studentService, teacherInfoService } from '@/services/apiService';
import { Attendance, Classroom, ClassroomMember, Student, CreateAttendanceRequest } from '@/types/entities';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/components/Toast';

interface AttendanceRecord {
  student: Student;
  status: 'present' | 'absent' | 'late' | 'excused' | 'pending';
  notes?: string;
}

export default function AttendancePage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
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

      // Initialize attendance records with "รอเช็คชื่อ" as default
      const records: AttendanceRecord[] = (classroomStudents || []).map(student => {
        const existingRecord = (todayAttendance || []).find(att => att.student_id === student.id);
        return {
          student,
          status: existingRecord?.status || 'pending', // Change default to 'pending'
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

  const handleStatusChange = (studentId: number, status: 'present' | 'absent' | 'late' | 'excused' | 'pending') => {
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
        // Skip saving records with 'pending' status
        if (record.status === 'pending') {
          continue;
        }

        const attendanceData: CreateAttendanceRequest = {
          classroom_id: selectedClassroom.id,
          student_id: record.student.id,
          attendance_date: attendanceDate,
          status: record.status as 'present' | 'absent' | 'late' | 'excused',
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

      showToast('บันทึกการเข้าเรียนสำเร็จ!', 'success');
      
      // Reload to get updated data
      if (selectedClassroom) {
        loadClassroomStudents(selectedClassroom);
      }
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
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
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'มาเรียน';
      case 'absent': return 'ขาดเรียน';
      case 'late': return 'มาสาย';
      case 'excused': return 'ลาป่วย';
      case 'pending': return 'รอเช็คชื่อ';
      default: return status;
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen={true} message="กำลังโหลดข้อมูลการเข้าเรียน..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <ToastContainer />
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-blue-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-3 sm:space-y-0 sm:h-20">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 hover:text-blue-800 transition-colors p-2 -ml-2 rounded-lg hover:bg-blue-50"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">บันทึกการเข้าเรียน</h1>
            </div>
            <div className="flex flex-wrap gap-2 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={() => router.push('/reports')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md text-sm"
              >
                ดูรายงาน
              </button>
              {selectedClassroom && (
                <button
                  onClick={loadAttendanceHistory}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md text-sm"
                >
                  ดูประวัติ
                </button>
              )}
              {attendanceRecords.length > 0 && attendanceRecords.some(r => r.status !== 'pending') && (
                <button
                  onClick={handleSaveAttendance}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50 text-sm"
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-4 md:p-6 mb-6">
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 leading-relaxed">เลือกห้องเรียน</label>
              <select
                value={selectedClassroom?.id || ''}
                onChange={(e) => handleClassroomChange(e.target.value)}
                className="w-full px-4 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 bg-white shadow-sm leading-relaxed"
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
              <label className="block text-sm font-medium text-gray-700 mb-3 leading-relaxed">วันที่</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => {
                  setAttendanceDate(e.target.value);
                  if (selectedClassroom) {
                    loadClassroomStudents(selectedClassroom);
                  }
                }}
                className="w-full px-4 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 bg-white shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Attendance List */}
        {selectedClassroom && attendanceRecords.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 leading-relaxed">
                {selectedClassroom.name} - {new Date(attendanceDate).toLocaleDateString('th-TH')}
              </h2>
              <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                จำนวนนักเรียน: {attendanceRecords.length} คน
              </div>
            </div>

            {/* iPad-optimized attendance list */}
            <div className="space-y-3 md:space-y-4">
              {(attendanceRecords || []).map((record) => (
                <div key={record.student.id} className="bg-gray-50/70 rounded-xl p-3 md:p-4 hover:bg-white/80 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="h-12 w-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">
                          {record.student.firstname.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-800 text-base md:text-lg leading-relaxed truncate">
                          {record.student.firstname} {record.student.lastname}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">รหัส: {record.student.student_id}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-2 rounded-full text-sm font-medium border shrink-0 ${getStatusColor(record.status)}`}>
                      {getStatusText(record.status)}
                    </div>
                  </div>
                  
                  {/* Status buttons - improved layout for iPad */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    {['pending', 'present', 'absent', 'late', 'excused'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(record.student.id, status as any)}
                        className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-sm ${
                          record.status === status
                            ? getStatusColor(status) + ' ring-2 ring-offset-2 ring-blue-400 shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:shadow-md'
                        }`}
                      >
                        {getStatusText(status)}
                      </button>
                    ))}
                  </div>
                  
                  {/* Notes input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
                    <textarea
                      placeholder="เพิ่มหมายเหตุ (ถ้ามี)..."
                      value={record.notes}
                      onChange={(e) => handleNotesChange(record.student.id, e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-sm leading-relaxed resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              {['pending', 'present', 'absent', 'late', 'excused'].map((status) => {
                const count = (attendanceRecords || []).filter(r => r.status === status).length;
                return (
                  <div key={status} className={`rounded-xl p-4 text-center shadow-sm ${getStatusColor(status)}`}>
                    <div className="text-2xl font-bold mb-1">{count}</div>
                    <div className="text-sm font-medium leading-relaxed">{getStatusText(status)}</div>
                  </div>
                );
              })}
            </div>

            {/* Save button reminder */}
            {attendanceRecords.some(r => r.status !== 'pending') && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-800 text-sm font-medium">มีการเปลี่ยนแปลงการเช็คชื่อ</span>
                  </div>
                  <button
                    onClick={handleSaveAttendance}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'กำลังบันทึก...' : 'บันทึกเลย'}
                  </button>
                </div>
              </div>
            )}
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