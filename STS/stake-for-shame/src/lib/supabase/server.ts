import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const createClient = () => {
  return createServerComponentClient<Database>({
    cookies,
  }, {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
};

// Helper function to get the current user
export const getCurrentUser = async () => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

// Helper function to ensure user is authenticated
export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};
