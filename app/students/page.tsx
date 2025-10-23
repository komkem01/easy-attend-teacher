'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { studentService, genderService, prefixService, teacherInfoService, classroomService, classroomMemberService } from '@/services/apiService';
import { Student, Gender, Prefix, Classroom, CreateStudentRequest, UpdateStudentRequest } from '@/types/entities';

export default function StudentsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [prefixes, setPrefixes] = useState<Prefix[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedClassroomForAdd, setSelectedClassroomForAdd] = useState<number>(0);
  
  const [formData, setFormData] = useState<CreateStudentRequest>({
    school_id: 0,
    student_no: '', // Optional field
    firstname: '',
    lastname: '',
    gender_id: null,
    prefix_id: null,
    grade_level: '',
    class_section: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      // ดึงข้อมูลครูจาก /teacher/info
      try {
        const teacherInfo = await teacherInfoService.getTeacherInfo();
        setCurrentUser(teacherInfo);
        await loadData();
      } catch (error) {
        console.error('Error getting teacher info:', error);
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [studentsData, gendersData, prefixesData, classroomsData] = await Promise.all([
        studentService.getMyStudents(), // เปลี่ยนเป็นดึงเฉพาะนักเรียนของครูคนนี้
        genderService.getAllGenders(),
        prefixService.getAllPrefixes(),
        classroomService.getAllClassrooms()
      ]);
      setStudents(studentsData);
      setGenders(gendersData);
      setPrefixes(prefixesData);
      setClassrooms(classroomsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        // For update, use UpdateStudentRequest structure
        const updateData: UpdateStudentRequest = {
          school_id: currentUser?.school_id || 0,
          student_no: formData.student_no || editingStudent.student_id,
          firstname: formData.firstname,
          lastname: formData.lastname,
          gender_id: formData.gender_id,
          prefix_id: formData.prefix_id,
          grade_level: formData.grade_level,
          class_section: formData.class_section
        };
        await studentService.updateStudent(editingStudent.id, updateData);
      } else {
        // For create, use CreateStudentRequest structure
        const createData: CreateStudentRequest = {
          school_id: currentUser?.school_id || 0,
          student_no: formData.student_no,
          firstname: formData.firstname,
          lastname: formData.lastname,
          gender_id: formData.gender_id,
          prefix_id: formData.prefix_id,
          grade_level: formData.grade_level,
          class_section: formData.class_section
        };
        
        const newStudent = await studentService.createStudent(createData);
        
        // หากเลือกห้องเรียน ให้เพิ่มนักเรียนเข้าห้องเรียนด้วย
        if (selectedClassroomForAdd > 0) {
          await classroomMemberService.addMemberToClassroom(selectedClassroomForAdd, newStudent.id);
        }
      }
      await loadData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      school_id: currentUser?.school_id || 0,
      student_no: student.student_id,
      firstname: student.firstname,
      lastname: student.lastname,
      gender_id: student.gender_id || null,
      prefix_id: student.prefix_id || null,
      grade_level: student.grade_level || '',
      class_section: student.class_section || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('คุณต้องการลบนักเรียนคนนี้หรือไม่?')) {
      try {
        await studentService.deleteStudent(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingStudent(null);
    setFormData({
      school_id: currentUser?.school_id || 0,
      student_no: '',
      firstname: '',
      lastname: '',
      gender_id: null,
      prefix_id: null,
      grade_level: '',
      class_section: ''
    });
    setSelectedClassroomForAdd(0);
  };

  const filteredStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    if (!searchTerm) return students;
    
    const searchLower = searchTerm.toLowerCase();
    return students.filter((student) => {
      if (!student) return false;
      const firstname = student.firstname ? student.firstname.toLowerCase() : '';
      const lastname = student.lastname ? student.lastname.toLowerCase() : '';
      const studentId = student.student_id ? student.student_id.toLowerCase() : '';
      
      return firstname.includes(searchLower) || 
             lastname.includes(searchLower) || 
             studentId.includes(searchLower);
    });
  }, [students, searchTerm]);

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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">จัดการนักเรียน</h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              + เพิ่มนักเรียน
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Teacher Info */}
        {currentUser && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  ครู: {currentUser.firstname} {currentUser.lastname}
                </h2>
                <p className="text-gray-600">โรงเรียน: {currentUser.school_name || 'ไม่ระบุ'}</p>
                <p className="text-sm text-gray-500">จำนวนนักเรียนทั้งหมด: {students.length} คน</p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="ค้นหานักเรียน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
            />
          </div>
        </div>

        {/* Students List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {student.firstname?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {(prefixes || []).find(p => p.id === student.prefix_id)?.name || ''}{student.firstname || ''} {student.lastname || ''}
                    </h3>
                    <p className="text-sm text-gray-600">รหัส: {student.student_id || 'ไม่ระบุ'}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(student)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(student.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">เพศ:</span>
                  <span className="font-medium">{(genders || []).find(g => g.id === student.gender_id)?.name || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">คำนำหน้า:</span>
                  <span className="font-medium">{(prefixes || []).find(p => p.id === student.prefix_id)?.name || 'ไม่ระบุ'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👨‍🎓</div>
            <p className="text-gray-500 text-lg">ไม่พบนักเรียน</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingStudent ? 'แก้ไขนักเรียน' : 'เพิ่มนักเรียน'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ระดับชั้น</label>
                  <input
                    type="text"
                    required
                    value={formData.grade_level}
                    onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="เช่น ม.1, ป.6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ห้อง</label>
                  <input
                    type="text"
                    required
                    value={formData.class_section}
                    onChange={(e) => setFormData({ ...formData, class_section: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="เช่น 1, 2, A, B"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">เลือกห้องเรียนที่จะเพิ่มนักเรียน</label>
                  <select
                    value={selectedClassroomForAdd}
                    onChange={(e) => setSelectedClassroomForAdd(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value={0}>-- เลือกห้องเรียน --</option>
                    {(classrooms || []).map(classroom => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.grade_level}/{classroom.class_section} - {classroom.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">รหัสนักเรียน (ถ้าไม่ใส่จะสร้างอัตโนมัติ)</label>
                  <input
                    type="text"
                    value={formData.student_no || ''}
                    onChange={(e) => setFormData({ ...formData, student_no: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="รหัสนักเรียน (ไม่จำเป็นต้องกรอก)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">คำนำหน้า</label>
                  <select
                    value={formData.prefix_id || ''}
                    onChange={(e) => setFormData({ ...formData, prefix_id: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">เลือกคำนำหน้า</option>
                    {(prefixes || []).map(prefix => (
                      <option key={prefix.id} value={prefix.id}>{prefix.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">เพศ</label>
                  <select
                    value={formData.gender_id || ''}
                    onChange={(e) => setFormData({ ...formData, gender_id: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">เลือกเพศ</option>
                    {(genders || []).map(gender => (
                      <option key={gender.id} value={gender.id}>{gender.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
                    <input
                      type="text"
                      required
                      value={formData.firstname}
                      onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                    <input
                      type="text"
                      required
                      value={formData.lastname}
                      onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
                  >
                    {editingStudent ? 'บันทึกการแก้ไข' : 'เพิ่มนักเรียน'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}