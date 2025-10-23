#!/bin/bash

echo "🚀 Starting Easy Attend Teacher Development Server..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Copy environment variables if not exists
if [ ! -f ".env.local" ]; then
    echo "🔧 Setting up environment variables..."
    cp .env.example .env.local
fi

# Start development server
echo "🏃‍♂️ Starting Next.js development server..."
npm run dev