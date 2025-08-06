import { supabase } from '@/lib/supabase/client';
import { Habit, TransactionType, TransactionTypeEnum } from '@/types/database.types';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// ABI for the StakeForShame contract
const STAKE_FOR_SHAME_ABI = [
  'function createHabit(string memory name, uint256 amount, uint256 duration, uint256[] calldata days) external returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
];

// Contract address - should be in your environment variables
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

export interface CreateHabitParams {
  name: string;
  description: string;
  amount: string; // In MATIC
  days: number[]; // 0-6 for Sunday-Saturday
  duration: number; // in days
  userId: string;
  walletAddress: string;
}

export const createHabit = async ({
  name,
  description,
  amount,
  days,
  duration,
  userId,
  walletAddress,
}: CreateHabitParams): Promise<{ habit: Habit; txHash: string }> => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    // 1. Convert MATIC to wei
    const amountInWei = ethers.parseEther(amount);

    // 2. Initialize contract
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, STAKE_FOR_SHAME_ABI, signer);

    // 3. Check and approve token allowance if needed
    const allowance = await contract.allowance(walletAddress, CONTRACT_ADDRESS);
    if (allowance < amountInWei) {
      const maxUint256 = ethers.MaxUint256;
      const approveTx = await contract.approve(CONTRACT_ADDRESS, maxUint256);
      await approveTx.wait();
    }

    // 4. Call the smart contract to create habit and stake tokens
    const tx = await contract.createHabit(
      name,
      amountInWei,
      duration * 24 * 60 * 60, // Convert days to seconds
      days
    );

    const receipt = await tx.wait();
    const txHash = receipt.transactionHash;

    // 5. Create habit record in Supabase
    const { data: habit, error } = await supabase
      .from('habits')
      .insert([
        {
          user_id: userId,
          name,
          description,
          amount_staked: amount,
          days,
          duration_days: duration,
          status: 'active',
          start_date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // 6. Create transaction record
    await createTransaction({
      habitId: habit.id,
      userId,
      type: 'stake',
      amount,
      txHash,
    });

    return { habit, txHash };
  } catch (error) {
    console.error('Error creating habit:', error);
    throw new Error('Failed to create habit: ' + (error as Error).message);
  }
};

interface CreateTransactionParams {
  habitId: string;
  userId: string;
  type: TransactionType;
  amount: string;
  txHash: string;
  metadata?: Record<string, unknown>;
}

export const createTransaction = async ({
  habitId,
  userId,
  type,
  amount,
  txHash,
  metadata,
}: CreateTransactionParams) => {
  const { data, error } = await supabase.from('transactions').insert([
    {
      habit_id: habitId,
      user_id: userId,
      type,
      amount,
      tx_hash: txHash,
      metadata,
    },
  ]);

  if (error) throw error;
  return data;
};

// Get user's habits
export const getUserHabits = async (userId: string) => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Get habit by ID
export const getHabitById = async (habitId: string, userId: string) => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('id', habitId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

// Log habit completion
export const logHabitCompletion = async (habitId: string, userId: string) => {
  // Check if already logged today
  const today = new Date().toISOString().split('T')[0];
  
  const { data: existingLog, error: logError } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .gte('completed_at', `${today}T00:00:00`)
    .lte('completed_at', `${today}T23:59:59`)
    .maybeSingle();

  if (logError) throw logError;
  if (existingLog) return { success: false, message: 'Habit already logged today' };

  // Create new log
  const { error } = await supabase.from('habit_logs').insert([
    {
      habit_id: habitId,
      user_id: userId,
      completed_at: new Date().toISOString(),
    },
  ]);

  if (error) throw error;

  // Update streak count
  await updateHabitStreak(habitId);

  return { success: true, message: 'Habit logged successfully' };
};

// Update habit streak
const updateHabitStreak = async (habitId: string) => {
  // Get all logs for this habit
  const { data: logs, error: logsError } = await supabase
    .from('habit_logs')
    .select('completed_at')
    .eq('habit_id', habitId)
    .order('completed_at', { ascending: false });

  if (logsError) throw logsError;

  // Calculate current streak
  let streak = 0;
  let prevDate: Date | null = null;
  
  for (const log of logs) {
    const currentDate = new Date(log.completed_at);
    currentDate.setHours(0, 0, 0, 0);
    
    if (!prevDate) {
      // First log
      streak = 1;
    } else {
      // Check if consecutive days
      const diffTime = Math.abs(prevDate.getTime() - currentDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else if (diffDays > 1) {
        // Streak broken
        break;
      }
    }
    
    prevDate = currentDate;
  }

  // Update habit with new streak
  const { error: updateError } = await supabase
    .from('habits')
    .update({ streak })
    .eq('id', habitId);

  if (updateError) throw updateError;
  
  return streak;
};
