const express = require('express');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const Transaction = require('../models/Transaction');
const { requireWallet } = require('../middleware/auth');
const { processHabitFailure, processHabitSuccess } = require('../services/habitProcessor');

const router = express.Router();

// Get all habits for user
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 });

    // Get today's logs for each habit
    const habitsWithLogs = await Promise.all(
      habits.map(async (habit) => {
        const todayLog = await HabitLog.getLogForDate(habit._id, new Date());
        return {
          ...habit.toObject(),
          todayLog,
          shouldBeDoneToday: habit.shouldBeDoneToday()
        };
      })
    );

    res.json({ habits: habitsWithLogs });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Create new habit
router.post('/', requireWallet, async (req, res) => {
  try {
    const { name, description, daysOfWeek, stakeAmount } = req.body;

    if (!name || !daysOfWeek || daysOfWeek.length === 0) {
      return res.status(400).json({ 
        error: 'Habit name and at least one day of the week are required' 
      });
    }

    if (stakeAmount && (stakeAmount < 0.1 || stakeAmount > 1000)) {
      return res.status(400).json({ 
        error: 'Stake amount must be between 0.1 and 1000 MATIC' 
      });
    }

    const habit = new Habit({
      userId: req.user._id,
      name,
      description,
      daysOfWeek,
      stakeAmount: stakeAmount || 5
    });

    await habit.save();

    res.status(201).json({
      message: 'Habit created successfully',
      habit
    });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// Get specific habit with logs
router.get('/:habitId', async (req, res) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.habitId, 
      userId: req.user._id 
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Get logs for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await HabitLog.find({
      habitId: habit._id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    // Calculate current streak
    const currentStreak = await HabitLog.aggregate([
      { $match: { habitId: habit._id, completed: true } },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: null,
          streak: {
            $sum: {
              $cond: [
                { $eq: [{ $dayOfYear: "$date" }, { $dayOfYear: { $subtract: ["$date", { $multiply: ["$index", 24 * 60 * 60 * 1000] }] } }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      habit: {
        ...habit.toObject(),
        currentStreak: currentStreak[0]?.streak || 0,
        logs
      }
    });
  } catch (error) {
    console.error('Get habit error:', error);
    res.status(500).json({ error: 'Failed to fetch habit' });
  }
});

// Log habit completion for today
router.post('/:habitId/log', requireWallet, async (req, res) => {
  try {
    const { completed, notes } = req.body;
    const habitId = req.params.habitId;

    const habit = await Habit.findOne({ 
      _id: habitId, 
      userId: req.user._id 
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    if (!habit.isActive) {
      return res.status(400).json({ error: 'Habit is not active' });
    }

    // Check if habit should be done today
    if (!habit.shouldBeDoneToday()) {
      return res.status(400).json({ error: 'This habit is not scheduled for today' });
    }

    // Check if already logged today
    const existingLog = await HabitLog.getLogForDate(habitId, new Date());
    if (existingLog) {
      return res.status(400).json({ error: 'Habit already logged for today' });
    }

    // Create habit log
    const habitLog = new HabitLog({
      habitId,
      userId: req.user._id,
      date: new Date(),
      completed,
      notes
    });

    await habitLog.save();

    // Process the result
    let result;
    if (completed) {
      result = await processHabitSuccess(habit, habitLog, req.user);
    } else {
      result = await processHabitFailure(habit, habitLog, req.user);
    }

    // Update habit statistics
    await updateHabitStats(habitId);

    res.json({
      message: completed ? 'Habit completed successfully!' : 'Habit failure logged',
      habitLog,
      result
    });
  } catch (error) {
    console.error('Log habit error:', error);
    res.status(500).json({ error: 'Failed to log habit' });
  }
});

// Update habit
router.put('/:habitId', async (req, res) => {
  try {
    const { name, description, daysOfWeek, stakeAmount, isActive } = req.body;
    const habitId = req.params.habitId;

    const habit = await Habit.findOne({ 
      _id: habitId, 
      userId: req.user._id 
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (daysOfWeek) updates.daysOfWeek = daysOfWeek;
    if (stakeAmount) updates.stakeAmount = stakeAmount;
    if (isActive !== undefined) updates.isActive = isActive;

    const updatedHabit = await Habit.findByIdAndUpdate(
      habitId,
      updates,
      { new: true }
    );

    res.json({
      message: 'Habit updated successfully',
      habit: updatedHabit
    });
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

// Delete habit
router.delete('/:habitId', async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ 
      _id: req.params.habitId, 
      userId: req.user._id 
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

// Get habit statistics
router.get('/:habitId/stats', async (req, res) => {
  try {
    const habitId = req.params.habitId;
    
    const habit = await Habit.findOne({ 
      _id: habitId, 
      userId: req.user._id 
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Get statistics
    const stats = await HabitLog.aggregate([
      { $match: { habitId: habit._id } },
      {
        $group: {
          _id: null,
          totalCompletions: {
            $sum: { $cond: ['$completed', 1, 0] }
          },
          totalFailures: {
            $sum: { $cond: ['$completed', 0, 1] }
          },
          totalStaked: { $sum: '$stakeAmount' },
          totalPunished: { $sum: '$punishmentAmount' },
          totalRewarded: { $sum: '$rewardAmount' }
        }
      }
    ]);

    res.json({
      habit,
      stats: stats[0] || {
        totalCompletions: 0,
        totalFailures: 0,
        totalStaked: 0,
        totalPunished: 0,
        totalRewarded: 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Helper function to update habit statistics
async function updateHabitStats(habitId) {
  try {
    const stats = await HabitLog.aggregate([
      { $match: { habitId: habitId } },
      {
        $group: {
          _id: null,
          totalCompletions: { $sum: { $cond: ['$completed', 1, 0] } },
          totalFailures: { $sum: { $cond: ['$completed', 0, 1] } },
          totalStaked: { $sum: '$stakeAmount' },
          totalPunished: { $sum: '$punishmentAmount' }
        }
      }
    ]);

    if (stats.length > 0) {
      await Habit.findByIdAndUpdate(habitId, {
        totalCompletions: stats[0].totalCompletions,
        totalFailures: stats[0].totalFailures,
        totalStaked: stats[0].totalStaked,
        totalPunished: stats[0].totalPunished
      });
    }
  } catch (error) {
    console.error('Update stats error:', error);
  }
}

module.exports = router;
