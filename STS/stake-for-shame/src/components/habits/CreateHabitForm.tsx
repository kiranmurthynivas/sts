import React from 'react';
import { DayOfWeek } from '@/types/database.types';
import { useHabitForm } from '@/hooks/useHabitForm';
import { getShortDayName } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday

export const CreateHabitForm: React.FC = () => {
  const router = useRouter();
  const {
    name,
    description,
    amount,
    duration,
    selectedDays,
    isSubmitting,
    error,
    success,
    setName,
    setDescription,
    setAmount,
    setDuration,
    toggleDay,
    handleSubmit,
  } = useHabitForm();

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Habit</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            What habit do you want to build? *
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Exercise for 30 minutes"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add details about your habit..."
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Stake Amount (MATIC) *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="amount"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pr-12 sm:text-sm rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
                required
                disabled={isSubmitting}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">MATIC</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              This amount will be staked and can be lost if you don't complete your habit.
            </p>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration (days) *
            </label>
            <div className="mt-1">
              <input
                type="number"
                id="duration"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={isSubmitting}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              How many days will you commit to this habit?
            </p>
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Select days of the week *
          </span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                disabled={isSubmitting}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedDays.includes(day)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {getShortDayName(day)}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Select the days you'll perform this habit each week.
          </p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || selectedDays.length === 0 || !name || !amount}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting || selectedDays.length === 0 || !name || !amount
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Creating Habit...' : 'Create Habit & Stake MATIC'}
          </button>
          
          <p className="mt-2 text-xs text-center text-gray-500">
            By creating this habit, you agree to our Terms of Service and acknowledge that staked funds may be forfeited if you don't complete your habit.
          </p>
        </div>
      </form>
    </div>
  );
};
