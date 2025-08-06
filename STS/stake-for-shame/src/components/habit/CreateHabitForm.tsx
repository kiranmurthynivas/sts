'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { formatTokenAmount } from '@/lib/utils';
import { DayOfWeek, DayOfWeekEnum } from '@/types/database.types';

type FormData = {
  name: string;
  description: string;
  amount: string;
  days: DayOfWeek[];
  duration: number;
};

export default function CreateHabitForm() {
  const router = useRouter();
  const { address, isConnected, connect } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    amount: '10',
    days: ['mon', 'wed', 'fri'],
    duration: 30,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value
    }));
  };

  const toggleDay = (day: DayOfWeek) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return await connect();
    if (formData.days.length === 0) return setError('Select at least one day');
    
    setIsSubmitting(true);
    try {
      // TODO: Implement habit creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to create habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Habit</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            placeholder="e.g., Morning Run"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            placeholder="Tell us about this habit..."
          />
        </div>

        {/* Days Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
          <div className="flex space-x-2">
            {Object.entries(DayOfWeekEnum).map(([key, day]) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-1 rounded-md text-sm ${
                  formData.days.includes(day)
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {key.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Amount and Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stake (MATIC)</label>
            <input
              type="number"
              name="amount"
              min="0.1"
              step="0.1"
              required
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
            <input
              type="number"
              name="duration"
              min="7"
              max="365"
              required
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Habit'}
        </button>
      </form>
    </div>
  );
}
