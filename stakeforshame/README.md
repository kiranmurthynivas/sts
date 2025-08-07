# 🚧 Stake-for-Shame

**AI agent-based habit accountability platform with crypto staking** - Built for the Aya AI Hackathon

## 🌟 Features

### 🔐 Authentication
- Email-based login using Passport.js
- JWT token authentication
- Secure password hashing with bcrypt
- User registration and login

### 🌍 Real Crypto Wallet Integration
- MetaMask wallet connection
- Polygon (MATIC) network support
- Real on-chain transactions
- Wallet balance tracking
- Transaction history

### 📝 Habit Management
- Create habits with custom names
- Select days of the week (Sunday to Saturday)
- Set stake amounts in MATIC
- Track habit progress and streaks
- Real-time status updates

### 🤖 AI Agent Integration
- ElizaOS AI agent for habit evaluation
- MCP (Model Context Protocol) for decision making
- Comput3.ai hosting with llama3:70b model
- Intelligent reward/punishment system

### 💸 Crypto Staking System
- Stake MATIC tokens for habit accountability
- Automatic stake deduction on failure
- Charity wallet integration for repeated failures
- Reward system for successful streaks

### 📊 Dashboard & Analytics
- Real-time habit tracking
- Progress visualization
- Transaction history
- Streak monitoring
- Dark theme UI

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Frontend | React + Tailwind CSS |
| Authentication | Passport.js + JWT |
| AI Agent | ElizaOS + MCP |
| AI Hosting | Comput3.ai (llama3:70b) |
| Wallet | MetaMask + ethers.js |
| Blockchain | Polygon (MATIC) |
| Deployment | Vercel (Frontend) + Supabase (Backend) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask browser extension
- Supabase account
- Comput3.ai account

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/stake-for-shame.git
cd stake-for-shame
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Setup
```bash
# Copy environment example
cp env.example .env

# Edit .env with your credentials
nano .env
```

Required environment variables:
```env
OPENAI_API_KEY=your_comput3_api_key
OPENAI_API_URL=https://api.comput3.ai/v1
SMALL_OPENAI_MODEL=llama3:70b
MEDIUM_OPENAI_MODEL=llama3:70b
LARGE_OPENAI_MODEL=llama3:70b
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
CHARITY_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
POLYGON_RPC_URL=https://polygon-rpc.com
```

### 4. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql`
3. Update your `.env` with Supabase credentials

### 5. Start Development Servers
```bash
# Start backend server
npm run dev

# In another terminal, start frontend
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📁 Project Structure

```
stake-for-shame/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Express backend
│   ├── ai-agent.js        # AI agent integration
│   └── ...
├── database/              # Database schema
│   └── schema.sql
├── server.js              # Main server file
├── package.json
├── env.example
└── README.md
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Go to Settings > API
3. Copy the URL and anon key
4. Update your `.env` file

### Comput3.ai Setup
1. Sign up at [Comput3.ai](https://comput3.ai)
2. Get your API key
3. Update your `.env` file

### MetaMask Configuration
1. Install MetaMask browser extension
2. Add Polygon network:
   - Network Name: Polygon
   - RPC URL: https://polygon-rpc.com
   - Chain ID: 137
   - Currency Symbol: MATIC

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Backend (Supabase Functions)
1. Install Supabase CLI
2. Deploy functions to Supabase
3. Set environment variables

### Environment Variables for Production
```env
NODE_ENV=production
SUPABASE_URL=your_production_supabase_url
SUPABASE_KEY=your_production_supabase_key
JWT_SECRET=your_production_jwt_secret
```

## 🤖 AI Agent Features

### Habit Evaluation
- Analyzes habit completion patterns
- Considers streak length and consistency
- Makes intelligent decisions about rewards/punishments

### Decision Making
- **Success**: Returns stakes + bonus for 7-day streaks
- **First Failure**: Deducts stake and warns user
- **Second Failure**: Transfers all stakes to charity

### MCP Integration
- Model Context Protocol for AI decisions
- Structured JSON responses
- Confidence scoring
- Reasoning explanations

## 💰 Crypto Integration

### Staking System
- Users stake MATIC tokens when creating habits
- Stakes are held in smart contracts
- Automatic execution based on AI decisions

### Transaction Types
- **Stake**: Initial stake when creating habit
- **Return**: Return stakes on success
- **Deduct**: Deduct stakes on failure
- **Charity**: Transfer to charity on repeated failure

### Charity Integration
- Public charity wallet for failed habits
- Transparent transaction history
- Blockchain verification

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Row Level Security (RLS) in Supabase
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Habits
- `GET /api/habits` - Get user habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id/complete` - Complete habit
- `PUT /api/habits/:id/fail` - Fail habit

### AI Agent
- `POST /api/ai/evaluate-habit` - AI habit evaluation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Aya AI Hackathon
- Powered by Comput3.ai for AI hosting
- Supabase for backend infrastructure
- MetaMask for wallet integration
- Polygon for blockchain transactions

## 🆘 Support

For support, email support@stakeforshame.com or create an issue on GitHub.

---

**Stake-for-Shame** - Where accountability meets AI and crypto! 🚀
