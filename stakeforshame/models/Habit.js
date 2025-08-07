const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  daysOfWeek: {
    type: [String],
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  stakeAmount: {
    type: Number,
    required: true,
    default: 5,
    min: 0.1
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalCompletions: {
    type: Number,
    default: 0
  },
  totalFailures: {
    type: Number,
    default: 0
  },
  totalStaked: {
    type: Number,
    default: 0
  },
  totalPunished: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastChecked: {
    type: Date,
    default: Date.now
  },
  graceFailsUsed: {
    type: Number,
    default: 0
  },
  maxGraceFails: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
habitSchema.index({ userId: 1, isActive: 1 });
habitSchema.index({ userId: 1, createdAt: -1 });

// Method to check if habit should be done today
habitSchema.methods.shouldBeDoneToday = function() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return this.daysOfWeek.includes(today);
};

// Method to get habit status for today
habitSchema.methods.getTodayStatus = function() {
  const today = new Date().toISOString().split('T')[0];
  return this.logs && this.logs.find(log => 
    log.date.toISOString().split('T')[0] === today
  );
};

module.exports = mongoose.model('Habit', habitSchema);
