'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { classroomService, classroomMemberService, studentService, teacherInfoService } from '@/services/apiService';
import { Classroom, ClassroomMember, Student, CreateClassroomRequest } from '@/types/entities';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/components/Toast';

export default function ClassroomsPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [classroomMembers, setClassroomMembers] = useState<ClassroomMember[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [formData, setFormData] = useState<CreateClassroomRequest>({
    school_id: 0,
    name: '',
    description: '',
    grade_level: '',
    class_section: '',
    subject: ''
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    loadData();
  }, [router]);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userInfo = await teacherInfoService.getTeacherInfo();
        setCurrentUser(userInfo);
        
        // Update form data with school_id
        setFormData(prev => ({
          ...prev,
          school_id: userInfo.school_id
        }));
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    };
    
    if (authService.isAuthenticated()) {
      loadUserInfo();
    }
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Get teacher-specific data from teacher info
      const teacherInfo = await teacherInfoService.getTeacherInfo();
      const teacherClassrooms = teacherInfo.classrooms || [];
      
      // Get students (teacher-specific)
      const studentsData = await studentService.getMyStudents();
      
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
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClassroomMembers = async (classroomId: number) => {
    try {
      const members = await classroomMemberService.getClassroomMembersByClassroomId(classroomId);
      setClassroomMembers(members);
      
      // Get students who are not members of this classroom
      const memberStudentIds = (members || []).map(m => m.member_id);
      const available = (students || []).filter(s => !memberStudentIds.includes(s.id));
      setAvailableStudents(available);
    } catch (error) {
      console.error('Error loading classroom members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClassroom) {
        await classroomService.updateClassroom(editingClassroom.id, formData);
      } else {
        await classroomService.createClassroom(formData);
      }
      
      setShowModal(false);
      setEditingClassroom(null);
      resetForm();
      loadData();
      showToast(editingClassroom ? 'แก้ไขห้องเรียนสำเร็จ' : 'เพิ่มห้องเรียนสำเร็จ', 'success');
    } catch (error) {
      console.error('Error saving classroom:', error);
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    }
  };

  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setFormData({
      school_id: currentUser?.school_id || 0,
      name: classroom.name,
      description: classroom.description || '',
      grade_level: classroom.grade_level || '',
      class_section: classroom.class_section || '',
      subject: classroom.subject || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบห้องเรียนนี้?')) {
      try {
        await classroomService.deleteClassroom(id);
        loadData();
        showToast('ลบห้องเรียนสำเร็จ', 'success');
      } catch (error) {
        console.error('Error deleting classroom:', error);
        showToast('เกิดข้อผิดพลาดในการลบห้องเรียน', 'error');
      }
    }
  };

  const handleViewMembers = async (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    await loadClassroomMembers(classroom.id);
    setShowMembersModal(true);
  };

  const handleAddMember = async (studentId: number) => {
    if (!selectedClassroom) return;
    
    try {
      await classroomMemberService.addMemberToClassroom(selectedClassroom.id, studentId);
      await loadClassroomMembers(selectedClassroom.id);
      showToast('เพิ่มนักเรียนเข้าห้องเรียนสำเร็จ', 'success');
    } catch (error) {
      console.error('Error adding member:', error);
      showToast('เกิดข้อผิดพลาดในการเพิ่มนักเรียน', 'error');
    }
  };

  const handleRemoveMember = async (studentId: number) => {
    if (!selectedClassroom) return;
    
    try {
      await classroomMemberService.removeMemberFromClassroom(selectedClassroom.id, studentId);
      await loadClassroomMembers(selectedClassroom.id);
      showToast('ลบนักเรียนออกจากห้องเรียนสำเร็จ', 'success');
    } catch (error) {
      console.error('Error removing member:', error);
      showToast('เกิดข้อผิดพลาดในการลบนักเรียน', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      school_id: currentUser?.school_id || 0,
      name: '',
      description: '',
      grade_level: '',
      class_section: '',
      subject: ''
    });
  };

  const filteredClassrooms = (classrooms || []).filter(classroom =>
    classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (classroom.subject && classroom.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen={true} message="กำลังโหลดข้อมูลห้องเรียน..." />;
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">จัดการห้องเรียน</h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              + สร้างห้องเรียน
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="ค้นหาห้องเรียน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
            />
          </div>
        </div>

        {/* Classrooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((classroom) => (
            <div key={classroom.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{classroom.name}</h3>
                    <p className="text-sm text-gray-600">
                      {classroom.grade_level && classroom.class_section ? 
                        `${classroom.grade_level}/${classroom.class_section}` : 
                        'ไม่ระบุชั้นเรียน'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(classroom)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(classroom.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                {classroom.subject && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">วิชา:</span>
                    <span className="font-medium">{classroom.subject}</span>
                  </div>
                )}
                {classroom.description && (
                  <div>
                    <span className="text-gray-600">รายละเอียด:</span>
                    <p className="text-gray-800 mt-1">{classroom.description}</p>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">สมาชิก:</span>
                  <span className="font-medium">{classroom.member_count || 0} คน</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/classrooms/${classroom.id}`)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  ดูรายละเอียด
                </button>
                <button
                  onClick={() => handleViewMembers(classroom)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  จัดการสมาชิก
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredClassrooms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏫</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">ไม่พบห้องเรียน</h3>
            <p className="text-gray-500">ลองค้นหาด้วยคำอื่น หรือสร้างห้องเรียนใหม่</p>
          </div>
        )}
      </div>

      {/* Create/Edit Classroom Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingClassroom ? 'แก้ไขห้องเรียน' : 'สร้างห้องเรียนใหม่'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingClassroom(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อห้องเรียน/วิชา</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียด</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">วิชาที่สอน</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ชั้นเรียน</label>
                    <input
                      type="text"
                      placeholder="เช่น ม.1, ป.1"
                      value={formData.grade_level}
                      onChange={(e) => setFormData({...formData, grade_level: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ห้อง</label>
                    <input
                      type="text"
                      placeholder="เช่น 1/1, 2/3"
                      value={formData.class_section}
                      onChange={(e) => setFormData({...formData, class_section: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingClassroom(null);
                      resetForm();
                    }}
                    className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
                  >
                    {editingClassroom ? 'บันทึก' : 'สร้าง'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Members Management Modal */}
      {showMembersModal && selectedClassroom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  จัดการสมาชิก - {selectedClassroom.name}
                </h2>
                <button
                  onClick={() => {
                    setShowMembersModal(false);
                    setSelectedClassroom(null);
                    setClassroomMembers([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Members */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">สมาชิกในห้องเรียน ({classroomMembers.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(classroomMembers || []).map((member) => {
                      const student = (students || []).find(s => s.id === member.member_id);
                      if (!student) return null;
                      
                      return (
                        <div key={member.member_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {student.firstname.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{student.firstname} {student.lastname}</p>
                              <p className="text-sm text-gray-600">{student.student_id}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveMember(student.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                    {classroomMembers.length === 0 && (
                      <p className="text-center text-gray-500 py-8">ยังไม่มีสมาชิกในห้องเรียนนี้</p>
                    )}
                  </div>
                </div>

                {/* Available Students */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">นักเรียนที่สามารถเพิ่มได้ ({availableStudents.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(availableStudents || []).map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {student.firstname.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{student.firstname} {student.lastname}</p>
                            <p className="text-sm text-gray-600">{student.student_id}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddMember(student.id)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {availableStudents.length === 0 && (
                      <p className="text-center text-gray-500 py-8">ไม่มีนักเรียนที่เพิ่มได้แล้ว</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}