import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Calendar, Coins, Save } from 'lucide-react';
import axios from 'axios';

const CreateHabit = ({ user, wallet, walletAddress }) => {
  const [formData, setFormData] = useState({
    habit_name: '',
    stake_amount: '',
    days: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const daysOfWeek = [
    { value: 'Sunday', label: 'Sunday' },
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.habit_name.trim()) {
      setError('Habit name is required');
      setIsLoading(false);
      return;
    }

    if (formData.days.length === 0) {
      setError('Please select at least one day');
      setIsLoading(false);
      return;
    }

    if (!formData.stake_amount || parseFloat(formData.stake_amount) <= 0) {
      setError('Please enter a valid stake amount');
      setIsLoading(false);
      return;
    }

    if (!walletAddress) {
      setError('Please connect your wallet first');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/habits', {
        habit_name: formData.habit_name,
        stake_amount: parseFloat(formData.stake_amount),
        days: formData.days
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Here you would typically handle the crypto staking transaction
      // For now, we'll just navigate to the habits page
      navigate('/habits');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create habit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <h1 className="text-2xl font-bold text-white">Create New Habit</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass rounded-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Set Up Your Habit</h2>
            <p className="text-gray-400">
              Create a new habit with crypto staking to keep yourself accountable
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {!walletAddress && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
              <p className="text-yellow-400 text-sm">
                Please connect your wallet to create a habit with crypto staking.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Habit Name */}
            <div>
              <label htmlFor="habit_name" className="block text-sm font-medium text-gray-300 mb-2">
                Habit Name
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="habit_name"
                  name="habit_name"
                  type="text"
                  required
                  value={formData.habit_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="e.g., Go to gym, Read 30 minutes, Meditate"
                />
              </div>
            </div>

            {/* Days of Week */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Days of the Week
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {daysOfWeek.map((day) => (
                  <label
                    key={day.value}
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.days.includes(day.value)
                        ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                        : 'bg-dark-800 border-gray-600 text-gray-300 hover:bg-dark-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.days.includes(day.value)}
                      onChange={() => handleDayToggle(day.value)}
                      className="sr-only"
                    />
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stake Amount */}
            <div>
              <label htmlFor="stake_amount" className="block text-sm font-medium text-gray-300 mb-2">
                Stake Amount (MATIC)
              </label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="stake_amount"
                  name="stake_amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.stake_amount}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="0.00"
                />
              </div>
              <p className="text-gray-400 text-sm mt-1">
                This amount will be staked and can be lost if you fail to complete your habit
              </p>
            </div>

            {/* Summary */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Habit Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Habit Name:</span>
                  <span className="text-white font-medium">
                    {formData.habit_name || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Days:</span>
                  <span className="text-white font-medium">
                    {formData.days.length > 0 ? formData.days.join(', ') : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stake Amount:</span>
                  <span className="text-white font-medium">
                    {formData.stake_amount ? `${formData.stake_amount} MATIC` : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary px-6 py-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !walletAddress}
                className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Create Habit</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateHabit;
