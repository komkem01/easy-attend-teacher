@echo off
echo 🚀 Starting Easy Attend Teacher Development Server...

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Copy environment variables if not exists
if not exist ".env.local" (
    echo 🔧 Setting up environment variables...
    copy .env.example .env.local
)

REM Start development server
echo 🏃‍♂️ Starting Next.js development server...
npm run dev

pause