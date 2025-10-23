# Easy Attend Teacher

ระบบจัดการการเข้าเรียนออนไลน์สำหรับครู - Frontend

## คุณสมบัติ

- ✅ ระบบเข้าสู่ระบบและลงทะเบียนสำหรับครู
- ✅ Dashboard หลักสำหรับจัดการระบบ
- ✅ เชื่อมต่อกับ Backend API (localhost:8080)
- ✅ การจัดการ Authentication ด้วย JWT Token
- ✅ Responsive Design ด้วย Tailwind CSS
- ✅ TypeScript สำหรับความปลอดภัยของโค้ด

## เทคโนโลยีที่ใช้

- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Authentication**: JWT Token with js-cookie
- **State Management**: React Hooks

## โครงสร้างโปรเจ็กต์

```
easy-attend-teacher/
├── app/                    # Next.js App Router
│   ├── dashboard/         # หน้า Dashboard
│   ├── login/            # หน้าเข้าสู่ระบบ
│   ├── register/         # หน้าลงทะเบียน
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirect)
├── components/            # React Components
│   └── LoadingSpinner.tsx
├── lib/                  # Utility libraries
│   └── api.ts           # Axios configuration
├── services/            # API Services
│   └── authService.ts   # Authentication service
├── types/               # TypeScript type definitions
│   └── auth.ts         # Authentication types
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## การติดตั้งและใช้งาน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. เริ่มต้น Development Server

```bash
npm run dev
```

แอปพลิเคชันจะทำงานที่ `http://localhost:3000`

### 3. Build สำหรับ Production

```bash
npm run build
npm start
```

## การเชื่อมต่อ Backend API

แอปพลิเคชันนี้เชื่อมต่อกับ Backend API ที่ `http://localhost:8080/api/v1`

### API Endpoints

- `POST /api/v1/auth/login` - เข้าสู่ระบบ
- `POST /api/v1/auth/register` - ลงทะเบียน

### ตัวอย่าง Request/Response

**Login Request:**
```json
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

**Register Request:**
```json
{
  "email": "teacher@example.com",
  "password": "password123",
  "firstname": "ชื่อ",
  "lastname": "นามสกุล",
  "phone": "0812345678",
  "school_name": "โรงเรียนตัวอย่าง"
}
```

## การใช้งาน

### 1. หน้าแรก
- เมื่อเปิดแอปพลิเคชัน จะเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบอัตโนมัติ
- หากมีการเข้าสู่ระบบแล้ว จะไปหน้า Dashboard

### 2. หน้าเข้าสู่ระบบ (`/login`)
- กรอกอีเมลและรหัสผ่าน
- หากเข้าสู่ระบบสำเร็จ จะเปลี่ยนเส้นทางไปหน้า Dashboard
- มีลิงก์ไปหน้าลงทะเบียนสำหรับผู้ใช้ใหม่

### 3. หน้าลงทะเบียน (`/register`)
- กรอกข้อมูลครู: ชื่อ, นามสกุล, อีเมล, เบอร์โทร, ชื่อโรงเรียน, รหัสผ่าน
- ตรวจสอบความถูกต้องของรหัสผ่าน
- หากลงทะเบียนสำเร็จ จะเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ

### 4. หน้า Dashboard (`/dashboard`)
- แสดงเมนูหลักสำหรับจัดการระบบ
- มีปุ่มออกจากระบบ
- ป้องกันการเข้าถึงหากไม่ได้เข้าสู่ระบบ

## การจัดการ Authentication

- ใช้ JWT Token เก็บใน Cookie
- Token จะหมดอายุใน 7 วัน
- มี Interceptor ตรวจสอบ Token หมดอายุ
- Auto redirect ไปหน้า login หาก Token หมดอายุ

## การ Customize

### เปลี่ยนสี Theme
แก้ไขไฟล์ `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
      }
    }
  },
}
```

### เปลี่ยน API Base URL
แก้ไขไฟล์ `lib/api.ts`:

```ts
const API_BASE_URL = 'http://your-backend-url/api/v1';
```

## การ Deploy

### Vercel (แนะนำ)
1. Push โค้ดไปยัง GitHub Repository
2. เชื่อมต่อ Repository กับ Vercel
3. Vercel จะ Deploy อัตโนมัติ

### การตั้งค่า Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## การแก้ไขปัญหา

### 1. CORS Error
ตรวจสอบการตั้งค่า CORS ที่ Backend API

### 2. Token หมดอายุ
- ตรวจสอบการตั้งค่า Cookie
- ตรวจสอบ Token expiration time

### 3. Build Error
```bash
npm run lint
npm run build
```

## การสนับสนุน

หากมีปัญหาในการใช้งาน สามารถสร้าง Issue ใน GitHub Repository