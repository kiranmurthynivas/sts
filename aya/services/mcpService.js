const axios = require('axios');
const blockchainService = require('../utils/blockchain');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const User = require('../models/User');

class MCPService {
  constructor() {
    this.elizaApiUrl = process.env.OPENAI_API_URL;
    this.elizaApiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.LARGE_OPENAI_MODEL;
  }

  // Execute punishment logic via MCP
  async executePunishment(userId, habitId, failureType = 'first') {
    try {
      console.log(`Executing punishment for user ${userId}, habit ${habitId}, type: ${failureType}`);

      const user = await User.findById(userId);
      const habit = await Habit.findById(habitId);

      if (!user || !habit) {
        throw new Error('User or habit not found');
      }

      if (!user.walletAddress) {
        throw new Error('User wallet not connected');
      }

      let punishmentAmount;
      let description;
      let toAddress;

      if (failureType === 'first') {
        // First failure: stake the amount
        punishmentAmount = habit.stakeAmount;
        description = `Staked ${punishmentAmount} MATIC for missing ${habit.name}`;
        toAddress = process.env.CHARITY_WALLET_ADDRESS; // Temporary holding
        
        // Update habit
        habit.totalStaked += punishmentAmount;
        habit.failCount += 1;
      } else {
        // Second failure: send entire staked amount to charity
        punishmentAmount = habit.totalStaked;
        description = `Sent ${punishmentAmount} MATIC to charity for repeated failure on ${habit.name}`;
        toAddress = process.env.CHARITY_WALLET_ADDRESS;
        
        // Reset habit stakes
        habit.totalStaked = 0;
        habit.failCount = 0;
      }

      await habit.save();

      // Create transaction data for frontend to execute
      const txData = blockchainService.createPunishmentTxData(user.walletAddress, punishmentAmount);
      
      // Create transaction record
      const mockTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`;
      const transaction = await blockchainService.createTransactionRecord(
        userId,
        habitId,
        'punishment',
        punishmentAmount,
        mockTxHash,
        user.walletAddress,
        toAddress,
        description
      );

      // Get AI response about the punishment
      const aiResponse = await this.getElizaResponse(
        `User failed their habit "${habit.name}". This is ${failureType} failure. Punishment: ${description}. Provide a motivational but firm message.`
      );

      return {
        success: true,
        transaction: blockchainService.formatTransactionForDisplay(transaction),
        txData,
        aiMessage: aiResponse,
        punishmentAmount,
        description
      };

    } catch (error) {
      console.error('Error executing punishment:', error);
      throw error;
    }
  }

  // Execute reward logic via MCP
  async executeReward(userId, habitId, streakCount) {
    try {
      console.log(`Executing reward for user ${userId}, habit ${habitId}, streak: ${streakCount}`);

      const user = await User.findById(userId);
      const habit = await Habit.findById(habitId);

      if (!user || !habit) {
        throw new Error('User or habit not found');
      }

      if (!user.walletAddress) {
        throw new Error('User wallet not connected');
      }

      // 7-day streak reward
      if (streakCount >= 7) {
        const rewardAmount = 0.1; // 0.1 MATIC + meme coins
        const description = `7-day streak reward for ${habit.name}! Earned ${rewardAmount} MATIC + meme coins`;

        // Update habit and user
        habit.totalRewards += rewardAmount;
        user.totalRewards += rewardAmount;
        
        // Return staked amount if any
        if (habit.totalStaked > 0) {
          habit.totalStaked = 0; // Reset stakes on successful streak
        }

        await habit.save();
        await user.save();

        // Create reward transaction data
        const txData = blockchainService.createRewardTxData(user.walletAddress, rewardAmount);
        
        // Create transaction record
        const mockTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`;
        const transaction = await blockchainService.createTransactionRecord(
          userId,
          habitId,
          'reward',
          rewardAmount,
          mockTxHash,
          process.env.CHARITY_WALLET_ADDRESS, // From charity/reward pool
          user.walletAddress,
          description
        );

        // Get AI congratulatory response
        const aiResponse = await this.getElizaResponse(
          `User achieved a 7-day streak for "${habit.name}"! They earned ${rewardAmount} MATIC and meme coins. Provide an enthusiastic congratulatory message.`
        );

        return {
          success: true,
          transaction: blockchainService.formatTransactionForDisplay(transaction),
          txData,
          aiMessage: aiResponse,
          rewardAmount,
          description
        };
      }

      return {
        success: false,
        message: 'Streak not long enough for reward'
      };

    } catch (error) {
      console.error('Error executing reward:', error);
      throw error;
    }
  }

  // Get response from Eliza AI via Comput3
  async getElizaResponse(prompt, context = {}) {
    try {
      const response = await axios.post(
        `${this.elizaApiUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are Eliza, an AI habit accountability coach for the Stake-for-Shame app. You help users stay accountable to their habits through crypto-powered punishments and rewards. Be encouraging but firm about accountability. Keep responses concise and motivational.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.elizaApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error getting Eliza response:', error);
      return 'Stay strong and keep building those habits! 💪';
    }
  }

  // Daily habit evaluation
  async evaluateHabits() {
    try {
      console.log('Starting daily habit evaluation...');
      
      const today = new Date();
      const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Find all active habits that should be tracked today
      const habitsToday = await Habit.find({
        isActive: true,
        daysOfWeek: dayName
      }).populate('userId');

      const results = [];

      for (const habit of habitsToday) {
        try {
          // Check if user logged this habit today
          const todayLog = await HabitLog.findOne({
            habitId: habit._id,
            date: {
              $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
              $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
            }
          });

          if (!todayLog) {
            // User didn't log - consider it a failure
            console.log(`User ${habit.userId.email} missed habit: ${habit.name}`);
            
            // Create failure log
            const failureLog = new HabitLog({
              habitId: habit._id,
              userId: habit.userId._id,
              date: today,
              completed: false,
              notes: 'Auto-marked as failed - not logged',
              streakCount: 0,
              punishmentTriggered: true
            });

            await failureLog.save();

            // Reset streak
            habit.currentStreak = 0;
            await habit.save();

            // Execute punishment
            const failureType = habit.failCount > 0 ? 'second' : 'first';
            const punishmentResult = await this.executePunishment(
              habit.userId._id,
              habit._id,
              failureType
            );

            results.push({
              habitId: habit._id,
              habitName: habit.name,
              userId: habit.userId._id,
              userEmail: habit.userId.email,
              action: 'punishment',
              result: punishmentResult
            });
          }
        } catch (error) {
          console.error(`Error evaluating habit ${habit._id}:`, error);
        }
      }

      console.log(`Daily evaluation completed. Processed ${results.length} habits.`);
      return results;

    } catch (error) {
      console.error('Error in daily habit evaluation:', error);
      throw error;
    }
  }

  // Send daily reminders
  async sendDailyReminders() {
    try {
      console.log('Sending daily reminders...');
      
      const today = new Date();
      const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Find habits scheduled for today that haven't been logged
      const habitsToday = await Habit.find({
        isActive: true,
        daysOfWeek: dayName
      }).populate('userId');

      const reminders = [];

      for (const habit of habitsToday) {
        // Check if already logged today
        const todayLog = await HabitLog.findOne({
          habitId: habit._id,
          date: {
            $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
          }
        });

        if (!todayLog) {
          const reminderMessage = await this.getElizaResponse(
            `Remind user to complete their habit "${habit.name}" today. They have ${habit.stakeAmount} MATIC at stake. Be encouraging but mention the consequences.`
          );

          reminders.push({
            userId: habit.userId._id,
            userEmail: habit.userId.email,
            habitId: habit._id,
            habitName: habit.name,
            message: reminderMessage,
            stakeAmount: habit.stakeAmount
          });
        }
      }

      console.log(`Sent ${reminders.length} daily reminders.`);
      return reminders;

    } catch (error) {
      console.error('Error sending daily reminders:', error);
      throw error;
    }
  }
}

module.exports = new MCPService();
