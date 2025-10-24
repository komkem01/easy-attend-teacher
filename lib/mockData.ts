import { Teacher, Student, Classroom, Attendance, Gender, Prefix, School } from '@/types/entities';

const now = new Date().toISOString();

// Genders
export const mockGenders: Gender[] = [
  { id: 1, name: 'ชาย', created_at: now, updated_at: now },
  { id: 2, name: 'หญิง', created_at: now, updated_at: now },
];

// Prefixes
export const mockPrefixes: Prefix[] = [
  { id: 1, name: 'นาย', created_at: now, updated_at: now },
  { id: 2, name: 'นางสาว', created_at: now, updated_at: now },
  { id: 3, name: 'นาง', created_at: now, updated_at: now },
  { id: 4, name: 'เด็กชาย', created_at: now, updated_at: now },
  { id: 5, name: 'เด็กหญิง', created_at: now, updated_at: now },
];

// Schools
export const mockSchools: School[] = [
  { id: 1, name: 'โรงเรียนสมชาย', created_at: now, updated_at: now },
  { id: 2, name: 'โรงเรียนวัดประชาบำรุง', created_at: now, updated_at: now },
  { id: 3, name: 'โรงเรียนสาธิตมหาวิทยาลัย', created_at: now, updated_at: now },
];

// Teacher
export const mockTeacher: Teacher = {
  id: 1,
  school_id: 1,
  email: 'teacher@example.com',
  firstname: 'สมชาย',
  lastname: 'ใจดี',
  phone: '0812345678',
  gender_id: 1,
  prefix_id: 1,
  created_at: now,
  updated_at: now,
  school: mockSchools[0],
  prefix: mockPrefixes[0],
  gender: mockGenders[0],
};

// Helper to create Student
const createStudent = (
  id: number,
  student_id: string,
  firstname: string,
  lastname: string,
  prefix_id: number,
  gender_id: number,
  grade_level: string,
  class_section: string
): Student => ({
  id,
  school_id: 1,
  student_id,
  firstname,
  lastname,
  gender_id,
  prefix_id,
  grade_level,
  class_section,
  created_at: now,
  updated_at: now,
  prefix: mockPrefixes.find(p => p.id === prefix_id),
  gender: mockGenders.find(g => g.id === gender_id),
  school: mockSchools[0],
});

// Students grouped by classroom
const m1_1_students: Student[] = [
  createStudent(1, 'STD001', 'สมศรี', 'ใจดี', 2, 2, 'ม.1', '1'),
  createStudent(2, 'STD002', 'สมหมาย', 'รักเรียน', 1, 1, 'ม.1', '1'),
  createStudent(3, 'STD003', 'วิภา', 'สุขใจ', 2, 2, 'ม.1', '1'),
  createStudent(4, 'STD004', 'ธนา', 'มั่นคง', 1, 1, 'ม.1', '1'),
  createStudent(5, 'STD005', 'มานี', 'ขยัน', 2, 2, 'ม.1', '1'),
  createStudent(6, 'STD006', 'สมพร', 'เพียรพยายาม', 1, 1, 'ม.1', '1'),
  createStudent(7, 'STD007', 'ชญานิศ', 'ฉลาด', 2, 2, 'ม.1', '1'),
  createStudent(8, 'STD008', 'ธนพล', 'รุ่งเรือง', 1, 1, 'ม.1', '1'),
  createStudent(9, 'STD009', 'ปิยะนุช', 'น่ารัก', 2, 2, 'ม.1', '1'),
  createStudent(10, 'STD010', 'ชัยวัฒน์', 'ชนะเลิศ', 1, 1, 'ม.1', '1'),
  createStudent(11, 'STD011', 'พิมพ์ชนก', 'เรียบร้อย', 2, 2, 'ม.1', '1'),
  createStudent(12, 'STD012', 'กิตติพงษ์', 'สุภาพ', 1, 1, 'ม.1', '1'),
  createStudent(13, 'STD013', 'ณัฐริกา', 'งามสง่า', 2, 2, 'ม.1', '1'),
  createStudent(14, 'STD014', 'อนุชา', 'เรียนดี', 1, 1, 'ม.1', '1'),
  createStudent(15, 'STD015', 'กัญญา', 'มีสติ', 2, 2, 'ม.1', '1'),
];

const m1_2_students: Student[] = [
  createStudent(16, 'STD016', 'ปรีชา', 'เฉลียว', 1, 1, 'ม.1', '2'),
  createStudent(17, 'STD017', 'สุดา', 'วิไล', 2, 2, 'ม.1', '2'),
  createStudent(18, 'STD018', 'วีระ', 'กล้าหาญ', 1, 1, 'ม.1', '2'),
  createStudent(19, 'STD019', 'นภา', 'แจ่มใส', 2, 2, 'ม.1', '2'),
  createStudent(20, 'STD020', 'ชาญ', 'ฉลาด', 1, 1, 'ม.1', '2'),
  createStudent(21, 'STD021', 'ภัทรา', 'สดใส', 2, 2, 'ม.1', '2'),
  createStudent(22, 'STD022', 'ธนากร', 'มั่งมี', 1, 1, 'ม.1', '2'),
  createStudent(23, 'STD023', 'วรรณา', 'สวย', 2, 2, 'ม.1', '2'),
  createStudent(24, 'STD024', 'อภิชาติ', 'เลิศ', 1, 1, 'ม.1', '2'),
  createStudent(25, 'STD025', 'จิรา', 'ยืนยง', 2, 2, 'ม.1', '2'),
  createStudent(26, 'STD026', 'ประสิทธิ์', 'ทำดี', 1, 1, 'ม.1', '2'),
  createStudent(27, 'STD027', 'สุนิสา', 'น่ารัก', 2, 2, 'ม.1', '2'),
  createStudent(28, 'STD028', 'ธีรพล', 'กล้า', 1, 1, 'ม.1', '2'),
  createStudent(29, 'STD029', 'พรทิพย์', 'งาม', 2, 2, 'ม.1', '2'),
  createStudent(30, 'STD030', 'ไกรสร', 'แกร่ง', 1, 1, 'ม.1', '2'),
];

const m2_1_students: Student[] = [
  createStudent(31, 'STD031', 'อรุณ', 'สว่าง', 1, 1, 'ม.2', '1'),
  createStudent(32, 'STD032', 'ดาวใจ', 'แจ่ม', 2, 2, 'ม.2', '1'),
  createStudent(33, 'STD033', 'เกียรติ', 'ประเสริฐ', 1, 1, 'ม.2', '1'),
  createStudent(34, 'STD034', 'นันทนา', 'สุข', 2, 2, 'ม.2', '1'),
  createStudent(35, 'STD035', 'ภูมิ', 'ใจดี', 1, 1, 'ม.2', '1'),
  createStudent(36, 'STD036', 'วิภาวรรณ', 'สดใส', 2, 2, 'ม.2', '1'),
  createStudent(37, 'STD037', 'ชัยณรงค์', 'ชนะ', 1, 1, 'ม.2', '1'),
  createStudent(38, 'STD038', 'อรอนงค์', 'งาม', 2, 2, 'ม.2', '1'),
  createStudent(39, 'STD039', 'พิพัฒน์', 'เจริญ', 1, 1, 'ม.2', '1'),
  createStudent(40, 'STD040', 'สุภาพร', 'ดี', 2, 2, 'ม.2', '1'),
  createStudent(41, 'STD041', 'ศักดิ์ดา', 'มั่นคง', 1, 1, 'ม.2', '1'),
  createStudent(42, 'STD042', 'รัชนี', 'วิไล', 2, 2, 'ม.2', '1'),
  createStudent(43, 'STD043', 'สุรชัย', 'เพียร', 1, 1, 'ม.2', '1'),
  createStudent(44, 'STD044', 'ประภา', 'สว่าง', 2, 2, 'ม.2', '1'),
  createStudent(45, 'STD045', 'วุฒิชัย', 'ฉลาด', 1, 1, 'ม.2', '1'),
];

const m2_2_students: Student[] = [
  createStudent(46, 'STD046', 'ธนวัฒน์', 'รุ่ง', 1, 1, 'ม.2', '2'),
  createStudent(47, 'STD047', 'มณีรัตน์', 'ประดับ', 2, 2, 'ม.2', '2'),
  createStudent(48, 'STD048', 'ปรเมศ', 'เลิศ', 1, 1, 'ม.2', '2'),
  createStudent(49, 'STD049', 'สายฝน', 'ชุ่ม', 2, 2, 'ม.2', '2'),
  createStudent(50, 'STD050', 'ทินกร', 'แกร่ง', 1, 1, 'ม.2', '2'),
  createStudent(51, 'STD051', 'นิภา', 'สง่า', 2, 2, 'ม.2', '2'),
  createStudent(52, 'STD052', 'อดิศักดิ์', 'มี', 1, 1, 'ม.2', '2'),
  createStudent(53, 'STD053', 'ชนิดา', 'ดี', 2, 2, 'ม.2', '2'),
  createStudent(54, 'STD054', 'ปิยะพงษ์', 'สุข', 1, 1, 'ม.2', '2'),
  createStudent(55, 'STD055', 'รุ่งนภา', 'แจ่ม', 2, 2, 'ม.2', '2'),
  createStudent(56, 'STD056', 'กฤษดา', 'ยิ่งใหญ่', 1, 1, 'ม.2', '2'),
  createStudent(57, 'STD057', 'ธัญญา', 'ภักดี', 2, 2, 'ม.2', '2'),
  createStudent(58, 'STD058', 'ชนินทร์', 'เจริญ', 1, 1, 'ม.2', '2'),
  createStudent(59, 'STD059', 'พิมพ์พร', 'สวย', 2, 2, 'ม.2', '2'),
  createStudent(60, 'STD060', 'ธนากร', 'รวย', 1, 1, 'ม.2', '2'),
];

const m3_1_students: Student[] = [
  createStudent(61, 'STD061', 'วิทยา', 'รู้', 1, 1, 'ม.3', '1'),
  createStudent(62, 'STD062', 'สุวรรณา', 'ทอง', 2, 2, 'ม.3', '1'),
  createStudent(63, 'STD063', 'ชัยวัฒน์', 'เจริญ', 1, 1, 'ม.3', '1'),
  createStudent(64, 'STD064', 'รัตนา', 'งาม', 2, 2, 'ม.3', '1'),
  createStudent(65, 'STD065', 'ธรรมนูญ', 'ธรรม', 1, 1, 'ม.3', '1'),
  createStudent(66, 'STD066', 'อรพิน', 'สุข', 2, 2, 'ม.3', '1'),
  createStudent(67, 'STD067', 'นรินทร์', 'เก่ง', 1, 1, 'ม.3', '1'),
  createStudent(68, 'STD068', 'ประดับ', 'สวย', 2, 2, 'ม.3', '1'),
  createStudent(69, 'STD069', 'เจษฎา', 'แข็งแรง', 1, 1, 'ม.3', '1'),
  createStudent(70, 'STD070', 'ปาลิดา', 'ดี', 2, 2, 'ม.3', '1'),
  createStudent(71, 'STD071', 'อมรินทร์', 'ทน', 1, 1, 'ม.3', '1'),
  createStudent(72, 'STD072', 'จุฑามาศ', 'งาม', 2, 2, 'ม.3', '1'),
  createStudent(73, 'STD073', 'สหัสชัย', 'มาก', 1, 1, 'ม.3', '1'),
  createStudent(74, 'STD074', 'วริศรา', 'ดี', 2, 2, 'ม.3', '1'),
  createStudent(75, 'STD075', 'ณัฐพล', 'พล', 1, 1, 'ม.3', '1'),
];

export const mockStudents: Student[] = [
  ...m1_1_students,
  ...m1_2_students,
  ...m2_1_students,
  ...m2_2_students,
  ...m3_1_students,
];

export const mockClassrooms: Classroom[] = [
  { id: 1, school_id: 1, teacher_id: 1, name: 'ม.1/1', grade_level: 'ม.1', class_section: '1', created_at: now, updated_at: now },
  { id: 2, school_id: 1, teacher_id: 1, name: 'ม.1/2', grade_level: 'ม.1', class_section: '2', created_at: now, updated_at: now },
  { id: 3, school_id: 1, teacher_id: 1, name: 'ม.2/1', grade_level: 'ม.2', class_section: '1', created_at: now, updated_at: now },
  { id: 4, school_id: 1, teacher_id: 1, name: 'ม.2/2', grade_level: 'ม.2', class_section: '2', created_at: now, updated_at: now },
  { id: 5, school_id: 1, teacher_id: 1, name: 'ม.3/1', grade_level: 'ม.3', class_section: '1', created_at: now, updated_at: now },
];

// Map classroom -> students
const classroomStudentsMap: Record<number, Student[]> = {
  1: m1_1_students,
  2: m1_2_students,
  3: m2_1_students,
  4: m2_2_students,
  5: m3_1_students,
};

// Attendance
export const mockAttendances: Attendance[] = [];

const today = new Date();
for (let d = 0; d < 30; d++) {
  const date = new Date(today);
  date.setDate(date.getDate() - d);
  const dateStr = date.toISOString().split('T')[0];

  Object.entries(classroomStudentsMap).forEach(([cid, students]) => {
    students.forEach((st) => {
      const r = Math.random();
      let status: Attendance['status'] = 'present';
      let notes: string | undefined = undefined;
      if (r < 0.05) {
        status = 'absent';
        notes = 'ป่วย';
      } else if (r < 0.1) {
        status = 'late';
        notes = 'มาสาย 10 นาที';
      } else if (r < 0.12) {
        status = 'excused';
        notes = 'ลากิจ';
      }
      mockAttendances.push({
        id: mockAttendances.length + 1,
        classroom_id: Number(cid),
        student_id: st.id,
        attendance_date: dateStr,
        status,
        check_in_time: status !== 'absent' ? `${String(8 + Math.floor(Math.random() * 2)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : undefined,
        notes,
        recorded_by: 1,
        created_at: now,
        updated_at: now,
        classroom: mockClassrooms.find(c => c.id === Number(cid)),
        student: st,
        recorded_by_teacher: mockTeacher,
      });
    });
  });
}

// In-memory stores
let studentsStore: Student[] = [...mockStudents];
let classroomsStore: Classroom[] = [...mockClassrooms];
let attendancesStore: Attendance[] = [...mockAttendances];

export const mockDataStore = {
  getTeacher: () => mockTeacher,
  getGenders: () => mockGenders,
  getPrefixes: () => mockPrefixes,
  getSchools: () => mockSchools,

  getClassrooms: () => classroomsStore,
  getClassroomById: (id: number) => classroomsStore.find(c => c.id === id) || null,
  addClassroom: (data: Omit<Classroom, 'id' | 'created_at' | 'updated_at'>): Classroom => {
    const classroom: Classroom = { id: classroomsStore.length + 1, ...data, created_at: now, updated_at: now } as Classroom;
    classroomsStore.push(classroom);
    return classroom;
  },
  updateClassroom: (id: number, data: Partial<Classroom>): Classroom | null => {
    const idx = classroomsStore.findIndex(c => c.id === id);
    if (idx === -1) return null;
    classroomsStore[idx] = { ...classroomsStore[idx], ...data, updated_at: new Date().toISOString() };
    return classroomsStore[idx];
  },
  deleteClassroom: (id: number) => { classroomsStore = classroomsStore.filter(c => c.id !== id); },

  getStudents: () => studentsStore,
  getStudentsByClassroom: (classroomId: number) => classroomStudentsMap[classroomId] || [],
  addStudent: (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Student => {
    const student: Student = { id: studentsStore.length + 1, ...data, created_at: now, updated_at: now } as Student;
    studentsStore.push(student);
    // auto-assign to a classroom if grade/section matches
    const classroom = classroomsStore.find(c => c.grade_level === student.grade_level && c.class_section === student.class_section);
    if (classroom) {
      classroomStudentsMap[classroom.id] = classroomStudentsMap[classroom.id] ? [...classroomStudentsMap[classroom.id], student] : [student];
    }
    return student;
  },
  updateStudent: (id: number, data: Partial<Student>): Student | null => {
    const idx = studentsStore.findIndex(s => s.id === id);
    if (idx === -1) return null;
    studentsStore[idx] = { ...studentsStore[idx], ...data, updated_at: new Date().toISOString() };
    return studentsStore[idx];
  },
  deleteStudent: (id: number) => {
    studentsStore = studentsStore.filter(s => s.id !== id);
    Object.keys(classroomStudentsMap).forEach(cid => {
      classroomStudentsMap[Number(cid)] = (classroomStudentsMap[Number(cid)] || []).filter(s => s.id !== id);
    });
  },

  getAttendances: () => attendancesStore,
  addAttendance: (data: Omit<Attendance, 'id' | 'created_at' | 'updated_at'>): Attendance => {
    const attendance: Attendance = { id: attendancesStore.length + 1, ...data, created_at: now, updated_at: now } as Attendance;
    attendancesStore.push(attendance);
    return attendance;
  },
  addBulkAttendance: (items: Omit<Attendance, 'id' | 'created_at' | 'updated_at'>[]) => {
    items.forEach(i => {
      attendancesStore.push({ id: attendancesStore.length + 1, ...i, created_at: now, updated_at: now } as Attendance);
    });
  },
  getAttendanceHistory: (filter?: { classroom_id?: number; date_from?: string; date_to?: string; }) => {
    let list = [...attendancesStore];
    if (filter?.classroom_id) list = list.filter(a => a.classroom_id === filter.classroom_id);
    if (filter?.date_from) list = list.filter(a => a.attendance_date >= filter.date_from!);
    if (filter?.date_to) list = list.filter(a => a.attendance_date <= filter.date_to!);
    return list;
  }
};
