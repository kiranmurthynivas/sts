const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  completed: {
    type: Boolean,
    required: true
  },
  stakeAmount: {
    type: Number,
    default: 0
  },
  punishmentAmount: {
    type: Number,
    default: 0
  },
  rewardAmount: {
    type: Number,
    default: 0
  },
  transactionHash: {
    type: String,
    default: null
  },
  transactionType: {
    type: String,
    enum: ['stake', 'punishment', 'reward', 'return'],
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  aiFeedback: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
habitLogSchema.index({ habitId: 1, date: -1 });
habitLogSchema.index({ userId: 1, date: -1 });
habitLogSchema.index({ date: 1 });

// Compound index for unique daily logs per habit
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

// Method to get log for specific date
habitLogSchema.statics.getLogForDate = function(habitId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.findOne({
    habitId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
};

// Method to get streak count
habitLogSchema.statics.getCurrentStreak = function(habitId) {
  return this.aggregate([
    { $match: { habitId: mongoose.Types.ObjectId(habitId), completed: true } },
    { $sort: { date: -1 } },
    {
      $group: {
        _id: null,
        streak: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: [{ $dayOfYear: "$date" }, { $dayOfYear: { $subtract: ["$date", { $multiply: ["$index", 24 * 60 * 60 * 1000] }] } }] },
                  { $gte: [{ $subtract: [{ $dayOfYear: "$date" }, { $dayOfYear: { $subtract: ["$date", { $multiply: ["$index", 24 * 60 * 60 * 1000] }] } }] }, 1] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('HabitLog', habitLogSchema);
