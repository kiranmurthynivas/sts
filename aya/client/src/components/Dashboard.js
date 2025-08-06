import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import HabitCard from './HabitCard';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { account, isConnected } = useWallet();
  const [habits, setHabits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHabits: 0,
    activeStreaks: 0,
    totalStaked: 0,
    totalRewards: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch habits
      const habitsResponse = await axios.get('/habits');
      const habitsData = habitsResponse.data.habits || [];
      setHabits(habitsData);

      // Fetch recent transactions
      const transactionsResponse = await axios.get('/transactions?limit=5');
      setTransactions(transactionsResponse.data.transactions || []);

      // Calculate stats
      const totalHabits = habitsData.length;
      const activeStreaks = habitsData.filter(habit => habit.currentStreak > 0).length;
      const totalStaked = habitsData.reduce((sum, habit) => sum + (habit.totalStaked || 0), 0);
      const totalRewards = habitsData.reduce((sum, habit) => sum + (habit.totalRewards || 0), 0);

      setStats({
        totalHabits,
        activeStreaks,
        totalStaked,
        totalRewards
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHabitUpdate = () => {
    fetchDashboardData();
  };

  const getTodayHabits = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return habits.filter(habit => habit.daysOfWeek.includes(today));
  };

  const getUpcomingHabits = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });
    return habits.filter(habit => habit.daysOfWeek.includes(tomorrowDay));
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome back, {user?.email?.split('@')[0]}! 👋</h1>
          <p>Stay accountable to your habits with crypto-powered motivation.</p>
          
          {!user?.isWalletConnected && (
            <div className="wallet-warning">
              <span className="warning-icon">⚠️</span>
              <span>Connect your wallet to start creating habits and staking crypto!</span>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.totalHabits}</h3>
              <p>Total Habits</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <h3>{stats.activeStreaks}</h3>
              <p>Active Streaks</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>{stats.totalStaked.toFixed(2)}</h3>
              <p>MATIC Staked</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h3>{stats.totalRewards.toFixed(2)}</h3>
              <p>MATIC Earned</p>
            </div>
          </div>
        </div>

        {/* Today's Habits */}
        <div className="section">
          <div className="section-header">
            <h2>Today's Habits</h2>
            <Link to="/create-habit" className="create-habit-btn">
              + Create New Habit
            </Link>
          </div>
          
          {getTodayHabits().length > 0 ? (
            <div className="habits-grid">
              {getTodayHabits().map(habit => (
                <HabitCard 
                  key={habit._id} 
                  habit={habit} 
                  onUpdate={handleHabitUpdate}
                  showTodayActions={true}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📅</span>
              <p>No habits scheduled for today!</p>
              {habits.length === 0 && (
                <Link to="/create-habit" className="create-first-habit-btn">
                  Create your first habit
                </Link>
              )}
            </div>
          )}
        </div>

        {/* All Habits */}
        {habits.length > 0 && (
          <div className="section">
            <div className="section-header">
              <h2>All Habits</h2>
              <span className="habit-count">{habits.length} habits</span>
            </div>
            
            <div className="habits-grid">
              {habits.map(habit => (
                <HabitCard 
                  key={habit._id} 
                  habit={habit} 
                  onUpdate={handleHabitUpdate}
                  showTodayActions={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="section">
            <div className="section-header">
              <h2>Recent Transactions</h2>
              <Link to="/transactions" className="view-all-link">
                View All
              </Link>
            </div>
            
            <div className="transactions-list">
              {transactions.map(transaction => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-icon">
                    {transaction.type === 'punishment' && '😱'}
                    {transaction.type === 'reward' && '🏆'}
                    {transaction.type === 'stake' && '💰'}
                    {transaction.type === 'refund' && '↩️'}
                  </div>
                  <div className="transaction-content">
                    <div className="transaction-description">
                      {transaction.description}
                    </div>
                    <div className="transaction-details">
                      {transaction.amount} {transaction.currency} • {transaction.status}
                    </div>
                  </div>
                  <div className="transaction-date">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tomorrow's Preview */}
        {getUpcomingHabits().length > 0 && (
          <div className="section">
            <div className="section-header">
              <h2>Tomorrow's Habits</h2>
              <span className="habit-count">{getUpcomingHabits().length} habits</span>
            </div>
            
            <div className="upcoming-habits">
              {getUpcomingHabits().map(habit => (
                <div key={habit._id} className="upcoming-habit">
                  <span className="habit-name">{habit.name}</span>
                  <span className="stake-amount">{habit.stakeAmount} MATIC at stake</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
