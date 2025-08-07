import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Wallet, 
  LogOut, 
  User,
  Activity,
  Award,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';

const Dashboard = ({ user, wallet, walletAddress, connectWallet, logout }) => {
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHabits: 0,
    activeHabits: 0,
    completedToday: 0,
    totalStaked: 0
  });

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
      
      // Calculate stats
      const totalHabits = response.data.length;
      const activeHabits = response.data.filter(h => h.status === 'active').length;
      const completedToday = response.data.filter(h => {
        const today = new Date().toISOString().split('T')[0];
        return h.last_action_date === today;
      }).length;
      const totalStaked = response.data.reduce((sum, h) => sum + (h.stake_amount || 0), 0);
      
      setStats({
        totalHabits,
        activeHabits,
        completedToday,
        totalStaked
      });
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
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

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Stake-for-Shame</h1>
              <div className="flex items-center space-x-2 text-gray-400">
                <User className="h-4 w-4" />
                <span>{user?.name || user?.email}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {walletAddress ? (
                <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-2">
                  <Wallet className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
              
              <button
                onClick={logout}
                className="btn-secondary flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Habits</p>
                <p className="text-2xl font-bold text-white">{stats.totalHabits}</p>
              </div>
              <Target className="h-8 w-8 text-primary-400" />
            </div>
          </div>
          
          <div className="glass rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Habits</p>
                <p className="text-2xl font-bold text-white">{stats.activeHabits}</p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="glass rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed Today</p>
                <p className="text-2xl font-bold text-white">{stats.completedToday}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="glass rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Staked</p>
                <p className="text-2xl font-bold text-white">{stats.totalStaked} MATIC</p>
              </div>
              <Wallet className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/create-habit"
              className="glass rounded-lg p-6 hover:bg-dark-700 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-primary-500/20 rounded-lg p-3">
                  <Plus className="h-6 w-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Create New Habit</h3>
                  <p className="text-gray-400">Set up a new habit with crypto staking</p>
                </div>
              </div>
            </Link>
            
            <Link
              to="/habits"
              className="glass rounded-lg p-6 hover:bg-dark-700 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-green-500/20 rounded-lg p-3">
                  <Target className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Track Habits</h3>
                  <p className="text-gray-400">View and manage your habits</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Habits */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Habits</h2>
            <Link to="/habits" className="text-primary-400 hover:text-primary-300 text-sm">
              View all
            </Link>
          </div>
          
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
              <Link to="/create-habit" className="btn-primary">
                Create First Habit
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.slice(0, 6).map((habit) => (
                <div key={habit.id} className="glass rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{habit.habit_name}</h3>
                    <div className={`flex items-center space-x-1 ${getStatusColor(habit.status)}`}>
                      {getStatusIcon(habit.status)}
                      <span className="text-sm capitalize">{habit.status}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Stake Amount:</span>
                      <span className="text-white">{habit.stake_amount} MATIC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Streak:</span>
                      <span className="text-white">{habit.streak} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Days:</span>
                      <span className="text-white">{habit.days?.join(', ') || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <Link
                      to={`/habits`}
                      className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
