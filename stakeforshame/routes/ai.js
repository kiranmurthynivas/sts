const express = require('express');
const { elizaChat, getHabitFeedback, processHabitAnalysis } = require('../services/eliza');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

const router = express.Router();

// Chat with Eliza
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await elizaChat(message, req.user, context);
    
    res.json({
      message: response.message,
      suggestions: response.suggestions,
      actions: response.actions
    });
  } catch (error) {
    console.error('Eliza chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Get AI feedback for habit
router.get('/feedback/:habitId', async (req, res) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.habitId, 
      userId: req.user._id 
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Get recent logs for analysis
    const recentLogs = await HabitLog.find({
      habitId: habit._id
    })
    .sort({ date: -1 })
    .limit(30);

    const feedback = await getHabitFeedback(habit, recentLogs, req.user);
    
    res.json({ feedback });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to get AI feedback' });
  }
});

// Get AI analysis for all habits
router.get('/analysis', async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user._id, 
      isActive: true 
    });

    const analysis = await Promise.all(
      habits.map(async (habit) => {
        const logs = await HabitLog.find({
          habitId: habit._id
        })
        .sort({ date: -1 })
        .limit(30);

        return await processHabitAnalysis(habit, logs);
      })
    );

    res.json({ analysis });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to get AI analysis' });
  }
});

// Get AI recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user._id, 
      isActive: true 
    });

    const recommendations = await Promise.all(
      habits.map(async (habit) => {
        const logs = await HabitLog.find({
          habitId: habit._id
        })
        .sort({ date: -1 })
        .limit(7);

        const completionRate = logs.filter(log => log.completed).length / logs.length;
        
        let recommendation = '';
        if (completionRate < 0.5) {
          recommendation = `Consider reducing the stake amount for "${habit.name}" or adjusting the schedule.`;
        } else if (completionRate > 0.8) {
          recommendation = `Great job with "${habit.name}"! Consider increasing the challenge.`;
        } else {
          recommendation = `Keep up the good work with "${habit.name}"!`;
        }

        return {
          habitId: habit._id,
          habitName: habit.name,
          completionRate,
          recommendation
        };
      })
    );

    res.json({ recommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get daily AI insights
router.get('/insights', async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);

    const habits = await Habit.find({ 
      userId: req.user._id, 
      isActive: true 
    });

    const weeklyLogs = await HabitLog.find({
      userId: req.user._id,
      date: { $gte: startOfWeek }
    });

    const insights = {
      totalHabits: habits.length,
      completedThisWeek: weeklyLogs.filter(log => log.completed).length,
      failedThisWeek: weeklyLogs.filter(log => !log.completed).length,
      totalStaked: weeklyLogs.reduce((sum, log) => sum + (log.stakeAmount || 0), 0),
      totalPunished: weeklyLogs.reduce((sum, log) => sum + (log.punishmentAmount || 0), 0),
      streakInsights: await getStreakInsights(habits),
      motivationalMessage: await getMotivationalMessage(weeklyLogs, habits)
    };

    res.json({ insights });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

// Helper function to get streak insights
async function getStreakInsights(habits) {
  const insights = [];
  
  for (const habit of habits) {
    const logs = await HabitLog.find({
      habitId: habit._id,
      completed: true
    })
    .sort({ date: -1 })
    .limit(7);

    let currentStreak = 0;
    let lastDate = null;
    
    for (const log of logs) {
      if (!lastDate) {
        currentStreak = 1;
        lastDate = log.date;
      } else {
        const dayDiff = Math.floor((lastDate - log.date) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          currentStreak++;
          lastDate = log.date;
        } else {
          break;
        }
      }
    }

    insights.push({
      habitId: habit._id,
      habitName: habit.name,
      currentStreak,
      longestStreak: habit.longestStreak
    });
  }

  return insights;
}

// Helper function to get motivational message
async function getMotivationalMessage(logs, habits) {
  const completionRate = logs.filter(log => log.completed).length / logs.length;
  
  if (completionRate >= 0.8) {
    return "🎉 Amazing work this week! You're crushing your goals and building incredible habits. Keep up the momentum!";
  } else if (completionRate >= 0.6) {
    return "👍 Good progress! You're on the right track. Remember, consistency is key to building lasting habits.";
  } else if (completionRate >= 0.4) {
    return "💪 You've got this! Every small step counts. Focus on one habit at a time and build from there.";
  } else {
    return "🌟 Don't give up! Every expert was once a beginner. Start small, stay consistent, and watch yourself grow.";
  }
}

module.exports = router;
