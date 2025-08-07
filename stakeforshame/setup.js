#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Stake-for-Shame...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/stakeforshame

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Session Secret
SESSION_SECRET=your-session-secret-here

# Comput3 AI Configuration
OPENAI_API_KEY=c3_api_key
OPENAI_API_URL=https://api.comput3.ai/v1
SMALL_OPENAI_MODEL=llama3:70b
MEDIUM_OPENAI_MODEL=llama3:70b
LARGE_OPENAI_MODEL=llama3:70b

# Blockchain Configuration
ETHEREUM_NETWORK=polygon
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your-private-key-here

# Smart Contract Addresses
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
CHARITY_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

# Meme Coin Addresses (Polygon)
SHIBA_TOKEN_ADDRESS=0x6f8a06447Ff6FcF75d803135a7de15CE88C1d4ec
PEPE_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000

# Web3 Configuration
WEB3_PROVIDER_URL=https://polygon-rpc.com
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('✅ .env file already exists');
}

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install backend dependencies:', error.message);
  process.exit(1);
}

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('npm install', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies:', error.message);
  process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update the .env file with your actual configuration');
console.log('2. Start MongoDB (if running locally)');
console.log('3. Run "npm run dev" to start the application');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\n🔗 Useful links:');
console.log('- Documentation: README.md');
console.log('- API Health Check: http://localhost:5000/api/health');
console.log('- Frontend: http://localhost:3000');
