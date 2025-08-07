import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaCalendar, FaCoins } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    daysOfWeek: [],
    stakeAmount: 5
  });

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await axios.get('/api/habits');
      setHabits(response.data.habits || []);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || formData.daysOfWeek.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingHabit) {
        await axios.put(`/api/habits/${editingHabit._id}`, formData);
        toast.success('Habit updated successfully');
      } else {
        await axios.post('/api/habits', formData);
        toast.success('Habit created successfully');
      }
      
      setShowForm(false);
      setEditingHabit(null);
      setFormData({ name: '', description: '', daysOfWeek: [], stakeAmount: 5 });
      fetchHabits();
    } catch (error) {
      console.error('Failed to save habit:', error);
      toast.error('Failed to save habit');
    }
  };

  const handleDelete = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;
    
    try {
      await axios.delete(`/api/habits/${habitId}`);
      toast.success('Habit deleted successfully');
      fetchHabits();
    } catch (error) {
      console.error('Failed to delete habit:', error);
      toast.error('Failed to delete habit');
    }
  };

  const handleLogCompletion = async (habitId, completed) => {
    try {
      await axios.post(`/api/habits/${habitId}/log`, { completed });
      toast.success(completed ? 'Habit completed!' : 'Habit marked as failed');
      fetchHabits();
    } catch (error) {
      console.error('Failed to log habit:', error);
      toast.error('Failed to log habit');
    }
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">My Habits</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
        >
          <FaPlus />
          <span>New Habit</span>
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {editingHabit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Habit Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Exercise daily"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe your habit..."
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Days of Week</label>
              <div className="grid grid-cols-7 gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      formData.daysOfWeek.includes(day)
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stake Amount (MATIC)</label>
              <input
                type="number"
                value={formData.stakeAmount}
                onChange={(e) => setFormData({...formData, stakeAmount: parseFloat(e.target.value)})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0.1"
                max="1000"
                step="0.1"
                required
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                {editingHabit ? 'Update Habit' : 'Create Habit'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingHabit(null);
                  setFormData({ name: '', description: '', daysOfWeek: [], stakeAmount: 5 });
                }}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {habits.map(habit => (
          <div key={habit._id} className="glass rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white">{habit.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingHabit(habit);
                    setFormData({
                      name: habit.name,
                      description: habit.description || '',
                      daysOfWeek: habit.daysOfWeek,
                      stakeAmount: habit.stakeAmount
                    });
                    setShowForm(true);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(habit._id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            {habit.description && (
              <p className="text-gray-300 mb-4">{habit.description}</p>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FaCoins className="text-yellow-400" />
                <span className="text-white font-medium">{habit.stakeAmount} MATIC</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaCalendar className="text-blue-400" />
                <span className="text-gray-300 text-sm">
                  {habit.currentStreak} day streak
                </span>
              </div>
            </div>

            <div className="flex space-x-2 mb-4">
              {daysOfWeek.map(day => (
                <span
                  key={day}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    habit.daysOfWeek.includes(day)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {day.slice(0, 3)}
                </span>
              ))}
            </div>

            {habit.shouldBeDoneToday && !habit.todayLog && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleLogCompletion(habit._id, true)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FaCheck />
                  <span>Complete</span>
                </button>
                <button
                  onClick={() => handleLogCompletion(habit._id, false)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FaTimes />
                  <span>Failed</span>
                </button>
              </div>
            )}

            {habit.todayLog && (
              <div className={`text-center py-2 px-4 rounded-lg ${
                habit.todayLog.completed
                  ? 'bg-green-600/20 text-green-300 border border-green-500'
                  : 'bg-red-600/20 text-red-300 border border-red-500'
              }`}>
                {habit.todayLog.completed ? '✅ Completed today' : '❌ Failed today'}
              </div>
            )}
          </div>
        ))}
      </div>

      {habits.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-300 text-lg mb-4">No habits created yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
          >
            Create Your First Habit
          </button>
        </div>
      )}
    </div>
  );
};

export default Habits;
