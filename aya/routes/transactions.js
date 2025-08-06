const express = require('express');
const Transaction = require('../models/Transaction');
const blockchainService = require('../utils/blockchain');

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Get all transactions for the current user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    
    const query = { userId: req.user._id };
    
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('habitId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    const formattedTransactions = transactions.map(tx => 
      blockchainService.formatTransactionForDisplay(tx)
    );

    res.json({
      transactions: formattedTransactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get a specific transaction
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('habitId', 'name');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Get blockchain details if transaction is confirmed
    let blockchainDetails = null;
    if (transaction.status === 'confirmed' && transaction.transactionHash) {
      try {
        blockchainDetails = await blockchainService.getTransactionDetails(transaction.transactionHash);
      } catch (error) {
        console.error('Error getting blockchain details:', error);
      }
    }

    res.json({
      transaction: blockchainService.formatTransactionForDisplay(transaction),
      blockchainDetails
    });

  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Update transaction status (called by frontend after blockchain confirmation)
router.put('/:id/status', isAuthenticated, async (req, res) => {
  try {
    const { status, transactionHash, blockNumber, gasUsed } = req.body;

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update transaction status
    transaction.status = status;
    if (transactionHash) transaction.transactionHash = transactionHash;
    if (blockNumber) transaction.blockNumber = blockNumber;
    if (gasUsed) transaction.gasUsed = gasUsed;
    
    if (status === 'confirmed') {
      transaction.confirmedAt = new Date();
    }

    await transaction.save();

    // Monitor the transaction for confirmation
    if (status === 'pending' && transactionHash) {
      // Start monitoring in background
      blockchainService.monitorTransaction(transactionHash).catch(error => {
        console.error('Error monitoring transaction:', error);
      });
    }

    res.json({
      message: 'Transaction status updated',
      transaction: blockchainService.formatTransactionForDisplay(transaction)
    });

  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({ error: 'Failed to update transaction status' });
  }
});

// Get transaction statistics for the user
router.get('/stats/summary', isAuthenticated, async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const summary = {
      totalTransactions: 0,
      totalStaked: 0,
      totalPunishments: 0,
      totalRewards: 0,
      totalRefunds: 0
    };

    stats.forEach(stat => {
      summary.totalTransactions += stat.count;
      
      switch (stat._id) {
        case 'stake':
          summary.totalStaked = stat.totalAmount;
          break;
        case 'punishment':
          summary.totalPunishments = stat.totalAmount;
          break;
        case 'reward':
          summary.totalRewards = stat.totalAmount;
          break;
        case 'refund':
          summary.totalRefunds = stat.totalAmount;
          break;
      }
    });

    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId: req.user._id })
      .populate('habitId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      summary,
      recentTransactions: recentTransactions.map(tx => 
        blockchainService.formatTransactionForDisplay(tx)
      )
    });

  } catch (error) {
    console.error('Error getting transaction stats:', error);
    res.status(500).json({ error: 'Failed to get transaction statistics' });
  }
});

// Retry failed transaction
router.post('/:id/retry', isAuthenticated, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'failed'
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Failed transaction not found' });
    }

    // Reset transaction status
    transaction.status = 'pending';
    transaction.transactionHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`;
    transaction.confirmedAt = null;
    
    await transaction.save();

    // Create new transaction data for frontend
    let txData;
    if (transaction.type === 'punishment') {
      txData = blockchainService.createPunishmentTxData(
        transaction.fromAddress, 
        transaction.amount
      );
    } else if (transaction.type === 'reward') {
      txData = blockchainService.createRewardTxData(
        transaction.toAddress, 
        transaction.amount
      );
    }

    res.json({
      message: 'Transaction retry initiated',
      transaction: blockchainService.formatTransactionForDisplay(transaction),
      txData
    });

  } catch (error) {
    console.error('Error retrying transaction:', error);
    res.status(500).json({ error: 'Failed to retry transaction' });
  }
});

module.exports = router;
