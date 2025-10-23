// API Types based on your backend
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthRequest {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phone?: string;
  school_name: string;
  gender_name?: string; // ชื่อเพศ เช่น ชาย, หญิง
  prefix_name?: string; // ชื่อคำนำหน้า เช่น นาย, นาง, นางสาว
}

export interface Teacher {
  id: number;
  school_id?: number;
  email: string;
  firstname: string;
  lastname: string;
  phone?: string;
  school_name?: string;
  gender_id?: number;
  prefix_id?: number;
  gender_name?: string;
  prefix_name?: string;
  created_at: string | number;
  updated_at: string | number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    teacher: Teacher;
    token: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}