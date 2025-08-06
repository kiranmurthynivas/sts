const { ethers } = require('ethers');
const Transaction = require('../models/Transaction');

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.NETWORK_RPC_URL);
    this.charityWallet = process.env.CHARITY_WALLET_ADDRESS;
  }

  // Create a transaction record in database
  async createTransactionRecord(userId, habitId, type, amount, txHash, fromAddress, toAddress, description) {
    try {
      const transaction = new Transaction({
        userId,
        habitId,
        type,
        amount,
        currency: 'MATIC',
        transactionHash: txHash,
        fromAddress,
        toAddress,
        description,
        status: 'pending'
      });

      await transaction.save();
      return transaction;
    } catch (error) {
      console.error('Error creating transaction record:', error);
      throw error;
    }
  }

  // Monitor transaction status
  async monitorTransaction(txHash) {
    try {
      const receipt = await this.provider.waitForTransaction(txHash);
      
      if (receipt) {
        // Update transaction status in database
        await Transaction.findOneAndUpdate(
          { transactionHash: txHash },
          {
            status: receipt.status === 1 ? 'confirmed' : 'failed',
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            confirmedAt: new Date()
          }
        );

        return receipt;
      }
    } catch (error) {
      console.error('Error monitoring transaction:', error);
      
      // Mark transaction as failed
      await Transaction.findOneAndUpdate(
        { transactionHash: txHash },
        { status: 'failed' }
      );
      
      throw error;
    }
  }

  // Get transaction details
  async getTransactionDetails(txHash) {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      return {
        transaction: tx,
        receipt: receipt
      };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      throw error;
    }
  }

  // Validate wallet address
  isValidAddress(address) {
    return ethers.isAddress(address);
  }

  // Get wallet balance
  async getWalletBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  // Estimate gas for transaction
  async estimateGas(to, value) {
    try {
      const gasEstimate = await this.provider.estimateGas({
        to,
        value: ethers.parseEther(value.toString())
      });
      
      return gasEstimate;
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  }

  // Get current gas price
  async getGasPrice() {
    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice;
    } catch (error) {
      console.error('Error getting gas price:', error);
      throw error;
    }
  }

  // Create punishment transaction data
  createPunishmentTxData(userAddress, amount) {
    return {
      to: this.charityWallet,
      value: ethers.parseEther(amount.toString()),
      from: userAddress,
      gasLimit: 21000 // Standard ETH transfer gas limit
    };
  }

  // Create reward transaction data (for meme coins - simplified)
  createRewardTxData(userAddress, tokenAmount = 1000) {
    // This would typically involve a token contract interaction
    // For now, we'll simulate with a small MATIC reward
    return {
      to: userAddress,
      value: ethers.parseEther('0.1'), // 0.1 MATIC as reward
      gasLimit: 21000
    };
  }

  // Format transaction for frontend display
  formatTransactionForDisplay(transaction) {
    return {
      id: transaction._id,
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      hash: transaction.transactionHash,
      status: transaction.status,
      description: transaction.description,
      createdAt: transaction.createdAt,
      confirmedAt: transaction.confirmedAt
    };
  }
}

module.exports = new BlockchainService();
