#!/bin/bash

echo "🚀 Stake-for-Shame Deployment Script"
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your credentials before continuing."
    echo "   Required variables:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_KEY"
    echo "   - OPENAI_API_KEY"
    echo "   - JWT_SECRET"
    echo ""
    echo "   After editing .env, run this script again."
    exit 0
fi

echo "✅ Environment variables configured"

# Check if database is set up
echo "🗄️  Checking database connection..."
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

supabase.from('users').select('count').limit(1)
  .then(() => console.log('✅ Database connection successful'))
  .catch(err => {
    console.log('❌ Database connection failed:', err.message);
    console.log('   Please check your Supabase credentials and run the schema.sql file');
    process.exit(1);
  });
"

if [ $? -ne 0 ]; then
    echo "❌ Database setup failed. Please check your Supabase configuration."
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To start the application:"
echo "1. Backend: npm run dev"
echo "2. Frontend: cd client && npm start"
echo ""
echo "The application will be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:5000"
echo ""
echo "Happy habit tracking! 🚀"
