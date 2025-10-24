'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authService } from '@/services/authService';
import { schoolService, studentService, classroomService } from '@/services/apiService';
import { School, Student, Classroom } from '@/types/entities';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';

export default function SchoolDetailPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = parseInt(params.id as string);
  const { showToast, ToastContainer } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [school, setSchool] = useState<School | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClassrooms: 0,
    totalTeachers: 1 // Mock data shows 1 teacher
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadSchoolData();
  }, [router, schoolId]);

  const loadSchoolData = async () => {
    try {
      setIsLoading(true);
      
      const [schoolData, studentsData, classroomsData] = await Promise.all([
        schoolService.getSchoolById(schoolId),
        studentService.getAllStudents(), // Filter by school_id in real implementation
        classroomService.getAllClassrooms() // Filter by school_id in real implementation
      ]);

      setSchool(schoolData);
      
      // Filter by school_id (in real implementation, this would be done in the API)
      const schoolStudents = studentsData.filter(student => student.school_id === schoolId);
      const schoolClassrooms = classroomsData.filter(classroom => classroom.school_id === schoolId);
      
      setStudents(schoolStudents);
      setClassrooms(schoolClassrooms);

      setStats({
        totalStudents: schoolStudents.length,
        totalClassrooms: schoolClassrooms.length,
        totalTeachers: 1 // Mock data
      });

    } catch (error) {
      console.error('Error loading school data:', error);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen={true} message="กำลังโหลดข้อมูลโรงเรียน..." />;
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <EmptyState
          title="ไม่พบโรงเรียน"
          description="โรงเรียนที่คุณต้องการดูไม่มีอยู่ในระบบ"
          action={{
            label: "กลับไปหน้าโรงเรียน",
            onClick: () => router.push('/schools')
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
                onClick={() => router.push('/schools')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{school.name}</h1>
            </div>
            <button
              onClick={() => router.push(`/schools/edit/${school.id}`)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              แก้ไข
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* School Info Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl flex items-center justify-center">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">{school.name}</h2>
                <p className="text-gray-600 mt-1">รหัสโรงเรียน: {school.id}</p>
                <p className="text-sm text-gray-500">สร้างเมื่อ: {new Date(school.created_at).toLocaleDateString('th-TH')}</p>
              </div>
            </div>
          </div>

          {/* School Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">ข้อมูลทั่วไป</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ชื่อโรงเรียน:</span>
                    <span className="font-medium">{school.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">สถานะ:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">ใช้งาน</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">ข้อมูลติดต่อ</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ที่อยู่:</span>
                    <span className="font-medium text-right">ไม่ระบุ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">โทรศัพท์:</span>
                    <span className="font-medium">ไม่ระบุ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">อีเมล:</span>
                    <span className="font-medium">ไม่ระบุ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalStudents}</div>
              <div className="text-blue-600 font-medium">นักเรียนทั้งหมด</div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.totalClassrooms}</div>
              <div className="text-green-600 font-medium">ห้องเรียนทั้งหมด</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.totalTeachers}</div>
              <div className="text-purple-600 font-medium">ครูทั้งหมด</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Classrooms */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">ห้องเรียน</h3>
              <span className="text-sm text-gray-500">{classrooms.length} ห้อง</span>
            </div>

            {classrooms.length > 0 ? (
              <div className="space-y-3">
                {classrooms.slice(0, 5).map((classroom) => (
                  <div key={classroom.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{classroom.name}</div>
                        <div className="text-sm text-gray-600">{classroom.description || 'ไม่มีคำอธิบาย'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/classrooms/${classroom.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      ดู →
                    </button>
                  </div>
                ))}
                {classrooms.length > 5 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => router.push('/classrooms')}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      ดูทั้งหมด ({classrooms.length} ห้อง) →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="ยังไม่มีห้องเรียน"
                description="ยังไม่มีห้องเรียนในโรงเรียนนี้"
                action={{
                  label: "เพิ่มห้องเรียน",
                  onClick: () => router.push('/classrooms')
                }}
              />
            )}
          </div>

          {/* Recent Students */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">นักเรียน</h3>
              <span className="text-sm text-gray-500">{students.length} คน</span>
            </div>

            {students.length > 0 ? (
              <div className="space-y-3">
                {students.slice(0, 8).map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs">
                          {student.firstname?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">
                          {student.prefix?.name || ''}{student.firstname} {student.lastname}
                        </div>
                        <div className="text-xs text-gray-600">
                          {student.grade_level}/{student.class_section} | {student.student_id}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {students.length > 8 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => router.push('/students')}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      ดูทั้งหมด ({students.length} คน) →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="ยังไม่มีนักเรียน"
                description="ยังไม่มีนักเรียนในโรงเรียนนี้"
                action={{
                  label: "เพิ่มนักเรียน",
                  onClick: () => router.push('/students')
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}