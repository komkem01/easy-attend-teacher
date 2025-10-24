// Mock-backed services: no HTTP calls
import { mockDataStore, mockGenders, mockPrefixes, mockSchools, mockTeacher } from '@/lib/mockData';
import {
  Teacher,
  Student,
  School,
  Gender,
  Prefix,
  Classroom,
  ClassroomMember,
  Attendance,
  CreateStudentRequest,
  CreateClassroomRequest,
  CreateAttendanceRequest,
  AttendanceStats
} from '@/types/entities';

// Auth Profile - ไม่ใช้แล้ว ใช้ teacherInfoService แทน
export const profileService = {
  async getProfile(): Promise<Teacher> {
    return mockTeacher;
  },
  async logout(): Promise<void> {
    return;
  }
};

// Teacher Info service (Dashboard API)
export const teacherInfoService = {
  async getTeacherInfo(): Promise<any> {
    // Compose a dashboard-like payload
    const classrooms = mockDataStore.getClassrooms();
    const students = mockDataStore.getStudents();
    const attendances = mockDataStore.getAttendances();
    const total_stats = {
      total_students: students.length,
      total_classrooms: classrooms.length,
      total_attendance: attendances.filter(a => a.attendance_date === new Date().toISOString().split('T')[0]).length,
      attendance_rate: 95,
    };

    return {
      teacher: mockTeacher,
      classrooms,
      total_stats,
      recent_activities: [],
    };
  }
};

// Teacher services
export const teacherService = {
  async getAllTeachers(): Promise<Teacher[]> {
    return [mockTeacher];
  },

  async getTeacherById(id: number): Promise<Teacher> {
    return mockTeacher;
  }
};

// Student services
export const studentService = {
  async getAllStudents(): Promise<Student[]> {
    return mockDataStore.getStudents();
  },

  async getMyStudents(): Promise<Student[]> {
    return mockDataStore.getStudents();
  },

  async getStudentById(id: number): Promise<Student> {
    const student = mockDataStore.getStudents().find(s => s.id === id);
    if (!student) throw new Error('Student not found');
    return student;
  },

  async createStudent(studentData: CreateStudentRequest): Promise<Student> {
    const student_id = studentData.student_no && studentData.student_no.trim() !== ''
      ? studentData.student_no
      : `STD${String(mockDataStore.getStudents().length + 1).padStart(3, '0')}`;
    const newStudent = mockDataStore.addStudent({
      id: 0 as any, // will be replaced in store
      school_id: studentData.school_id,
      student_id,
      firstname: studentData.firstname,
      lastname: studentData.lastname,
      phone: undefined,
      gender_id: studentData.gender_id || 1,
      prefix_id: studentData.prefix_id || 1,
      grade_level: studentData.grade_level,
      class_section: studentData.class_section,
      created_at: '' as any,
      updated_at: '' as any,
    } as unknown as Student);
    return newStudent;
  },

  async updateStudent(id: number, studentData: Partial<CreateStudentRequest>): Promise<Student> {
    const mapped: Partial<Student> = {
      firstname: studentData.firstname,
      lastname: studentData.lastname,
      gender_id: studentData.gender_id ?? undefined,
      prefix_id: studentData.prefix_id ?? undefined,
      grade_level: studentData.grade_level,
      class_section: studentData.class_section,
      student_id: (studentData as any).student_no,
    };
    const updated = mockDataStore.updateStudent(id, mapped);
    if (!updated) throw new Error('Update failed');
    return updated;
  },

  async deleteStudent(id: number): Promise<void> {
    mockDataStore.deleteStudent(id);
  }
};

// School services
export const schoolService = {
  async getAllSchools(): Promise<School[]> {
    return mockSchools;
  },

  async getSchoolById(id: number): Promise<School> {
    const school = mockSchools.find(s => s.id === id);
    if (!school) throw new Error('School not found');
    return school;
  }
};

// Gender services
export const genderService = {
  async getAllGenders(): Promise<Gender[]> {
    return mockGenders;
  }
};

// Prefix services
export const prefixService = {
  async getAllPrefixes(): Promise<Prefix[]> {
    return mockPrefixes;
  }
};

// Classroom services
export const classroomService = {
  async getAllClassrooms(): Promise<Classroom[]> {
    return mockDataStore.getClassrooms();
  },

  async getMyClassrooms(): Promise<Classroom[]> {
    return mockDataStore.getClassrooms();
  },

  async getClassroomById(id: number): Promise<any> {
    const c = mockDataStore.getClassroomById(id);
    if (!c) throw new Error('Classroom not found');
    return c;
  },

  async getClassroomStudents(classroomId: number, page: number = 1, limit: number = 50): Promise<Student[]> {
    const classroom = mockDataStore.getClassroomById(classroomId);
    const list = classroom
      ? mockDataStore.getStudents().filter(s => s.grade_level === classroom.grade_level && s.class_section === classroom.class_section)
      : [];
    const start = (page - 1) * limit;
    return list.slice(start, start + limit);
  },

  async createClassroom(classroomData: CreateClassroomRequest): Promise<Classroom> {
    const classroom = mockDataStore.addClassroom({
      school_id: classroomData.school_id,
      teacher_id: mockTeacher.id,
      name: classroomData.name,
      description: classroomData.description,
      grade_level: classroomData.grade_level,
      class_section: classroomData.class_section,
      subject: classroomData.subject,
      created_at: '' as any,
      updated_at: '' as any,
      id: 0 as any,
    } as unknown as Classroom);
    return classroom;
  },

  async updateClassroom(id: number, classroomData: Partial<CreateClassroomRequest>): Promise<Classroom> {
    const updated = mockDataStore.updateClassroom(id, classroomData as any);
    if (!updated) throw new Error('Update failed');
    return updated;
  },

  async deleteClassroom(id: number): Promise<void> {
    mockDataStore.deleteClassroom(id);
  }
};

// Classroom Member services
export const classroomMemberService = {
  async getAllClassroomMembers(): Promise<ClassroomMember[]> {
    // Derive by matching student grade/section to classroom
    const members: ClassroomMember[] = [];
    mockDataStore.getClassrooms().forEach((c) => {
      const students = mockDataStore.getStudents().filter(s => s.grade_level === c.grade_level && s.class_section === c.class_section);
      students.forEach((s) => {
        members.push({
          classroom_id: c.id,
          member_id: s.id,
          role: 'student',
          joined_at: now(),
          classroom: c,
          student: s,
        });
      });
    });
    return members;
  },

  async getClassroomMembersByClassroomId(classroomId: number): Promise<ClassroomMember[]> {
    const classroom = mockDataStore.getClassroomById(classroomId);
    const students = classroom
      ? mockDataStore.getStudents().filter(s => s.grade_level === classroom.grade_level && s.class_section === classroom.class_section)
      : [];
    return students.map((s) => ({
      classroom_id: classroomId,
      member_id: s.id,
      role: 'student',
      joined_at: now(),
      student: s,
      classroom: classroom || undefined,
    }));
  },

  async addMemberToClassroom(classroomId: number, memberId: number): Promise<ClassroomMember> {
    // Reassign student's grade/section to match classroom
    const classroom = mockDataStore.getClassroomById(classroomId);
    if (!classroom) throw new Error('Classroom not found');
    const updated = mockDataStore.updateStudent(memberId, {
      grade_level: classroom.grade_level,
      class_section: classroom.class_section,
    });
    if (!updated) throw new Error('Student not found');
    return {
      classroom_id: classroomId,
      member_id: memberId,
      role: 'student',
      joined_at: now(),
      classroom,
      student: updated,
    };
  },

  async removeMemberFromClassroom(classroomId: number, memberId: number): Promise<void> {
    // Remove by moving student out of this class (clear section)
    mockDataStore.updateStudent(memberId, { class_section: undefined, grade_level: undefined });
  }
};

// Attendance services
export const attendanceService = {
  async getAllAttendances(): Promise<Attendance[]> {
    return mockDataStore.getAttendances();
  },

  async getMyAttendances(): Promise<Attendance[]> {
    return mockDataStore.getAttendances();
  },

  async getAttendanceById(id: number): Promise<Attendance> {
    const att = mockDataStore.getAttendances().find(a => a.id === id);
    if (!att) throw new Error('Attendance not found');
    return att;
  },

  async getAttendancesByClassroom(classroomId: number, dateFrom?: string, dateTo?: string): Promise<Attendance[]> {
    return mockDataStore.getAttendanceHistory({ classroom_id: classroomId, date_from: dateFrom, date_to: dateTo });
  },

  async getAttendancesByStudent(studentId: number): Promise<Attendance[]> {
    return mockDataStore.getAttendances().filter(a => a.student_id === studentId);
  },

  async createAttendance(attendanceData: CreateAttendanceRequest): Promise<any> {
    const created = mockDataStore.addAttendance({
      classroom_id: attendanceData.classroom_id,
      student_id: attendanceData.student_id,
      attendance_date: attendanceData.attendance_date,
      status: attendanceData.status,
      check_in_time: attendanceData.check_in_time,
      notes: attendanceData.notes,
      recorded_by: mockTeacher.id,
      created_at: '' as any,
      updated_at: '' as any,
      id: 0 as any,
    } as unknown as Attendance);
    return created;
  },

  async updateAttendance(id: number, attendanceData: Partial<CreateAttendanceRequest>): Promise<Attendance> {
    const list = mockDataStore.getAttendances();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Attendance not found');
    const updated: Attendance = {
      ...list[idx],
      attendance_date: attendanceData.attendance_date || list[idx].attendance_date,
      status: (attendanceData.status as any) || list[idx].status,
      check_in_time: attendanceData.check_in_time || list[idx].check_in_time,
      notes: attendanceData.notes ?? list[idx].notes,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    return updated;
  },

  async deleteAttendance(id: number): Promise<void> {
    const list = mockDataStore.getAttendances();
    const idx = list.findIndex(a => a.id === id);
    if (idx >= 0) list.splice(idx, 1);
  }
};

// Utils for calculating stats
export const statsService = {
  calculateAttendanceStats(attendances: Attendance[]): AttendanceStats {
    const total_students = new Set(attendances.map(a => a.student_id)).size;
    const present_count = attendances.filter(a => a.status === 'present').length;
    const absent_count = attendances.filter(a => a.status === 'absent').length;
    const late_count = attendances.filter(a => a.status === 'late').length;
    const excused_count = attendances.filter(a => a.status === 'excused').length;
    
    const attendance_rate = total_students > 0 ? (present_count / total_students) * 100 : 0;

    return {
      total_students,
      present_count,
      absent_count,
      late_count,
      excused_count,
      attendance_rate: Math.round(attendance_rate * 100) / 100
    };
  }
};

function now(): string {
  return new Date().toISOString();
}