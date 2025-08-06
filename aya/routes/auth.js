const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const blockchainService = require('../utils/blockchain');

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({ email });
    await User.register(user, password);

    // Auto-login after registration
    req.login(user, (err) => {
      if (err) {
        console.error('Auto-login error:', err);
        return res.status(500).json({ error: 'Registration successful but login failed' });
      }

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          email: user.email,
          walletAddress: user.walletAddress,
          isWalletConnected: user.isWalletConnected
        }
      });
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Login failed' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.login(user, async (err) => {
      if (err) {
        console.error('Login session error:', err);
        return res.status(500).json({ error: 'Login failed' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          walletAddress: user.walletAddress,
          isWalletConnected: user.isWalletConnected,
          totalStaked: user.totalStaked,
          totalRewards: user.totalRewards
        }
      });
    });
  })(req, res, next);
});

// Logout user
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
router.get('/me', isAuthenticated, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      walletAddress: req.user.walletAddress,
      isWalletConnected: req.user.isWalletConnected,
      totalStaked: req.user.totalStaked,
      totalRewards: req.user.totalRewards,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin
    }
  });
});

// Connect wallet
router.post('/connect-wallet', isAuthenticated, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Validate wallet address
    if (!blockchainService.isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Check if wallet is already connected to another user
    const existingUser = await User.findOne({ 
      walletAddress: walletAddress,
      _id: { $ne: req.user._id }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Wallet already connected to another account' });
    }

    // Update user's wallet
    req.user.walletAddress = walletAddress;
    req.user.isWalletConnected = true;
    await req.user.save();

    // Get wallet balance
    let balance = '0';
    try {
      balance = await blockchainService.getWalletBalance(walletAddress);
    } catch (error) {
      console.error('Error getting wallet balance:', error);
    }

    res.json({
      message: 'Wallet connected successfully',
      user: {
        id: req.user._id,
        email: req.user.email,
        walletAddress: req.user.walletAddress,
        isWalletConnected: req.user.isWalletConnected
      },
      walletBalance: balance
    });

  } catch (error) {
    console.error('Wallet connection error:', error);
    res.status(500).json({ error: 'Failed to connect wallet' });
  }
});

// Disconnect wallet
router.post('/disconnect-wallet', isAuthenticated, async (req, res) => {
  try {
    req.user.walletAddress = null;
    req.user.isWalletConnected = false;
    await req.user.save();

    res.json({
      message: 'Wallet disconnected successfully',
      user: {
        id: req.user._id,
        email: req.user.email,
        walletAddress: req.user.walletAddress,
        isWalletConnected: req.user.isWalletConnected
      }
    });

  } catch (error) {
    console.error('Wallet disconnection error:', error);
    res.status(500).json({ error: 'Failed to disconnect wallet' });
  }
});

// Get wallet balance
router.get('/wallet-balance', isAuthenticated, async (req, res) => {
  try {
    if (!req.user.walletAddress) {
      return res.status(400).json({ error: 'No wallet connected' });
    }

    const balance = await blockchainService.getWalletBalance(req.user.walletAddress);
    
    res.json({
      walletAddress: req.user.walletAddress,
      balance: balance,
      currency: 'MATIC'
    });

  } catch (error) {
    console.error('Error getting wallet balance:', error);
    res.status(500).json({ error: 'Failed to get wallet balance' });
  }
});

module.exports = router;
