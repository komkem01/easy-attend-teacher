import api from '@/lib/api';
import { LoginRequest, AuthRequest, AuthResponse } from '@/types/auth';
import Cookies from 'js-cookie';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('AuthService: Sending login request to API...');
      const response = await api.post('/login', credentials);
      console.log('AuthService: API response received:', response.data);
      
      // API V2 Response: { success, message, token, expires, data }
      if (response.data.success && response.data.token) {
        console.log('AuthService: Storing token in cookie...');
        Cookies.set('auth_token', response.data.token, { expires: 7 });
        
        // Store teacher data
        if (response.data.data) {
          console.log('AuthService: Storing teacher data...');
          Cookies.set('user_data', JSON.stringify(response.data.data), { expires: 7 });
        }
        
        const authResponse: AuthResponse = {
          success: true,
          message: response.data.message || 'เข้าสู่ระบบสำเร็จ',
          data: {
            token: response.data.token,
            teacher: response.data.data
          }
        };
        
        console.log('AuthService: Final response:', authResponse);
        return authResponse;
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('AuthService: Login error:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
        errors: error.response?.data?.error,
      };
    }
  },

  async register(userData: AuthRequest): Promise<AuthResponse> {
    try {
      console.log('AuthService: Sending register request to API...');
      const response = await api.post('/register', userData);
      console.log('AuthService: Register API response received:', response.data);
      
      // API V2 Response: { success, message, data }
      if (response.data.success) {
        const authResponse: AuthResponse = {
          success: true,
          message: response.data.message || 'ลงทะเบียนสำเร็จ',
          data: response.data.data
        };
        
        console.log('AuthService: Final register response:', authResponse);
        return authResponse;
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('Register API Error:', error.response?.data || error.message);
      
      throw {
        success: false,
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน',
        errors: error.response?.data?.error,
      };
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