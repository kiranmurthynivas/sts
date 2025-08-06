# Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Authentication
NEXTAUTH_SECRET=generate-with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Comput3 AI Configuration
COMPUT3_API_KEY=your-comput3-api-key
COMPUT3_API_URL=https://api.comput3.ai/v1

# AI Models
SMALL_OPENAI_MODEL=llama3:70b
MEDIUM_OPENAI_MODEL=llama3:70b
LARGE_OPENAI_MODEL=llama3:70b

# Blockchain Configuration
CHAIN_ID=1  # 1 for Ethereum, 137 for Polygon
CONTRACT_ADDRESS=0x...  # Your smart contract address

# App Settings
APP_NAME="Stake for Shame"
APP_URL=http://localhost:3000

# Feature Flags
ENABLE_TEST_MODE=false
```

## Generating a Secure Secret

For production, generate a secure random secret for `NEXTAUTH_SECRET` using:

```bash
# On Linux/macOS
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## Supabase Setup

1. Create a new project at [Supabase](https://supabase.com/)
2. Enable Row Level Security (RLS) on all tables
3. Run the SQL migration from `supabase/migrations/20240101000000_initial_schema.sql`
4. Get your project URL and anon key from Project Settings > API

## Smart Contract

Deploy the StakeForShame smart contract (not included) and update the `CONTRACT_ADDRESS` with the deployed address.

## Testing

For development, you can set `ENABLE_TEST_MODE=true` to bypass blockchain transactions.
