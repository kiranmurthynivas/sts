const express = require('express');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const mcpService = require('../services/mcpService');

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Get all habits for the current user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 });

    // Get recent logs for each habit
    const habitsWithLogs = await Promise.all(
      habits.map(async (habit) => {
        const recentLogs = await HabitLog.find({ habitId: habit._id })
          .sort({ date: -1 })
          .limit(7);

        return {
          ...habit.toObject(),
          recentLogs: recentLogs
        };
      })
    );

    res.json({ habits: habitsWithLogs });

  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Get a specific habit
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Get all logs for this habit
    const logs = await HabitLog.find({ habitId: habit._id })
      .sort({ date: -1 });

    res.json({ 
      habit: habit.toObject(),
      logs: logs
    });

  } catch (error) {
    console.error('Error fetching habit:', error);
    res.status(500).json({ error: 'Failed to fetch habit' });
  }
});

// Create a new habit
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name, description, daysOfWeek, stakeAmount } = req.body;

    if (!name || !daysOfWeek || daysOfWeek.length === 0) {
      return res.status(400).json({ 
        error: 'Habit name and days of week are required' 
      });
    }

    // Validate days of week
    const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const invalidDays = daysOfWeek.filter(day => !validDays.includes(day));
    
    if (invalidDays.length > 0) {
      return res.status(400).json({ 
        error: `Invalid days: ${invalidDays.join(', ')}` 
      });
    }

    // Check if user has wallet connected
    if (!req.user.isWalletConnected) {
      return res.status(400).json({ 
        error: 'Please connect your wallet before creating habits' 
      });
    }

    const habit = new Habit({
      userId: req.user._id,
      name: name.trim(),
      description: description ? description.trim() : '',
      daysOfWeek,
      stakeAmount: stakeAmount || 5
    });

    await habit.save();

    // Get AI welcome message
    const aiMessage = await mcpService.getElizaResponse(
      `User created a new habit "${name}" with ${stakeAmount || 5} MATIC at stake. Provide an encouraging welcome message about their new commitment.`
    );

    res.status(201).json({
      message: 'Habit created successfully',
      habit: habit.toObject(),
      aiMessage
    });

  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// Update a habit
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, description, daysOfWeek, stakeAmount } = req.body;

    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Update fields if provided
    if (name) habit.name = name.trim();
    if (description !== undefined) habit.description = description.trim();
    if (daysOfWeek) {
      // Validate days
      const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const invalidDays = daysOfWeek.filter(day => !validDays.includes(day));
      
      if (invalidDays.length > 0) {
        return res.status(400).json({ 
          error: `Invalid days: ${invalidDays.join(', ')}` 
        });
      }
      
      habit.daysOfWeek = daysOfWeek;
    }
    if (stakeAmount !== undefined) habit.stakeAmount = stakeAmount;

    await habit.save();

    res.json({
      message: 'Habit updated successfully',
      habit: habit.toObject()
    });

  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

// Delete a habit
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Soft delete by marking as inactive
    habit.isActive = false;
    await habit.save();

    res.json({ message: 'Habit deleted successfully' });

  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

// Log habit completion
router.post('/:id/log', isAuthenticated, async (req, res) => {
  try {
    const { completed, notes, date } = req.body;

    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const logDate = date ? new Date(date) : new Date();
    
    // Check if log already exists for this date
    const existingLog = await HabitLog.findOne({
      habitId: habit._id,
      date: {
        $gte: new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()),
        $lt: new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate() + 1)
      }
    });

    if (existingLog) {
      // Update existing log
      existingLog.completed = completed;
      existingLog.notes = notes || '';
      existingLog.loggedAt = new Date();
      
      if (completed) {
        // Update streak
        habit.currentStreak += 1;
        if (habit.currentStreak > habit.longestStreak) {
          habit.longestStreak = habit.currentStreak;
        }
        habit.lastCompletedDate = logDate;
        existingLog.streakCount = habit.currentStreak;
      } else {
        // Reset streak on failure
        habit.currentStreak = 0;
        existingLog.streakCount = 0;
      }

      await existingLog.save();
      await habit.save();

      // Handle punishment or reward
      let mcpResult = null;
      if (!completed) {
        // Execute punishment
        const failureType = habit.failCount > 0 ? 'second' : 'first';
        mcpResult = await mcpService.executePunishment(req.user._id, habit._id, failureType);
        existingLog.punishmentTriggered = true;
        await existingLog.save();
      } else if (habit.currentStreak >= 7) {
        // Execute reward for 7-day streak
        mcpResult = await mcpService.executeReward(req.user._id, habit._id, habit.currentStreak);
        existingLog.rewardTriggered = true;
        await existingLog.save();
      }

      return res.json({
        message: 'Habit log updated successfully',
        log: existingLog.toObject(),
        habit: habit.toObject(),
        mcpResult
      });
    }

    // Create new log
    const habitLog = new HabitLog({
      habitId: habit._id,
      userId: req.user._id,
      date: logDate,
      completed,
      notes: notes || ''
    });

    if (completed) {
      // Update streak
      habit.currentStreak += 1;
      if (habit.currentStreak > habit.longestStreak) {
        habit.longestStreak = habit.currentStreak;
      }
      habit.lastCompletedDate = logDate;
      habitLog.streakCount = habit.currentStreak;
    } else {
      // Reset streak on failure
      habit.currentStreak = 0;
      habitLog.streakCount = 0;
    }

    await habitLog.save();
    await habit.save();

    // Handle punishment or reward (with error handling)
    let mcpResult = null;
    try {
      if (!completed) {
        // Execute punishment
        const failureType = habit.failCount > 0 ? 'second' : 'first';
        mcpResult = await mcpService.executePunishment(req.user._id, habit._id, failureType);
        habitLog.punishmentTriggered = true;
        await habitLog.save();
      } else if (habit.currentStreak >= 7) {
        // Execute reward for 7-day streak
        mcpResult = await mcpService.executeReward(req.user._id, habit._id, habit.currentStreak);
        habitLog.rewardTriggered = true;
        await habitLog.save();
      }
    } catch (mcpError) {
      console.error('MCP service error (non-critical):', mcpError.message);
      // Continue with habit logging even if MCP fails
      mcpResult = { error: 'MCP service temporarily unavailable' };
    }

    res.status(201).json({
      message: 'Habit logged successfully',
      log: habitLog.toObject(),
      habit: habit.toObject(),
      mcpResult
    });

  } catch (error) {
    console.error('Error logging habit:', error);
    res.status(500).json({ error: 'Failed to log habit' });
  }
});

// Get habit statistics
router.get('/:id/stats', isAuthenticated, async (req, res) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Get all logs for this habit
    const logs = await HabitLog.find({ habitId: habit._id }).sort({ date: 1 });
    
    // Calculate statistics
    const totalLogs = logs.length;
    const completedLogs = logs.filter(log => log.completed).length;
    const completionRate = totalLogs > 0 ? (completedLogs / totalLogs * 100).toFixed(1) : 0;
    
    // Get recent 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentLogs = logs.filter(log => log.date >= thirtyDaysAgo);
    const recentCompletionRate = recentLogs.length > 0 ? 
      (recentLogs.filter(log => log.completed).length / recentLogs.length * 100).toFixed(1) : 0;

    res.json({
      stats: {
        totalLogs,
        completedLogs,
        completionRate: parseFloat(completionRate),
        recentCompletionRate: parseFloat(recentCompletionRate),
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
        totalStaked: habit.totalStaked,
        totalRewards: habit.totalRewards,
        failCount: habit.failCount
      },
      logs: logs.slice(-30) // Last 30 logs
    });

  } catch (error) {
    console.error('Error getting habit stats:', error);
    res.status(500).json({ error: 'Failed to get habit statistics' });
  }
});

module.exports = router;
