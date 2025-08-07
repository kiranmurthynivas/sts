const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: false
  },
  habitLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HabitLog',
    required: false
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  transactionType: {
    type: String,
    enum: ['stake', 'punishment', 'reward', 'return', 'meme_coin_reward'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  tokenType: {
    type: String,
    enum: ['MATIC', 'SHIBA', 'PEPE', 'ETH'],
    default: 'MATIC'
  },
  fromAddress: {
    type: String,
    required: true
  },
  toAddress: {
    type: String,
    required: true
  },
  network: {
    type: String,
    enum: ['polygon', 'ethereum', 'testnet'],
    default: 'polygon'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  blockNumber: {
    type: Number,
    default: null
  },
  gasUsed: {
    type: Number,
    default: null
  },
  gasPrice: {
    type: Number,
    default: null
  },
  errorMessage: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ transactionHash: 1 }, { unique: true });
transactionSchema.index({ status: 1 });
transactionSchema.index({ transactionType: 1 });
transactionSchema.index({ habitId: 1 });

// Method to get transaction summary for user
transactionSchema.statics.getUserSummary = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$transactionType',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Method to get recent transactions
transactionSchema.statics.getRecentTransactions = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('habitId', 'name')
    .populate('habitLogId', 'date completed');
};

// Method to check if transaction exists
transactionSchema.statics.transactionExists = function(transactionHash) {
  return this.findOne({ transactionHash });
};

module.exports = mongoose.model('Transaction', transactionSchema);
