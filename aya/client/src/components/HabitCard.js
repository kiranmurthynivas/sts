import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useWallet } from '../contexts/WalletContext';
import './HabitCard.css';

const HabitCard = ({ habit, onUpdate, showTodayActions = false }) => {
  const { sendTransaction, account } = useWallet();
  const [logging, setLogging] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const handleLogHabit = async (completed) => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    setLogging(true);
    
    try {
      const response = await axios.post(`/habits/${habit._id}/log`, {
        completed,
        notes: notes.trim()
      });

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

          alert(`${completed ? 'Success!' : 'Transaction sent!'} ${mcpResult.aiMessage}`);
        } catch (txError) {
          console.error('Blockchain transaction error:', txError);
          alert(`Habit logged but blockchain transaction failed: ${txError.message}`);
        }
      } else if (mcpResult && mcpResult.aiMessage) {
        alert(mcpResult.aiMessage);
      }

      setNotes('');
      setShowNotes(false);
      onUpdate();

    } catch (error) {
      console.error('Error logging habit:', error);
      alert('Failed to log habit. Please try again.');
    } finally {
      setLogging(false);
    }
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '🔥';
    if (streak >= 7) return '⭐';
    if (streak >= 3) return '💪';
    return '🌱';
  };

  const getDaysDisplay = (daysOfWeek) => {
    const dayAbbr = {
      'Sunday': 'Sun',
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat'
    };
    
    return daysOfWeek.map(day => dayAbbr[day]).join(', ');
  };

  const isScheduledToday = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return habit.daysOfWeek.includes(today);
  };

  const hasLoggedToday = () => {
    const today = new Date().toDateString();
    return habit.recentLogs && habit.recentLogs.some(log => 
      new Date(log.date).toDateString() === today
    );
  };

  const getTodayLog = () => {
    const today = new Date().toDateString();
    return habit.recentLogs?.find(log => 
      new Date(log.date).toDateString() === today
    );
  };

  const todayLog = getTodayLog();
  const canLogToday = isScheduledToday() && !hasLoggedToday();
  const loggedToday = hasLoggedToday();

  return (
    <div className={`habit-card ${loggedToday ? 'logged' : ''}`}>
      <div className="habit-header">
        <div className="habit-title">
          <h3>{habit.name}</h3>
          <span className="habit-streak">
            {getStreakEmoji(habit.currentStreak)} {habit.currentStreak}
          </span>
        </div>
        <div className="habit-stake">
          💰 {habit.stakeAmount} MATIC
        </div>
      </div>

      <div className="habit-details">
        <div className="habit-schedule">
          <span className="schedule-label">Schedule:</span>
          <span className="schedule-days">{getDaysDisplay(habit.daysOfWeek)}</span>
        </div>
        
        <div className="habit-stats">
          <div className="stat">
            <span className="stat-label">Current Streak:</span>
            <span className="stat-value">{habit.currentStreak} days</span>
          </div>
          <div className="stat">
            <span className="stat-label">Best Streak:</span>
            <span className="stat-value">{habit.longestStreak} days</span>
          </div>
          {habit.totalStaked > 0 && (
            <div className="stat">
              <span className="stat-label">At Stake:</span>
              <span className="stat-value">{habit.totalStaked} MATIC</span>
            </div>
          )}
        </div>
      </div>

      {/* Today's Actions */}
      {showTodayActions && isScheduledToday() && (
        <div className="today-actions">
          {loggedToday ? (
            <div className="logged-status">
              <span className={`status-badge ${todayLog?.completed ? 'completed' : 'failed'}`}>
                {todayLog?.completed ? '✅ Completed' : '❌ Failed'}
              </span>
              {todayLog?.notes && (
                <div className="log-notes">
                  <small>"{todayLog.notes}"</small>
                </div>
              )}
            </div>
          ) : canLogToday ? (
            <div className="log-actions">
              <div className="action-buttons">
                <button 
                  onClick={() => handleLogHabit(true)}
                  disabled={logging}
                  className="log-btn success"
                >
                  {logging ? '...' : '✅ I did this!'}
                </button>
                <button 
                  onClick={() => handleLogHabit(false)}
                  disabled={logging}
                  className="log-btn failure"
                >
                  {logging ? '...' : '❌ I failed'}
                </button>
              </div>
              
              <button 
                onClick={() => setShowNotes(!showNotes)}
                className="notes-toggle"
              >
                {showNotes ? 'Hide Notes' : 'Add Notes'}
              </button>
              
              {showNotes && (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note about today's habit..."
                  className="notes-input"
                  rows={2}
                />
              )}
            </div>
          ) : (
            <div className="not-scheduled">
              <span>Not scheduled for today</span>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      {habit.recentLogs && habit.recentLogs.length > 0 && (
        <div className="recent-activity">
          <div className="activity-header">Recent Activity</div>
          <div className="activity-dots">
            {habit.recentLogs.slice(0, 7).map((log, index) => (
              <div 
                key={index}
                className={`activity-dot ${log.completed ? 'completed' : 'failed'}`}
                title={`${new Date(log.date).toLocaleDateString()}: ${log.completed ? 'Completed' : 'Failed'}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="habit-actions">
        <Link to={`/habit/${habit._id}`} className="view-details-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default HabitCard;
