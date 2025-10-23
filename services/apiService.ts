import api from '@/lib/api';
import {
  Teacher,
  Student,
  School,
  Gender,
  Prefix,
  Classroom,
  ClassroomMember,
  Attendance,
  CreateClassroomMemberRequest,
  ApiResponse,
  PaginatedResponse,
  ProfileResponse,
  CreateStudentRequest,
  CreateClassroomRequest,
  CreateAttendanceRequest,
  AttendanceStats
} from '@/types/entities';

// Auth Profile - ไม่ใช้แล้ว ใช้ teacherInfoService แทน
export const profileService = {
  async getProfile(): Promise<Teacher> {
    try {
      // ใช้ dashboard endpoint แทน
      const response = await api.get('/dashboard');
      console.log('Profile (dashboard) API response:', response.data);

      if (response.data.success && response.data.data) {
        // ดึงข้อมูล teacher จาก dashboard
        return response.data.data.teacher || response.data.data;
      }
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};

// Teacher Info service (Dashboard API)
export const teacherInfoService = {
  async getTeacherInfo(): Promise<any> {
    try {
      const response = await api.get('/dashboard');
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get teacher info error:', error);
      throw error;
    }
  }
};

// Teacher services
export const teacherService = {
  async getAllTeachers(): Promise<Teacher[]> {
    try {
      const response = await api.get('/teachers');
      return response.data.status?.code === 200 ? response.data.data : response.data;
    } catch (error: any) {
      console.error('Get teachers error:', error);
      throw error;
    }
  },

  async getTeacherById(id: number): Promise<Teacher> {
    try {
      const response = await api.get(`/teachers/${id}`);
      return response.data.status?.code === 200 ? response.data.data : response.data;
    } catch (error: any) {
      console.error('Get teacher error:', error);
      throw error;
    }
  }
};

// Student services
export const studentService = {
  async getAllStudents(): Promise<Student[]> {
    try {
      // ดึงจาก dashboard แทน
      const response = await api.get('/dashboard');
      if (response.data.success && response.data.data?.classrooms) {
        // รวมนักเรียนจากทุกห้องเรียน
        const students: Student[] = [];
        response.data.data.classrooms.forEach((classroom: any) => {
          if (classroom.students) {
            students.push(...classroom.students);
          }
        });
        return students;
      }
      return [];
    } catch (error: any) {
      console.error('Get students error:', error);
      throw error;
    }
  },

  async getMyStudents(): Promise<Student[]> {
    try {
      // ดึงจาก dashboard
      const response = await api.get('/dashboard');
      if (response.data.success && response.data.data?.classrooms) {
        const students: Student[] = [];
        response.data.data.classrooms.forEach((classroom: any) => {
          if (classroom.students) {
            students.push(...classroom.students);
          }
        });
        return students;
      }
      return [];
    } catch (error: any) {
      console.error('Get my students error:', error);
      throw error;
    }
  },

  async getStudentById(id: number): Promise<Student> {
    try {
      const response = await api.get(`/students/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get student error:', error);
      throw error;
    }
  },

  async createStudent(studentData: CreateStudentRequest): Promise<Student> {
    try {
      const response = await api.post('/students', studentData);
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Create student error:', error);
      throw error;
    }
  },

  async updateStudent(id: number, studentData: Partial<CreateStudentRequest>): Promise<Student> {
    try {
      const response = await api.put(`/students/${id}`, studentData);
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Update student error:', error);
      throw error;
    }
  },

  async deleteStudent(id: number): Promise<void> {
    try {
      await api.delete(`/students/${id}`);
    } catch (error: any) {
      console.error('Delete student error:', error);
      throw error;
    }
  }
};

// School services
export const schoolService = {
  async getAllSchools(): Promise<School[]> {
    try {
      const response = await api.get('/schools');
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get schools error:', error);
      throw error;
    }
  },

  async getSchoolById(id: number): Promise<School> {
    try {
      const response = await api.get(`/schools/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get school error:', error);
      throw error;
    }
  }
};

// Gender services
export const genderService = {
  async getAllGenders(): Promise<Gender[]> {
    try {
      const response = await api.get('/genders');
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get genders error:', error);
      throw error;
    }
  }
};

// Prefix services
export const prefixService = {
  async getAllPrefixes(): Promise<Prefix[]> {
    try {
      const response = await api.get('/prefixes');
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get prefixes error:', error);
      throw error;
    }
  }
};

// Classroom services
export const classroomService = {
  async getAllClassrooms(): Promise<Classroom[]> {
    try {
      // ดึงจาก dashboard
      const response = await api.get('/dashboard');
      if (response.data.success && response.data.data?.classrooms) {
        return response.data.data.classrooms;
      }
      return [];
    } catch (error: any) {
      console.error('Get classrooms error:', error);
      throw error;
    }
  },

  async getMyClassrooms(): Promise<Classroom[]> {
    try {
      // ดึงจาก dashboard
      const response = await api.get('/dashboard');
      if (response.data.success && response.data.data?.classrooms) {
        return response.data.data.classrooms;
      }
      return [];
    } catch (error: any) {
      console.error('Get my classrooms error:', error);
      throw error;
    }
  },

  async getClassroomById(id: number): Promise<any> {
    try {
      const response = await api.get(`/classrooms/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get classroom error:', error);
      throw error;
    }
  },

  async getClassroomStudents(classroomId: number, page: number = 1, limit: number = 50): Promise<Student[]> {
    try {
      const response = await api.get(`/classrooms/${classroomId}/students?page=${page}&limit=${limit}`);
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get classroom students error:', error);
      throw error;
    }
  },

  async createClassroom(classroomData: CreateClassroomRequest): Promise<Classroom> {
    try {
      const response = await api.post('/classrooms', classroomData);
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Create classroom error:', error);
      throw error;
    }
  },

  async updateClassroom(id: number, classroomData: Partial<CreateClassroomRequest>): Promise<Classroom> {
    try {
      const response = await api.put(`/classrooms/${id}`, classroomData);
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Update classroom error:', error);
      throw error;
    }
  },

  async deleteClassroom(id: number): Promise<void> {
    try {
      await api.delete(`/classrooms/${id}`);
    } catch (error: any) {
      console.error('Delete classroom error:', error);
      throw error;
    }
  }
};

// Classroom Member services
export const classroomMemberService = {
  async getAllClassroomMembers(): Promise<ClassroomMember[]> {
    try {
      const response = await api.get('/classroom-members');
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get classroom members error:', error);
      throw error;
    }
  },

  async getClassroomMembersByClassroomId(classroomId: number): Promise<ClassroomMember[]> {
    try {
      const response = await api.get(`/classroom-members/classroom/${classroomId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get classroom members by classroom error:', error);
      throw error;
    }
  },

  async addMemberToClassroom(classroomId: number, memberId: number): Promise<ClassroomMember> {
    try {
      const response = await api.post('/classroom-members', {
        classroom_id: classroomId,
        member_id: memberId,
        role: 'student'
      });
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Add classroom member error:', error);
      throw error;
    }
  },

  async removeMemberFromClassroom(classroomId: number, memberId: number): Promise<void> {
    try {
      await api.delete(`/classroom-members/${classroomId}/${memberId}`);
    } catch (error: any) {
      console.error('Remove classroom member error:', error);
      throw error;
    }
  }
};

// Attendance services
export const attendanceService = {
  async getAllAttendances(): Promise<Attendance[]> {
    try {
      const response = await api.get('/attendance/history');
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get attendances error:', error);
      throw error;
    }
  },

  async getMyAttendances(): Promise<Attendance[]> {
    try {
      const response = await api.get('/attendance/history');
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get my attendances error:', error);
      throw error;
    }
  },

  async getAttendanceById(id: number): Promise<Attendance> {
    try {
      const response = await api.get(`/attendances/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get attendance error:', error);
      throw error;
    }
  },

  async getAttendancesByClassroom(classroomId: number, dateFrom?: string, dateTo?: string): Promise<Attendance[]> {
    try {
      let url = `/attendance/history?classroom_id=${classroomId}`;
      if (dateFrom) url += `&date_from=${dateFrom}`;
      if (dateTo) url += `&date_to=${dateTo}`;
      
      const response = await api.get(url);
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get attendances by classroom error:', error);
      throw error;
    }
  },

  async getAttendancesByStudent(studentId: number): Promise<Attendance[]> {
    try {
      const response = await api.get(`/attendances/student/${studentId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get attendances by student error:', error);
      throw error;
    }
  },

  async createAttendance(attendanceData: CreateAttendanceRequest): Promise<any> {
    try {
      const response = await api.post('/attendance', attendanceData);
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Create attendance error:', error);
      throw error;
    }
  },

  async updateAttendance(id: number, attendanceData: Partial<CreateAttendanceRequest>): Promise<Attendance> {
    try {
      const response = await api.put(`/attendances/${id}`, attendanceData);
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Update attendance error:', error);
      throw error;
    }
  },

  async deleteAttendance(id: number): Promise<void> {
    try {
      await api.delete(`/attendances/${id}`);
    } catch (error: any) {
      console.error('Delete attendance error:', error);
      throw error;
    }
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