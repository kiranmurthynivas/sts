// Database schema types
export type UserRole = 'user' | 'admin';

export type HabitStatus = 'active' | 'completed' | 'failed' | 'cancelled';
export type TransactionType = 'stake' | 'penalty' | 'reward' | 'refund';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  password: string; // Hashed
  wallet_address: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  days: DayOfWeek[];
  amount_staked: string; // Stored as string to handle large numbers
  streak: number;
  status: HabitStatus;
  duration_days: number;
  start_date: string;
  last_checked: string | null;
  created_at: string;
  updated_at: string;
  // Virtual fields (not in database)
  progress?: number;
  next_checkin?: string;
}

export interface Transaction {
  id: string;
  habit_id: string;
  user_id: string;
  type: TransactionType;
  amount: string; // Stored as string to handle large numbers
  tx_hash: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  // Virtual fields (not in database)
  status?: 'pending' | 'confirmed' | 'failed';
  timestamp?: string;
}

// Database enums for type safety
export const HabitStatusEnum: Record<Uppercase<HabitStatus>, HabitStatus> = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const TransactionTypeEnum: Record<Uppercase<TransactionType>, TransactionType> = {
  STAKE: 'stake',
  PENALTY: 'penalty',
  REWARD: 'reward',
  REFUND: 'refund',
} as const;

export const DayOfWeekEnum: Record<string, DayOfWeek> = {
  '0': 0, // Sunday
  '1': 1, // Monday
  '2': 2, // Tuesday
  '3': 3, // Wednesday
  '4': 4, // Thursday
  '5': 5, // Friday
  '6': 6, // Saturday
} as const;

// Helper to get day names for display
// 0 = Sunday, 1 = Monday, etc.
export const getDayName = (day: DayOfWeek): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] || '';
};

// Helper to get short day names for display
export const getShortDayName = (day: DayOfWeek): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[day] || '';
};

// Type guards
export const isHabitStatus = (status: unknown): status is HabitStatus => {
  return typeof status === 'string' && Object.values(HabitStatusEnum).includes(status as HabitStatus);
};

export const isTransactionType = (type: unknown): type is TransactionType => {
  return typeof type === 'string' && Object.values(TransactionTypeEnum).includes(type as TransactionType);
};

export const isDayOfWeek = (day: unknown): day is DayOfWeek => {
  return typeof day === 'number' && day >= 0 && day <= 6;
};

// Convert string to DayOfWeek (useful for form inputs)
export const toDayOfWeek = (value: string | number): DayOfWeek | null => {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  return isDayOfWeek(num) ? num : null;
};
