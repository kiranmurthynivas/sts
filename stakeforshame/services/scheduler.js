const cron = require('node-cron');
const { checkMissedHabits } = require('./habitProcessor');
const { elizaChat } = require('./eliza');
const User = require('../models/User');
const Habit = require('../models/Habit');

// Schedule habit checks
const scheduleHabitChecks = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('🕘 Running daily habit check...');
    try {
      await checkMissedHabits();
      console.log('✅ Daily habit check completed');
    } catch (error) {
      console.error('❌ Daily habit check failed:', error);
    }
  });

  // Run every hour to check for missed habits
  cron.schedule('0 * * * *', async () => {
    console.log('🕐 Running hourly habit check...');
    try {
      await checkMissedHabits();
      console.log('✅ Hourly habit check completed');
    } catch (error) {
      console.error('❌ Hourly habit check failed:', error);
    }
  });

  // Run every Sunday at 8:00 AM for weekly summary
  cron.schedule('0 8 * * 0', async () => {
    console.log('📊 Running weekly summary...');
    try {
      await generateWeeklySummary();
      console.log('✅ Weekly summary completed');
    } catch (error) {
      console.error('❌ Weekly summary failed:', error);
    }
  });

  console.log('⏰ Scheduled tasks initialized');
};

// Generate weekly summary
const generateWeeklySummary = async () => {
  try {
    const users = await User.find({ isActive: true });
    
    for (const user of users) {
      const habits = await Habit.find({ userId: user._id, isActive: true });
      
      if (habits.length === 0) continue;

      // Calculate weekly stats
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      
      const weeklyStats = {
        totalHabits: habits.length,
        completedHabits: 0,
        failedHabits: 0,
        totalStaked: 0,
        totalPunished: 0,
        totalRewarded: 0,
        averageStreak: 0
      };

      for (const habit of habits) {
        weeklyStats.averageStreak += habit.currentStreak;
        weeklyStats.totalStaked += habit.totalStaked;
        weeklyStats.totalPunished += habit.totalPunished;
        weeklyStats.totalRewarded += habit.totalRewarded;
      }

      weeklyStats.averageStreak = Math.round(weeklyStats.averageStreak / habits.length);

      // Generate AI summary
      const summaryMessage = `📊 Weekly Summary for ${user.username || user.email}:

🎯 Total Habits: ${weeklyStats.totalHabits}
✅ Completed: ${weeklyStats.completedHabits}
❌ Failed: ${weeklyStats.failedHabits}
💰 Total Staked: ${weeklyStats.totalStaked} MATIC
💔 Total Punished: ${weeklyStats.totalPunished} MATIC
🎁 Total Rewarded: ${weeklyStats.totalRewarded} MATIC
🔥 Average Streak: ${weeklyStats.averageStreak} days

Keep up the great work! 💪`;

      // Send AI feedback
      try {
        await elizaChat(summaryMessage, user, { type: 'weekly_summary' });
      } catch (aiError) {
        console.error('AI summary error:', aiError);
      }
    }
  } catch (error) {
    console.error('Generate weekly summary error:', error);
  }
};

// Send daily reminders
const sendDailyReminders = async () => {
  try {
    const users = await User.find({ isActive: true });
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    for (const user of users) {
      const habits = await Habit.find({
        userId: user._id,
        isActive: true,
        daysOfWeek: today
      });

      if (habits.length > 0) {
        const reminderMessage = `🌅 Good morning! You have ${habits.length} habit(s) scheduled for today (${today}):

${habits.map(habit => `• ${habit.name} (${habit.stakeAmount} MATIC stake)`).join('\n')}

Don't forget to log your progress! 💪`;

        try {
          await elizaChat(reminderMessage, user, { type: 'daily_reminder' });
        } catch (aiError) {
          console.error('AI reminder error:', aiError);
        }
      }
    }
  } catch (error) {
    console.error('Send daily reminders error:', error);
  }
};

// Check for inactive users
const checkInactiveUsers = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveUsers = await User.find({
      lastLogin: { $lt: thirtyDaysAgo },
      isActive: true
    });

    for (const user of inactiveUsers) {
      const reminderMessage = `👋 Hey ${user.username || user.email}! 

It's been a while since you've checked in on your habits. Your accountability journey is waiting for you!

Come back and continue building those amazing habits! 🌟`;

      try {
        await elizaChat(reminderMessage, user, { type: 'inactive_reminder' });
      } catch (aiError) {
        console.error('AI inactive reminder error:', aiError);
      }
    }

    console.log(`📧 Sent ${inactiveUsers.length} inactive user reminders`);
  } catch (error) {
    console.error('Check inactive users error:', error);
  }
};

// Clean up old data
const cleanupOldData = async () => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Archive old habit logs (keep for 90 days)
    const oldLogs = await HabitLog.find({
      date: { $lt: ninetyDaysAgo }
    });

    if (oldLogs.length > 0) {
      console.log(`🗑️ Cleaning up ${oldLogs.length} old habit logs`);
      // In a real implementation, you might want to archive these instead of deleting
      // await HabitLog.deleteMany({ date: { $lt: ninetyDaysAgo } });
    }

    console.log('✅ Data cleanup completed');
  } catch (error) {
    console.error('Cleanup old data error:', error);
  }
};

// Initialize all scheduled tasks
const initializeScheduler = () => {
  scheduleHabitChecks();
  
  // Additional scheduled tasks
  cron.schedule('0 7 * * *', sendDailyReminders); // Daily reminders at 7 AM
  cron.schedule('0 10 * * 1', checkInactiveUsers); // Check inactive users every Monday
  cron.schedule('0 2 * * 0', cleanupOldData); // Cleanup every Sunday at 2 AM

  console.log('🚀 Scheduler initialized with all tasks');
};

module.exports = {
  scheduleHabitChecks,
  generateWeeklySummary,
  sendDailyReminders,
  checkInactiveUsers,
  cleanupOldData,
  initializeScheduler
};
