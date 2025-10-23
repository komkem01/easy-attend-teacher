// Base interfaces
export interface BaseEntity {
  id: number;
  created_at: string | number;
  updated_at: string | number;
}

// School related
export interface School extends BaseEntity {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

// Gender and Prefix
export interface Gender extends BaseEntity {
  name: string; // ชาย, หญิง
}

export interface Prefix extends BaseEntity {
  name: string; // นาย, นาง, นางสาว, เด็กชาย, เด็กหญิง
}

// Teacher (existing but updated)
export interface Teacher extends BaseEntity {
  school_id: number;
  email: string;
  firstname: string;
  lastname: string;
  phone?: string;
  gender_id: number;
  prefix_id: number;
  // Relations
  school?: School;
  gender?: Gender;
  prefix?: Prefix;
}

// Student
export interface Student extends BaseEntity {
  school_id: number;
  student_id: string; // รหัสนักเรียน
  firstname: string;
  lastname: string;
  phone?: string;
  gender_id: number;
  prefix_id: number;
  grade_level?: string; // ระดับชั้น เช่น ม.1, ม.2
  class_section?: string; // ห้อง/แผนกเรียน เช่น 1/1, 1/2
  // Relations
  school?: School;
  gender?: Gender;
  prefix?: Prefix;
}

// Classroom
export interface Classroom extends BaseEntity {
  school_id: number;
  teacher_id: number;
  name: string; // ชื่อห้องเรียน/วิชา
  description?: string;
  grade_level?: string;
  class_section?: string;
  subject?: string; // วิชาที่สอน
  // Relations
  school?: School;
  teacher?: Teacher;
  member_count?: number;
}

// Classroom Member (relation between classroom and student)
export interface ClassroomMember {
  classroom_id: number;
  member_id: number; // student_id
  role: 'student' | 'teacher'; // ประเภทสมาชิก
  joined_at: string | number;
  // Relations
  classroom?: Classroom;
  student?: Student;
}

// Attendance
export interface Attendance extends BaseEntity {
  classroom_id: number;
  student_id: number;
  attendance_date: string; // วันที่เช็คชื่อ
  status: 'present' | 'absent' | 'late' | 'excused'; // สถานะการเข้าเรียน
  check_in_time?: string; // เวลาที่เช็คอิน
  notes?: string; // หมายเหตุ
  recorded_by: number; // teacher_id ที่บันทึก
  // Relations
  classroom?: Classroom;
  student?: Student;
  recorded_by_teacher?: Teacher;
}

// API Response types
export interface ApiResponse<T> {
  status: {
    code: number;
    message: string;
  };
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Profile response (เพิ่มสำหรับ /auth/profile)
export interface ProfileResponse {
  teacher: Teacher;
}

// Request types for forms - ตรงกับ Backend
export interface CreateStudentRequest {
  school_id: number;
  student_no?: string; // Optional, will auto-generate if empty
  firstname: string;
  lastname: string;
  gender_id?: number | null;
  prefix_id?: number | null;
  grade_level?: string;
  class_section?: string;
}

export interface UpdateStudentRequest {
  school_id: number;
  student_no: string;
  firstname: string;
  lastname: string;
  gender_id?: number | null;
  prefix_id?: number | null;
  grade_level?: string;
  class_section?: string;
}

export interface CreateClassroomRequest {
  name: string;
  description?: string;
  grade_level?: string;
  class_section?: string;
  subject?: string;
  school_id: number;
}

// Classroom Member Request types
export interface CreateClassroomMemberRequest {
  classroom_id: number;
  member_id: number; // student_id
  role?: string;
}

export interface UpdateClassroomMemberRequest {
  role?: string;
}

// School
export interface School extends BaseEntity {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
}

// Teacher Info (from /teacher/info endpoint)
export interface TeacherInfo {
  id: number;
  school_id: number;
  teacher_no: string;
  firstname: string;
  lastname: string;
  phone?: string;
  email?: string;
  gender_id?: number;
  prefix_id?: number;
  // Relations
  school?: School;
  gender?: Gender;
  prefix?: Prefix;
  classrooms?: Classroom[]; // ห้องเรียนที่ครูสอน
}

export interface CreateAttendanceRequest {
  classroom_id: number;
  student_id: number;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  check_in_time?: string;
  notes?: string;
}

export interface AttendanceStats {
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_rate: number;
}