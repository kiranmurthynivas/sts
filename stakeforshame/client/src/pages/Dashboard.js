import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { 
  FaPlus, 
  FaList, 
  FaWallet, 
  FaChartLine, 
  FaTrophy, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { isConnected, balance } = useWallet();
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [habitsResponse, statsResponse] = await Promise.all([
        axios.get('/api/habits'),
        axios.get('/api/ai/insights')
      ]);

      setHabits(habitsResponse.data.habits || []);
      setStats(statsResponse.data.insights || {});
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleHabitLog = async (habitId, completed) => {
    try {
      await axios.post(`/api/habits/${habitId}/log`, { completed });
      toast.success(completed ? 'Habit completed!' : 'Habit marked as failed');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to log habit:', error);
      toast.error('Failed to log habit');
    }
  };

  const getTodayHabits = () => {
    return habits.filter(habit => habit.shouldBeDoneToday);
  };

  const getCompletedToday = () => {
    return habits.filter(habit => 
      habit.shouldBeDoneToday && habit.todayLog?.completed
    );
  };

  const getPendingToday = () => {
    return habits.filter(habit => 
      habit.shouldBeDoneToday && !habit.todayLog
    );
  };

  const getFailedToday = () => {
    return habits.filter(habit => 
      habit.shouldBeDoneToday && habit.todayLog && !habit.todayLog.completed
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.username || user?.email}!
            </h1>
            <p className="text-gray-300">
              Ready to build better habits today?
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-gray-300">
              {getTodayHabits().length} habits scheduled today
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-white mb-2">
            {getTodayHabits().length}
          </div>
          <div className="text-gray-300">Today's Habits</div>
        </div>
        <div className="glass rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {getCompletedToday().length}
          </div>
          <div className="text-gray-300">Completed</div>
        </div>
        <div className="glass rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {getPendingToday().length}
          </div>
          <div className="text-gray-300">Pending</div>
        </div>
        <div className="glass rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-red-400 mb-2">
            {getFailedToday().length}
          </div>
          <div className="text-gray-300">Failed</div>
        </div>
      </div>

      {/* Today's Habits */}
      <div className="glass rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Today's Habits</h2>
          <Link
            to="/habits"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
          >
            <FaPlus />
            <span>New Habit</span>
          </Link>
        </div>

        {getTodayHabits().length === 0 ? (
          <div className="text-center py-8">
            <FaList className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No habits scheduled for today</h3>
            <p className="text-gray-300 mb-4">
              Create some habits to start your accountability journey
            </p>
            <Link
              to="/habits"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              Create Your First Habit
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {getTodayHabits().map((habit) => (
              <div key={habit._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {habit.todayLog?.completed ? (
                      <FaCheckCircle className="h-5 w-5 text-green-400" />
                    ) : habit.todayLog ? (
                      <FaTimesCircle className="h-5 w-5 text-red-400" />
                    ) : (
                      <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{habit.name}</h3>
                    <p className="text-gray-400">
                      Stake: {habit.stakeAmount} MATIC • Streak: {habit.currentStreak} days
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!habit.todayLog && (
                    <>
                      <button
                        onClick={() => handleHabitLog(habit._id, true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleHabitLog(habit._id, false)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        Fail
                      </button>
                    </>
                  )}
                  {habit.todayLog && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      habit.todayLog.completed 
                        ? 'bg-green-500 bg-opacity-20 text-green-400'
                        : 'bg-red-500 bg-opacity-20 text-red-400'
                    }`}>
                      {habit.todayLog.completed ? 'Completed' : 'Failed'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/habits"
          className="glass rounded-lg p-6 hover:bg-opacity-20 transition-all duration-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500 bg-opacity-20">
              <FaList className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white">Manage Habits</h3>
              <p className="text-gray-300">Create and track your habits</p>
            </div>
          </div>
        </Link>

        <Link
          to="/wallet"
          className="glass rounded-lg p-6 hover:bg-opacity-20 transition-all duration-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 bg-opacity-20">
              <FaWallet className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white">Wallet</h3>
              <p className="text-gray-300">
                {isConnected ? 'Manage your wallet' : 'Connect your wallet'}
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/ai"
          className="glass rounded-lg p-6 hover:bg-opacity-20 transition-all duration-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 bg-opacity-20">
              <FaChartLine className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white">AI Assistant</h3>
              <p className="text-gray-300">Get personalized insights</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
