# Stake for Shame 🚀

A crypto-powered AI habit accountability app where users stake crypto as a commitment to their habits. If they fail, they lose money. If they succeed, they get it back — with bonus meme coins.

## 🚀 Features

- 🔐 Email authentication with Passport.js
- 🧧 MetaMask wallet integration
- 🤖 AI-powered habit tracking with ElizaOS
- 💰 Crypto staking and rewards
- 📊 Habit dashboard with streak tracking
- 💬 Interactive AI chat interface
- 🌙 Dark/light mode

## 🛠 Tech Stack

- ⚡ Next.js 14 (App Router)
- 🎨 Tailwind CSS
- 🗄 Supabase
- 🔗 WalletConnect
- 🤖 ElizaOS + LLaMA 3
- 🔐 NextAuth.js
- 📦 TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- MetaMask wallet

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/stake-for-shame.git
   cd stake-for-shame
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.local.example .env.local
   ```
   Update the values in `.env.local` with your credentials.

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Comput3 AI
COMPUT3_API_KEY=your-comput3-api-key
COMPUT3_API_URL=https://api.comput3.ai/v1

# AI Models
SMALL_OPENAI_MODEL=llama3:70b
MEDIUM_OPENAI_MODEL=llama3:70b
LARGE_OPENAI_MODEL=llama3:70b

# Blockchain
CHAIN_ID=1  # 1 for Ethereum mainnet, 137 for Polygon
CONTRACT_ADDRESS=your-contract-address

# App Settings
APP_NAME="Stake for Shame"
APP_URL=http://localhost:3000

# Feature Flags
ENABLE_TEST_MODE=false
```

## 🗄 Database Schema

### Users
- `id` - UUID (Primary Key)
- `email` - string (unique)
- `password` - string (hashed)
- `wallet_address` - string (nullable)
- `created_at` - timestamp
- `updated_at` - timestamp

### Habits
- `id` - UUID (Primary Key)
- `user_id` - UUID (Foreign Key to Users)
- `name` - string
- `days` - string[] (e.g., ['mon', 'wed', 'fri'])
- `amount_staked` - decimal
- `streak` - integer
- `status` - enum('active', 'completed', 'failed')
- `created_at` - timestamp
- `updated_at` - timestamp

### Transactions
- `id` - UUID (Primary Key)
- `habit_id` - UUID (Foreign Key to Habits)
- `user_id` - UUID (Foreign Key to Users)
- `type` - enum('stake', 'penalty', 'reward')
- `amount` - decimal
- `tx_hash` - string (blockchain transaction hash)
- `created_at` - timestamp

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [ElizaOS](https://github.com/elizaOS/eliza)
- [RainbowKit](https://www.rainbowkit.com/)
- [Tailwind CSS](https://tailwindcss.com/)
