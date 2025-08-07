const { ethers } = require('ethers');
const User = require('../models/User');

// Validate Ethereum address
const validateAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
};

// Connect wallet middleware
const connectWallet = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    if (!validateAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Update user's wallet address
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        walletAddress: walletAddress.toLowerCase(),
        isWalletConnected: true
      },
      { new: true }
    ).select('-password');

    req.user = user;
    next();
  } catch (error) {
    console.error('Wallet connection error:', error);
    res.status(500).json({ error: 'Failed to connect wallet' });
  }
};

// Verify wallet ownership (optional - for additional security)
const verifyWalletOwnership = async (req, res, next) => {
  try {
    const { signature, message } = req.body;
    
    if (!signature || !message) {
      return res.status(400).json({ error: 'Signature and message required' });
    }

    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Wallet signature verification failed' });
    }

    next();
  } catch (error) {
    console.error('Wallet verification error:', error);
    res.status(500).json({ error: 'Failed to verify wallet ownership' });
  }
};

// Check wallet balance middleware
const checkWalletBalance = async (req, res, next) => {
  try {
    if (!req.user.walletAddress) {
      return res.status(400).json({ error: 'Wallet not connected' });
    }

    // This would typically check the actual balance on-chain
    // For now, we'll just validate the address format
    if (!validateAddress(req.user.walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    next();
  } catch (error) {
    console.error('Balance check error:', error);
    res.status(500).json({ error: 'Failed to check wallet balance' });
  }
};

module.exports = {
  validateAddress,
  connectWallet,
  verifyWalletOwnership,
  checkWalletBalance
};
