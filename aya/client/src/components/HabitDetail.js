import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWallet } from '../contexts/WalletContext';
import './HabitDetail.css';

const HabitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sendTransaction, account } = useWallet();
  
  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({
    completed: true,
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchHabitDetails();
    fetchHabitStats();
  }, [id]);

  const fetchHabitDetails = async () => {
    try {
      const response = await axios.get(`/habits/${id}`);
      setHabit(response.data.habit);
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching habit details:', error);
      if (error.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHabitStats = async () => {
    try {
      const response = await axios.get(`/habits/${id}/stats`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching habit stats:', error);
    }
  };

  const handleLogHabit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    setLogging(true);
    
    try {
      const response = await axios.post(`/habits/${id}/log`, logForm);
      const { mcpResult } = response.data;

      // If there's a blockchain transaction to execute
      if (mcpResult && mcpResult.txData) {
        try {
          const tx = await sendTransaction(
            mcpResult.txData.to,
            mcpResult.txData.value,
            mcpResult.txData.gasLimit
          );

          // Update transaction with real hash
          await axios.put(`/transactions/${mcpResult.transaction.id}/status`, {
            status: 'pending',
            transactionHash: tx.hash
          });

          alert(`Transaction sent! ${mcpResult.aiMessage}`);
        } catch (txError) {
          console.error('Blockchain transaction error:', txError);
          alert(`Habit logged but blockchain transaction failed: ${txError.message}`);
        }
      } else if (mcpResult && mcpResult.aiMessage) {
        alert(mcpResult.aiMessage);
      }

      // Reset form and refresh data
      setLogForm({
        completed: true,
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowLogForm(false);
      fetchHabitDetails();
      fetchHabitStats();

    } catch (error) {
      console.error('Error logging habit:', error);
      alert('Failed to log habit. Please try again.');
    } finally {
      setLogging(false);
    }
  };

  const handleDeleteHabit = async () => {
    if (!window.confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/habits/${id}`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Failed to delete habit. Please try again.');
    }
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '🔥';
    if (streak >= 7) return '⭐';
    if (streak >= 3) return '💪';
    return '🌱';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading habit details...</div>;
  }

  if (!habit) {
    return <div className="error">Habit not found</div>;
  }

  return (
    <div className="habit-detail">
      <div className="habit-detail-container">
        {/* Header */}
        <div className="habit-header">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
          <div className="habit-title-section">
            <h1>{habit.name}</h1>
            {habit.description && <p className="habit-description">{habit.description}</p>}
          </div>
          <button onClick={handleDeleteHabit} className="delete-btn">
            🗑️ Delete
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">{getStreakEmoji(habit.currentStreak)}</div>
            <div className="stat-content">
              <h3>{habit.currentStreak}</h3>
              <p>Current Streak</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏅</div>
            <div className="stat-content">
              <h3>{habit.longestStreak}</h3>
              <p>Best Streak</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>{habit.stakeAmount}</h3>
              <p>MATIC per Day</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>{habit.totalStaked}</h3>
              <p>MATIC at Stake</p>
            </div>
          </div>

          {stats && (
            <>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>{stats.completionRate}%</h3>
                  <p>Success Rate</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h3>{stats.totalLogs}</h3>
                  <p>Total Days</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Schedule */}
        <div className="schedule-section">
          <h2>Schedule</h2>
          <div className="schedule-days">
            {habit.daysOfWeek.map(day => (
              <span key={day} className="schedule-day">{day}</span>
            ))}
          </div>
        </div>

        {/* Log New Entry */}
        <div className="log-section">
          <div className="log-header">
            <h2>Log Entry</h2>
            <button 
              onClick={() => setShowLogForm(!showLogForm)}
              className="toggle-log-btn"
            >
              {showLogForm ? 'Cancel' : '+ Add Entry'}
            </button>
          </div>

          {showLogForm && (
            <form onSubmit={handleLogHabit} className="log-form">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  value={logForm.date}
                  onChange={(e) => setLogForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <div className="status-buttons">
                  <button
                    type="button"
                    className={`status-btn ${logForm.completed ? 'active success' : ''}`}
                    onClick={() => setLogForm(prev => ({ ...prev, completed: true }))}
                  >
                    ✅ Completed
                  </button>
                  <button
                    type="button"
                    className={`status-btn ${!logForm.completed ? 'active failure' : ''}`}
                    onClick={() => setLogForm(prev => ({ ...prev, completed: false }))}
                  >
                    ❌ Failed
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes (Optional)</label>
                <textarea
                  id="notes"
                  value={logForm.notes}
                  onChange={(e) => setLogForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes about this day..."
                  rows={3}
                />
              </div>

              <button type="submit" disabled={logging} className="submit-log-btn">
                {logging ? 'Logging...' : 'Log Entry'}
              </button>
            </form>
          )}
        </div>

        {/* Activity History */}
        <div className="history-section">
          <h2>Activity History</h2>
          
          {logs.length > 0 ? (
            <div className="logs-list">
              {logs.map(log => (
                <div key={log._id} className={`log-item ${log.completed ? 'completed' : 'failed'}`}>
                  <div className="log-date">
                    <div className="date-main">
                      {new Date(log.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="date-year">
                      {new Date(log.date).getFullYear()}
                    </div>
                  </div>
                  
                  <div className="log-content">
                    <div className="log-status">
                      <span className={`status-badge ${log.completed ? 'success' : 'failure'}`}>
                        {log.completed ? '✅ Completed' : '❌ Failed'}
                      </span>
                      {log.streakCount > 0 && (
                        <span className="streak-badge">
                          🔥 {log.streakCount} day streak
                        </span>
                      )}
                    </div>
                    
                    {log.notes && (
                      <div className="log-notes">
                        "{log.notes}"
                      </div>
                    )}
                    
                    <div className="log-meta">
                      Logged on {formatDate(log.loggedAt)}
                      {log.punishmentTriggered && (
                        <span className="punishment-badge">⚠️ Punishment triggered</span>
                      )}
                      {log.rewardTriggered && (
                        <span className="reward-badge">🏆 Reward earned</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-logs">
              <span className="empty-icon">📝</span>
              <p>No activity logged yet. Start tracking your habit!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitDetail;
