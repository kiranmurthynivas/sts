import { useState, useCallback } from 'react';
import { DayOfWeek } from '@/types/database.types';
import { createHabit } from '@/services/habitService';
import { useWallet } from '@/contexts/WalletContext';
import { useSession } from 'next-auth/react';

export const useHabitForm = () => {
  const { data: session } = useSession();
  const { isConnected, walletAddress } = useWallet();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('30'); // Default 30 days
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const toggleDay = useCallback((day: DayOfWeek) => {
    setSelectedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  }, []);

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setAmount('');
    setDuration('30');
    setSelectedDays([]);
    setError(null);
    setSuccess(null);
  }, []);

  const validateForm = useCallback(() => {
    if (!name.trim()) {
      setError('Please enter a habit name');
      return false;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid stake amount');
      return false;
    }

    if (selectedDays.length === 0) {
      setError('Please select at least one day');
      return false;
    }

    if (!isConnected || !walletAddress) {
      setError('Please connect your wallet first');
      return false;
    }

    if (!session?.user?.id) {
      setError('Please sign in to create a habit');
      return false;
    }

    return true;
  }, [name, amount, selectedDays, isConnected, walletAddress, session]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!session?.user?.id) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { habit, txHash } = await createHabit({
        name,
        description,
        amount,
        days: selectedDays,
        duration: parseInt(duration, 10),
        userId: session.user.id,
        walletAddress: walletAddress!,
      });

      setSuccess(`Habit "${habit.name}" created successfully!`);
      resetForm();
      return { success: true, habitId: habit.id, txHash };
    } catch (err) {
      console.error('Error creating habit:', err);
      setError(err instanceof Error ? err.message : 'Failed to create habit');
      return { success: false, error: err };
    } finally {
      setIsSubmitting(false);
    }
  }, [name, description, amount, duration, selectedDays, session, walletAddress, validateForm, resetForm]);

  return {
    // Form state
    name,
    description,
    amount,
    duration,
    selectedDays,
    isSubmitting,
    error,
    success,
    
    // Form actions
    setName,
    setDescription,
    setAmount,
    setDuration,
    toggleDay,
    handleSubmit,
    resetForm,
  };
};
