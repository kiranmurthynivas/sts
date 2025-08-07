import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Target, 
  Calendar, 
  Coins, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  AlertTriangle,
  Award,
  Activity,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';

const HabitTracker = ({ user, wallet, walletAddress }) => {
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/habits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setHabits(response.data);
    } catch (error) {
      setError('Failed to fetch habits');
      console.error('Error fetching habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/habits/${habitId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh habits
      await fetchHabits();
    } catch (error) {
      setError('Failed to complete habit');
      console.error('Error completing habit:', error);
    }
  };

  const handleFailHabit = async (habitId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/habits/${habitId}/fail`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh habits
      await fetchHabits();
    } catch (error) {
      setError('Failed to mark habit as failed');
      console.error('Error failing habit:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'failed_once':
        return 'text-yellow-400';
      case 'punished':
        return 'text-red-400';
      case 'completed':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Activity className="h-4 w-4" />;
      case 'failed_once':
        return <AlertTriangle className="h-4 w-4" />;
      case 'punished':
        return <AlertTriangle className="h-4 w-4" />;
      case 'completed':
        return <Award className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-500/20 border-green-500/50 text-green-400',
      failed_once: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
      punished: 'bg-red-500/20 border-red-500/50 text-red-400',
      completed: 'bg-blue-500/20 border-blue-500/50 text-blue-400'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || colors.active}`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  const isTodayScheduled = (habit) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return habit.days?.includes(today);
  };

  const isCompletedToday = (habit) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.last_action_date === today;
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-2xl font-bold text-white">Habit Tracker</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="glass rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading habits...</p>
          </div>
        ) : habits.length === 0 ? (
          <div className="glass rounded-lg p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No habits yet</h3>
            <p className="text-gray-400 mb-4">Create your first habit to get started</p>
            <button
              onClick={() => navigate('/create-habit')}
              className="btn-primary"
            >
              Create First Habit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit) => (
              <div key={habit.id} className="glass rounded-lg p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{habit.habit_name}</h3>
                  {getStatusBadge(habit.status)}
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Stake Amount:</span>
                    <span className="text-white font-medium">{habit.stake_amount} MATIC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Streak:</span>
                    <span className="text-white font-medium">{habit.streak} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Scheduled Days:</span>
                    <span className="text-white font-medium">{habit.days?.join(', ') || 'N/A'}</span>
                  </div>
                  {habit.last_action_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Last Action:</span>
                      <span className="text-white font-medium">
                        {new Date(habit.last_action_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Today's Status */}
                <div className="mb-6">
                  {isTodayScheduled(habit) ? (
                    <div className="bg-dark-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">Today's Task</span>
                        {isCompletedToday(habit) ? (
                          <span className="text-green-400 text-sm flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completed
                          </span>
                        ) : (
                          <span className="text-yellow-400 text-sm flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Pending
                          </span>
                        )}
                      </div>
                      
                      {!isCompletedToday(habit) && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCompleteHabit(habit.id)}
                            className="flex-1 btn-success py-2 px-3 text-sm flex items-center justify-center space-x-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Complete</span>
                          </button>
                          <button
                            onClick={() => handleFailHabit(habit.id)}
                            className="flex-1 btn-danger py-2 px-3 text-sm flex items-center justify-center space-x-1"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Fail</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-dark-800 rounded-lg p-4">
                      <span className="text-gray-400 text-sm">Not scheduled for today</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{habit.streak}/7 days</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((habit.streak / 7) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-600">
                  <button
                    onClick={() => navigate(`/habits/${habit.id}`)}
                    className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>View Details</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                  
                  {habit.status === 'punished' && (
                    <span className="text-red-400 text-sm flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Stakes forfeited
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HabitTracker;
