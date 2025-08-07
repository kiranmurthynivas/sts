const express = require('express');
const { ethers } = require('ethers');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { connectWallet: connectWalletMiddleware } = require('../middleware/wallet');

const router = express.Router();

// Connect wallet
router.post('/connect', connectWalletMiddleware, async (req, res) => {
  try {
    res.json({
      message: 'Wallet connected successfully',
      user: req.user
    });
  } catch (error) {
    console.error('Wallet connection error:', error);
    res.status(500).json({ error: 'Failed to connect wallet' });
  }
});

// Get wallet info
router.get('/info', async (req, res) => {
  try {
    if (!req.user.walletAddress) {
      return res.status(400).json({ error: 'Wallet not connected' });
    }

    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate total stats
    const stats = await Transaction.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$transactionType',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const walletInfo = {
      address: req.user.walletAddress,
      isConnected: req.user.isWalletConnected,
      recentTransactions,
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = { totalAmount: stat.totalAmount, count: stat.count };
        return acc;
      }, {})
    };

    res.json({ walletInfo });
  } catch (error) {
    console.error('Get wallet info error:', error);
    res.status(500).json({ error: 'Failed to get wallet info' });
  }
});

// Get wallet balance (mock implementation)
router.get('/balance', async (req, res) => {
  try {
    if (!req.user.walletAddress) {
      return res.status(400).json({ error: 'Wallet not connected' });
    }

    // In a real implementation, you would query the blockchain
    // For now, we'll return mock data
    const mockBalance = {
      MATIC: Math.random() * 1000,
      ETH: Math.random() * 10,
      SHIBA: Math.random() * 1000000,
      PEPE: Math.random() * 500000
    };

    res.json({ balance: mockBalance });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

// Disconnect wallet
router.post('/disconnect', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        walletAddress: null,
        isWalletConnected: false
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Wallet disconnected successfully',
      user
    });
  } catch (error) {
    console.error('Wallet disconnection error:', error);
    res.status(500).json({ error: 'Failed to disconnect wallet' });
  }
});

// Verify wallet ownership
router.post('/verify', async (req, res) => {
  try {
    const { signature, message } = req.body;

    if (!signature || !message) {
      return res.status(400).json({ error: 'Signature and message required' });
    }

    if (!req.user.walletAddress) {
      return res.status(400).json({ error: 'Wallet not connected' });
    }

    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Wallet signature verification failed' });
    }

    res.json({ 
      message: 'Wallet ownership verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('Wallet verification error:', error);
    res.status(500).json({ error: 'Failed to verify wallet ownership' });
  }
});

// Get transaction history
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    if (type) {
      query.transactionType = type;
    }

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

// Get transaction summary
router.get('/summary', async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
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

    const summaryMap = summary.reduce((acc, item) => {
      acc[item._id] = {
        totalAmount: item.totalAmount,
        count: item.count,
        averageAmount: item.averageAmount
      };
      return acc;
    }, {});

    res.json({ summary: summaryMap });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;
