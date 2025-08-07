const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { 
  sendPunishmentTransaction, 
  sendRewardTransaction, 
  sendMemeCoinReward 
} = require('./web3');

// Process habit success
const processHabitSuccess = async (habit, habitLog, user) => {
  try {
    // Update habit streak
    const newStreak = habit.currentStreak + 1;
    const longestStreak = Math.max(habit.longestStreak, newStreak);
    
    await Habit.findByIdAndUpdate(habit._id, {
      currentStreak: newStreak,
      longestStreak: longestStreak,
      totalCompletions: habit.totalCompletions + 1
    });

    // Check if user completed 7 days in a row
    if (newStreak >= 7) {
      return await processStreakReward(habit, habitLog, user, newStreak);
    }

    // Update habit log with success
    await HabitLog.findByIdAndUpdate(habitLog._id, {
      completed: true,
      aiFeedback: `Great job! You've maintained your streak for ${newStreak} days. Keep it up!`
    });

    return {
      success: true,
      message: `✅ Habit completed! Your streak is now ${newStreak} days.`,
      streak: newStreak,
      reward: null
    };
  } catch (error) {
    console.error('Process habit success error:', error);
    throw error;
  }
};

// Process habit failure
const processHabitFailure = async (habit, habitLog, user) => {
  try {
    // Reset streak
    await Habit.findByIdAndUpdate(habit._id, {
      currentStreak: 0,
      totalFailures: habit.totalFailures + 1
    });

    // Check if this is the first or second failure
    const recentFailures = await HabitLog.find({
      habitId: habit._id,
      completed: false,
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    let punishmentAmount = 0;
    let punishmentType = 'stake';

    if (recentFailures.length === 1) {
      // First failure - stake the amount
      punishmentAmount = habit.stakeAmount;
      punishmentType = 'stake';
    } else if (recentFailures.length >= 2) {
      // Second or more failure - send to charity
      punishmentAmount = habit.stakeAmount * 2; // Double the stake
      punishmentType = 'punishment';
    }

    // Process punishment if needed
    let transactionResult = null;
    if (punishmentAmount > 0 && user.walletAddress) {
      try {
        if (punishmentType === 'stake') {
          transactionResult = await sendPunishmentTransaction(
            user.walletAddress,
            punishmentAmount,
            habit,
            user
          );
        } else {
          transactionResult = await sendPunishmentTransaction(
            user.walletAddress,
            punishmentAmount,
            habit,
            user
          );
        }

        // Update habit log with transaction details
        await HabitLog.findByIdAndUpdate(habitLog._id, {
          completed: false,
          stakeAmount: punishmentAmount,
          punishmentAmount: punishmentType === 'punishment' ? punishmentAmount : 0,
          transactionHash: transactionResult.transactionHash,
          transactionType: punishmentType,
          aiFeedback: punishmentType === 'stake' 
            ? `😱 First strike! ${punishmentAmount} MATIC has been staked. Don't let it happen again!`
            : `💔 Second strike! ${punishmentAmount} MATIC has been sent to charity. Time to get serious!`
        });

        // Update user stats
        await User.findByIdAndUpdate(user._id, {
          $inc: {
            totalStaked: punishmentType === 'stake' ? punishmentAmount : 0,
            totalPunished: punishmentType === 'punishment' ? punishmentAmount : 0
          }
        });

      } catch (transactionError) {
        console.error('Transaction error:', transactionError);
        // Still update the log even if transaction fails
        await HabitLog.findByIdAndUpdate(habitLog._id, {
          completed: false,
          stakeAmount: punishmentAmount,
          punishmentAmount: punishmentType === 'punishment' ? punishmentAmount : 0,
          aiFeedback: `Transaction failed, but your failure has been logged. Please try again.`
        });
      }
    } else {
      // No wallet connected or no punishment needed
      await HabitLog.findByIdAndUpdate(habitLog._id, {
        completed: false,
        aiFeedback: `Habit failed. ${user.walletAddress ? 'No punishment applied.' : 'Connect wallet for staking.'}`
      });
    }

    return {
      success: false,
      message: punishmentAmount > 0 
        ? `❌ Habit failed! ${punishmentAmount} MATIC ${punishmentType === 'stake' ? 'staked' : 'sent to charity'}.`
        : '❌ Habit failed! No punishment applied.',
      punishment: {
        amount: punishmentAmount,
        type: punishmentType,
        transactionHash: transactionResult?.transactionHash
      }
    };
  } catch (error) {
    console.error('Process habit failure error:', error);
    throw error;
  }
};

// Process streak reward (7 days in a row)
const processStreakReward = async (habit, habitLog, user, streak) => {
  try {
    let rewardAmount = habit.stakeAmount; // Return the staked amount
    let memeCoinReward = null;

    // Send reward transaction
    let transactionResult = null;
    if (user.walletAddress) {
      try {
        // Return staked amount
        transactionResult = await sendRewardTransaction(
          user.walletAddress,
          rewardAmount,
          habit,
          user
        );

        // Send meme coin reward
        const memeCoins = ['SHIBA', 'PEPE'];
        const randomCoin = memeCoins[Math.floor(Math.random() * memeCoins.length)];
        const memeCoinAmount = Math.floor(Math.random() * 1000) + 100; // 100-1100 tokens

        try {
          const memeCoinResult = await sendMemeCoinReward(
            user.walletAddress,
            randomCoin,
            memeCoinAmount,
            user
          );

          memeCoinReward = {
            coin: randomCoin,
            amount: memeCoinAmount,
            transactionHash: memeCoinResult.transactionHash
          };
        } catch (memeCoinError) {
          console.error('Meme coin reward error:', memeCoinError);
        }

        // Update habit log
        await HabitLog.findByIdAndUpdate(habitLog._id, {
          completed: true,
          rewardAmount: rewardAmount,
          transactionHash: transactionResult.transactionHash,
          transactionType: 'reward',
          aiFeedback: `🎉 AMAZING! ${streak}-day streak achieved! You've earned back ${rewardAmount} MATIC${memeCoinReward ? ` and ${memeCoinReward.amount} ${memeCoinReward.coin} tokens` : ''}!`
        });

        // Update user stats
        await User.findByIdAndUpdate(user._id, {
          $inc: { totalRewarded: rewardAmount }
        });

      } catch (transactionError) {
        console.error('Reward transaction error:', transactionError);
        await HabitLog.findByIdAndUpdate(habitLog._id, {
          completed: true,
          aiFeedback: `🎉 ${streak}-day streak achieved! Reward transaction failed, but your achievement is recorded!`
        });
      }
    }

    return {
      success: true,
      message: `🎉 INCREDIBLE! ${streak}-day streak achieved! You've earned back ${rewardAmount} MATIC${memeCoinReward ? ` and ${memeCoinReward.amount} ${memeCoinReward.coin} tokens` : ''}!`,
      streak: streak,
      reward: {
        amount: rewardAmount,
        transactionHash: transactionResult?.transactionHash,
        memeCoin: memeCoinReward
      }
    };
  } catch (error) {
    console.error('Process streak reward error:', error);
    throw error;
  }
};

// Check for missed habits (cron job)
const checkMissedHabits = async () => {
  try {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });

    // Find all active habits that should be done today
    const activeHabits = await Habit.find({
      isActive: true,
      daysOfWeek: dayOfWeek
    });

    for (const habit of activeHabits) {
      // Check if habit was logged today
      const todayLog = await HabitLog.getLogForDate(habit._id, today);
      
      if (!todayLog) {
        // Habit was missed - create failure log
        const habitLog = new HabitLog({
          habitId: habit._id,
          userId: habit.userId,
          date: today,
          completed: false,
          aiFeedback: `🤖 Auto-detected: You missed your "${habit.name}" habit today!`
        });

        await habitLog.save();

        // Process the failure
        const user = await User.findById(habit.userId);
        if (user) {
          await processHabitFailure(habit, habitLog, user);
        }
      }
    }

    console.log(`✅ Checked ${activeHabits.length} habits for today (${dayOfWeek})`);
  } catch (error) {
    console.error('Check missed habits error:', error);
  }
};

// Get habit statistics
const getHabitStats = async (habitId) => {
  try {
    const habit = await Habit.findById(habitId);
    if (!habit) {
      throw new Error('Habit not found');
    }

    const logs = await HabitLog.find({ habitId });
    const completions = logs.filter(log => log.completed).length;
    const failures = logs.filter(log => !log.completed).length;
    const totalStaked = logs.reduce((sum, log) => sum + (log.stakeAmount || 0), 0);
    const totalPunished = logs.reduce((sum, log) => sum + (log.punishmentAmount || 0), 0);
    const totalRewarded = logs.reduce((sum, log) => sum + (log.rewardAmount || 0), 0);

    return {
      habit,
      stats: {
        totalLogs: logs.length,
        completions,
        failures,
        completionRate: logs.length > 0 ? (completions / logs.length) * 100 : 0,
        totalStaked,
        totalPunished,
        totalRewarded,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak
      }
    };
  } catch (error) {
    console.error('Get habit stats error:', error);
    throw error;
  }
};

module.exports = {
  processHabitSuccess,
  processHabitFailure,
  processStreakReward,
  checkMissedHabits,
  getHabitStats
};
