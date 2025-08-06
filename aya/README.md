# 🎯 Stake-for-Shame

A crypto-powered habit accountability application that uses blockchain technology to keep you committed to your goals. Put your MATIC where your mouth is!

## 🌟 Features

- **Email Authentication**: Secure login with Passport.js
- **MetaMask Integration**: Connect your wallet for crypto transactions
- **Habit Creation**: Set up habits with custom schedules and stake amounts
- **Daily Tracking**: Log your progress with streak tracking
- **Crypto Punishment**: Automatic MATIC staking when you miss habits
- **Reward System**: Earn rewards for 7-day streaks
- **AI Coach**: Eliza AI provides motivation and accountability
- **Transaction History**: Track all your crypto accountability transactions

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** - Database for users, habits, and transactions
- **Passport.js** - Email-based authentication
- **Mongoose** - MongoDB object modeling
- **Node-cron** - Automated daily habit evaluation

### Frontend
- **React.js** - User interface
- **Axios** - HTTP client
- **React Router** - Navigation

### Blockchain
- **Ethers.js** - Ethereum/Polygon interaction
- **MetaMask** - Browser wallet integration
- **Polygon Network** - Low-cost transactions

### AI Integration
- **ElizaOS** - AI habit coach
- **Comput3 API** - LLaMA 3 model hosting
- **MCP Protocol** - AI-powered transaction execution

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stake-for-shame
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   Copy `.env.example` to `.env` and configure:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/stake-for-shame
   
   # Session Secret
   SESSION_SECRET=your-super-secret-session-key-change-this-in-production
   
   # Comput3 AI Configuration (ElizaOS)
   OPENAI_API_KEY=your-comput3-api-key
   OPENAI_API_URL=https://api.comput3.ai/v1
   
   # Blockchain Configuration
   CHARITY_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D2b9E4F3C07e3F8A
   NETWORK_RPC_URL=https://polygon-rpc.com/
   CHAIN_ID=137
   
   # Application Configuration
   PORT=3000
   NODE_ENV=development
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system.

6. **Run the application**
   
   **Development mode (both backend and frontend):**
   ```bash
   # Terminal 1 - Backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run client
   ```
   
   **Production mode:**
   ```bash
   npm run build
   npm start
   ```

## 📱 Usage

### 1. **Account Setup**
- Register with your email address
- Connect your MetaMask wallet
- Switch to Polygon network if needed

### 2. **Create Habits**
- Click "Create New Habit"
- Set habit name and description
- Choose days of the week
- Set stake amount (MATIC per missed day)

### 3. **Daily Tracking**
- Log into the dashboard daily
- Mark habits as completed or failed
- View your current streaks and stats

### 4. **Accountability System**
- **First miss**: Stake amount goes to holding contract
- **Second miss**: All staked MATIC goes to charity
- **7-day streak**: Get your stake back + bonus rewards

### 5. **AI Coach**
- Eliza provides daily reminders
- Motivational messages for successes and failures
- Smart notifications based on your progress

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/connect-wallet` - Connect MetaMask wallet

### Habits
- `GET /api/habits` - Get user's habits
- `POST /api/habits` - Create new habit
- `GET /api/habits/:id` - Get specific habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/log` - Log habit completion

### Transactions
- `GET /api/transactions` - Get transaction history
- `GET /api/transactions/:id` - Get specific transaction
- `PUT /api/transactions/:id/status` - Update transaction status

## 🤖 AI Integration

The app uses ElizaOS running on Comput3's free GPU infrastructure:

- **Model**: LLaMA 3 (70B parameters)
- **Daily Reminders**: 9:00 AM
- **Daily Evaluation**: 11:00 PM
- **MCP Protocol**: Automated punishment/reward execution

## 🔐 Security Features

- **Session Management**: Secure cookie-based sessions
- **Input Validation**: Server-side validation for all inputs
- **Wallet Verification**: Address validation and ownership checks
- **Transaction Monitoring**: Real-time blockchain confirmation tracking

## 📊 Database Schema

### Users
- Email, password (hashed)
- Wallet address and connection status
- Total staked and rewards earned

### Habits
- Name, description, schedule
- Stake amount and current streak
- Success/failure tracking

### Habit Logs
- Daily completion records
- Notes and timestamps
- Punishment/reward triggers

### Transactions
- Blockchain transaction records
- Status tracking and confirmations
- Gas usage and block numbers

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Live streak counters and stats
- **Visual Feedback**: Color-coded success/failure indicators
- **Progress Tracking**: Activity dots and streak visualizations
- **Wallet Integration**: Seamless MetaMask connection flow

## 🚨 Troubleshooting

### Common Issues

1. **MetaMask Connection Failed**
   - Ensure MetaMask is installed and unlocked
   - Switch to Polygon network
   - Refresh the page and try again

2. **Transaction Failed**
   - Check wallet balance (need MATIC for gas)
   - Verify network connection
   - Try increasing gas limit

3. **Habit Not Logging**
   - Ensure wallet is connected
   - Check if habit is scheduled for today
   - Verify you haven't already logged today

4. **AI Coach Not Responding**
   - Check Comput3 API key configuration
   - Verify internet connection
   - Check server logs for errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **ElizaOS** - AI agent framework
- **Comput3** - Free GPU hosting for AI models
- **Polygon** - Low-cost blockchain transactions
- **MetaMask** - Wallet integration

## 📞 Support

For support, email support@stake-for-shame.com or create an issue in the repository.

---

**Remember**: This app involves real cryptocurrency transactions. Only stake amounts you can afford to lose, and always verify transactions before confirming them in MetaMask.

**Stay accountable! 💪**
