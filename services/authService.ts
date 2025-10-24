import { LoginRequest, AuthRequest, AuthResponse } from '@/types/auth';
import Cookies from 'js-cookie';
import { mockTeacher } from '@/lib/mockData';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Simulate network latency
      await new Promise((r) => setTimeout(r, 300));

      // Very simple mock validation
      const isValid =
        (credentials.email === 'teacher@example.com' && credentials.password === 'password') ||
        (credentials.email && credentials.password);

      if (!isValid) {
        throw new Error('invalid-credentials');
      }

      const token = `mock-token-${Date.now()}`;

      // Persist session
      Cookies.set('auth_token', token, { expires: 7 });
      Cookies.set(
        'user_data',
        JSON.stringify({
          ...mockTeacher,
          school_name: mockTeacher.school?.name,
          gender_name: mockTeacher.gender?.name,
          prefix_name: mockTeacher.prefix?.name,
        }),
        { expires: 7 }
      );

      const authResponse: AuthResponse = {
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',
        data: {
          teacher: {
            id: mockTeacher.id,
            school_id: mockTeacher.school_id,
            email: mockTeacher.email,
            firstname: mockTeacher.firstname,
            lastname: mockTeacher.lastname,
            phone: mockTeacher.phone,
            school_name: mockTeacher.school?.name,
            gender_id: mockTeacher.gender_id,
            prefix_id: mockTeacher.prefix_id,
            gender_name: mockTeacher.gender?.name,
            prefix_name: mockTeacher.prefix?.name,
            created_at: mockTeacher.created_at,
            updated_at: mockTeacher.updated_at,
          },
          token,
        },
      };

      return authResponse;
    } catch (error: any) {
      throw {
        success: false,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      } as AuthResponse;
    }
  },

  async register(userData: AuthRequest): Promise<AuthResponse> {
    try {
      // Simulate latency
      await new Promise((r) => setTimeout(r, 300));

      if (!userData.email || !userData.password) {
        throw new Error('validation');
      }

      const token = `mock-token-${Date.now()}`;
      const teacher = {
        id: Math.floor(Math.random() * 10000),
        school_id: 1,
        email: userData.email,
        firstname: userData.firstname,
        lastname: userData.lastname,
        phone: userData.phone,
        school_name: userData.school_name,
        gender_id: mockTeacher.gender_id,
        prefix_id: mockTeacher.prefix_id,
        gender_name: userData.gender_name,
        prefix_name: userData.prefix_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      Cookies.set('auth_token', token, { expires: 7 });
      Cookies.set('user_data', JSON.stringify(teacher), { expires: 7 });

      return {
        success: true,
        message: 'ลงทะเบียนสำเร็จ',
        data: { teacher, token },
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการลงทะเบียน',
      } as AuthResponse;
    }
  },

  logout(): void {
    Cookies.remove('auth_token');
    Cookies.remove('user_data');
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('auth_token');
  },

  getToken(): string | null {
    return Cookies.get('auth_token') || null;
  },

  getCurrentUser(): any | null {
    const userData = Cookies.get('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  setUserData(userData: any): void {
    Cookies.set('user_data', JSON.stringify(userData), { expires: 7 });
  }
};