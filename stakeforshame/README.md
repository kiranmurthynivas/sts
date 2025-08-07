# 🎯 Stake-for-Shame

A crypto-powered habit accountability application that uses blockchain technology and AI to help users build better habits through financial incentives and automated tracking.

## 🌟 Features

### 🔐 Authentication & Security
- Email-based authentication using Passport.js
- JWT token-based sessions
- Secure password hashing with bcrypt
- Protected API routes

### 💰 Crypto Integration
- MetaMask wallet integration
- Polygon network support
- Automated staking and punishment transactions
- Meme coin rewards (SHIBA, PEPE)
- Real-time transaction tracking

### 🤖 AI-Powered Features
- Eliza AI assistant powered by Comput3 (LLaMA 3)
- Personalized habit feedback and analysis
- Automated habit tracking and reminders
- Smart recommendations and insights

### 📊 Habit Management
- Create and track daily/weekly habits
- Set custom stake amounts (default: 5 MATIC)
- Visual progress tracking with streaks
- Detailed analytics and statistics

### ⚡ Automated Systems
- Daily habit checks and reminders
- Automatic punishment for missed habits
- Reward distribution for successful streaks
- Weekly summaries and insights

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Authentication**: Passport.js with JWT
- **Database**: MongoDB with Mongoose ODM
- **Blockchain**: Web3.js + Ethers.js for Polygon
- **AI**: Comput3 integration with LLaMA 3
- **Scheduling**: Node-cron for automated tasks

### Frontend (React)
- **UI Framework**: React 18 with Hooks
- **Styling**: Tailwind CSS with custom glass morphism
- **State Management**: React Context API
- **Routing**: React Router v6
- **Notifications**: React Hot Toast

### Key Services
- **Eliza AI Service**: AI-powered habit coaching
- **Web3 Service**: Blockchain transaction management
- **Habit Processor**: Core habit logic and punishments
- **Scheduler**: Automated task management

## 🚀 Quick Deployment for Hackathon

### Prerequisites
- Node.js 16+ 
- GitHub account
- Vercel account (free)
- MongoDB Atlas account (free)

### 1. Clone and Setup
```bash
git clone https://github.com/yourusername/stake-for-shame.git
cd stake-for-shame
npm install
cd client && npm install && cd ..
```

### 2. Deploy to Vercel (Recommended for Hackathon)

#### Option A: Automatic Deployment
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for hackathon deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure as follows:
     - **Framework Preset**: Other
     - **Root Directory**: `./`
     - **Build Command**: `npm run build`
     - **Output Directory**: `client/build`
     - **Install Command**: `npm install && cd client && npm install`

3. **Set Environment Variables** in Vercel dashboard:
   ```env
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your-super-secret-jwt-key-here
   SESSION_SECRET=your-session-secret-here
   ```

4. **Deploy** and get your live URL!

#### Option B: Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Set Up MongoDB Atlas
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Get connection string and add to Vercel environment variables
4. Replace `<password>` and `<dbname>` in connection string

### 4. Test Your Deployment
- Visit your Vercel URL
- Test user registration/login
- Create a habit
- Test wallet connection
- Verify AI assistant works

## 🎯 Hackathon Submission Checklist

- [ ] **Live Demo URL**: Your Vercel deployment is working
- [ ] **GitHub Repository**: Code is pushed and public
- [ ] **Demo Video**: 2-3 minute walkthrough recorded
- [ ] **Documentation**: README.md is complete
- [ ] **Features Working**: All core features functional
- [ ] **Mobile Responsive**: Works on mobile devices
- [ ] **No Console Errors**: Clean browser console
- [ ] **API Endpoints**: All routes responding correctly

## 📁 Project Structure

```
stake-for-shame/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── package.json
├── models/                 # MongoDB models
│   ├── User.js
│   ├── Habit.js
│   ├── HabitLog.js
│   └── Transaction.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── habits.js
│   ├── wallet.js
│   ├── ai.js
│   └── transactions.js
├── services/               # Business logic
│   ├── eliza.js           # AI service
│   ├── web3.js            # Blockchain service
│   ├── habitProcessor.js  # Habit logic
│   └── scheduler.js       # Automated tasks
├── middleware/             # Express middleware
│   ├── auth.js
│   └── wallet.js
├── server.js              # Main server file
├── vercel.json            # Vercel configuration
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Habits
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create new habit
- `GET /api/habits/:id` - Get specific habit
- `POST /api/habits/:id/log` - Log habit completion
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit

### Wallet
- `POST /api/wallet/connect` - Connect wallet
- `GET /api/wallet/info` - Get wallet info
- `GET /api/wallet/balance` - Get balance
- `POST /api/wallet/disconnect` - Disconnect wallet

### AI Assistant
- `POST /api/ai/chat` - Chat with Eliza
- `GET /api/ai/insights` - Get AI insights
- `POST /api/ai/feedback` - Get habit feedback

### Transactions
- `GET /api/transactions` - Get transaction history
- `GET /api/transactions/:id` - Get specific transaction
- `GET /api/transactions/summary/stats` - Get transaction summary

## 🎮 Usage Guide

### 1. Getting Started
1. Register an account with your email
2. Connect your MetaMask wallet
3. Create your first habit with a stake amount
4. Start tracking your progress daily

### 2. Habit Management
- **Create Habit**: Set name, description, days of the week, and stake amount
- **Track Progress**: Log completion or failure daily
- **View Analytics**: Monitor streaks, completion rates, and statistics
- **Receive Rewards**: Earn back staked amounts and meme coins for 7-day streaks

### 3. AI Assistant
- **Chat with Eliza**: Get personalized advice and motivation
- **Receive Feedback**: AI-powered habit analysis and suggestions
- **Smart Insights**: Automated recommendations based on your progress

### 4. Wallet Integration
- **Connect Wallet**: Link MetaMask for crypto transactions
- **View Balance**: Check MATIC and token balances
- **Track Transactions**: Monitor all staking, punishment, and reward transactions

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Fork the repository
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_production_jwt_secret
SESSION_SECRET=your_production_session_secret
OPENAI_API_KEY=your_comput3_api_key
POLYGON_RPC_URL=your_polygon_rpc_url
PRIVATE_KEY=your_production_private_key
```

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Hackathon Submission

**Project Name**: Stake-for-Shame  
**Live Demo**: [Your Vercel URL]  
**GitHub**: [Your Repository URL]  
**Demo Video**: [Your Demo Video URL]  

**Key Features**:
- ✅ User authentication and registration
- ✅ Habit creation and tracking
- ✅ Crypto staking and punishment system
- ✅ AI-powered habit coaching
- ✅ Wallet integration (MetaMask)
- ✅ Real-time analytics and insights
- ✅ Mobile-responsive design
- ✅ Automated habit checking
- ✅ Meme coin rewards system

**Tech Stack**:
- Frontend: React 18, Tailwind CSS, Framer Motion
- Backend: Node.js, Express.js, MongoDB
- Blockchain: Web3.js, Ethers.js, Polygon
- AI: Comput3 API with LLaMA 3
- Deployment: Vercel, MongoDB Atlas

---

**Good luck with your hackathon submission! 🚀**
