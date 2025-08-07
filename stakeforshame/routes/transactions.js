const express = require('express');
const Transaction = require('../models/Transaction');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

const router = express.Router();

// Get all transactions for user
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    if (type) query.transactionType = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('habitId', 'name')
      .populate('habitLogId', 'date completed');

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTransactions: total,
        hasNextPage: skip + transactions.length < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction by ID
router.get('/:transactionId', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.transactionId,
      userId: req.user._id
    })
    .populate('habitId', 'name')
    .populate('habitLogId', 'date completed');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Get transaction summary
router.get('/summary/stats', async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$transactionType',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    const summary = stats.reduce((acc, stat) => {
      acc[stat._id] = {
        totalAmount: stat.totalAmount,
        count: stat.count,
        averageAmount: stat.averageAmount
      };
      return acc;
    }, {});

    res.json({ summary });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Get recent transactions
router.get('/recent/list', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('habitId', 'name')
      .populate('habitLogId', 'date completed');

    res.json({ transactions });
  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch recent transactions' });
  }
});

// Get transactions by habit
router.get('/habit/:habitId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const habit = await Habit.findOne({
      _id: req.params.habitId,
      userId: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const transactions = await Transaction.find({
      habitId: habit._id,
      userId: req.user._id
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('habitLogId', 'date completed');

    const total = await Transaction.countDocuments({
      habitId: habit._id,
      userId: req.user._id
    });

    res.json({
      transactions,
      habit,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTransactions: total,
        hasNextPage: skip + transactions.length < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get habit transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch habit transactions' });
  }
});

// Get transaction analytics
router.get('/analytics/overview', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const analytics = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            type: '$transactionType',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          dailyData: {
            $push: {
              date: '$_id.date',
              totalAmount: '$totalAmount',
              count: '$count'
            }
          },
          totalAmount: { $sum: '$totalAmount' },
          totalCount: { $sum: '$count' }
        }
      }
    ]);

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get transaction status
router.get('/status/:transactionId', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.transactionId,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // In a real implementation, you would check the blockchain status
    // For now, we'll return the stored status
    res.json({
      transactionId: transaction._id,
      status: transaction.status,
      transactionHash: transaction.transactionHash,
      blockNumber: transaction.blockNumber,
      confirmedAt: transaction.confirmedAt
    });
  } catch (error) {
    console.error('Get transaction status error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction status' });
  }
});

// Get transaction types summary
router.get('/types/summary', async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$transactionType',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          lastTransaction: { $max: '$createdAt' }
        }
      },
      {
        $project: {
          transactionType: '$_id',
          totalAmount: 1,
          count: 1,
          lastTransaction: 1,
          averageAmount: { $divide: ['$totalAmount', '$count'] }
        }
      }
    ]);

    res.json({ summary });
  } catch (error) {
    console.error('Get types summary error:', error);
    res.status(500).json({ error: 'Failed to fetch types summary' });
  }
});

module.exports = router;
