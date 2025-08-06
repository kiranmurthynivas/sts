// Environment configuration
export const env = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // Authentication
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  
  // Comput3 AI
  COMPUT3_API_KEY: process.env.COMPUT3_API_KEY || '',
  COMPUT3_API_URL: process.env.COMPUT3_API_URL || 'https://api.comput3.ai/v1',
  
  // AI Models
  SMALL_OPENAI_MODEL: process.env.SMALL_OPENAI_MODEL || 'llama3:70b',
  MEDIUM_OPENAI_MODEL: process.env.MEDIUM_OPENAI_MODEL || 'llama3:70b',
  LARGE_OPENAI_MODEL: process.env.LARGE_OPENAI_MODEL || 'llama3:70b',
  
  // Blockchain
  CHAIN_ID: process.env.CHAIN_ID || '1', // 1 for Ethereum mainnet, 137 for Polygon
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || '',
  
  // App Settings
  APP_NAME: 'Stake for Shame',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  
  // Feature Flags
  ENABLE_TEST_MODE: process.env.ENABLE_TEST_MODE === 'true',
} as const;

// Validate required environment variables
export function validateEnv() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXTAUTH_SECRET',
  ] as const;

  const missingVars = requiredVars.filter(
    (key) => !process.env[key] && !env[key as keyof typeof env]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

// Call validate on module load
if (typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    console.error(error);
    // Don't throw in development to allow for easier setup
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}
