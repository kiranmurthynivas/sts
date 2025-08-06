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
    required: true
  },
  completed: {
    type: Boolean,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  loggedAt: {
    type: Date,
    default: Date.now
  },
  streakCount: {
    type: Number,
    default: 0
  },
  punishmentTriggered: {
    type: Boolean,
    default: false
  },
  rewardTriggered: {
    type: Boolean,
    default: false
  }
});

// Ensure one log entry per habit per day
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HabitLog', habitLogSchema);
