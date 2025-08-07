const { ethers } = require('ethers');
const Transaction = require('../models/Transaction');

let provider = null;
let signer = null;

// Initialize Web3
const initializeWeb3 = () => {
  try {
    const network = process.env.ETHEREUM_NETWORK || 'polygon';
    const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
    
    provider = new ethers.JsonRpcProvider(rpcUrl);
    
    if (process.env.PRIVATE_KEY) {
      signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      console.log('✅ Web3 initialized with signer');
    } else {
      console.log('⚠️ Web3 initialized without signer (private key not provided)');
    }
    
    console.log(`🌐 Connected to ${network} network`);
  } catch (error) {
    console.error('❌ Failed to initialize Web3:', error.message);
  }
};

// Get provider
const getProvider = () => {
  if (!provider) {
    initializeWeb3();
  }
  return provider;
};

// Get signer
const getSigner = () => {
  if (!signer) {
    console.warn('No signer available - private key not configured');
    return null;
  }
  return signer;
};

// Send MATIC transaction
const sendMaticTransaction = async (fromAddress, toAddress, amount, user) => {
  try {
    const signer = getSigner();
    if (!signer) {
      throw new Error('No signer available');
    }

    const tx = {
      to: toAddress,
      value: ethers.parseEther(amount.toString())
    };

    const transaction = await signer.sendTransaction(tx);
    const receipt = await transaction.wait();

    // Save transaction to database
    const dbTransaction = new Transaction({
      userId: user._id,
      transactionHash: transaction.hash,
      transactionType: 'stake',
      amount: amount,
      tokenType: 'MATIC',
      fromAddress: fromAddress,
      toAddress: toAddress,
      network: process.env.ETHEREUM_NETWORK || 'polygon',
      status: 'confirmed',
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: receipt.gasPrice.toString()
    });

    await dbTransaction.save();

    return {
      success: true,
      transactionHash: transaction.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Send MATIC transaction error:', error);
    throw error;
  }
};

// Send punishment transaction
const sendPunishmentTransaction = async (fromAddress, amount, habit, user) => {
  try {
    const charityAddress = process.env.CHARITY_WALLET_ADDRESS;
    if (!charityAddress) {
      throw new Error('Charity wallet address not configured');
    }

    const result = await sendMaticTransaction(fromAddress, charityAddress, amount, user);
    
    // Update transaction type
    await Transaction.findOneAndUpdate(
      { transactionHash: result.transactionHash },
      { transactionType: 'punishment' }
    );

    return result;
  } catch (error) {
    console.error('Send punishment transaction error:', error);
    throw error;
  }
};

// Send reward transaction
const sendRewardTransaction = async (toAddress, amount, habit, user) => {
  try {
    const result = await sendMaticTransaction(
      process.env.CHARITY_WALLET_ADDRESS || toAddress,
      toAddress,
      amount,
      user
    );
    
    // Update transaction type
    await Transaction.findOneAndUpdate(
      { transactionHash: result.transactionHash },
      { transactionType: 'reward' }
    );

    return result;
  } catch (error) {
    console.error('Send reward transaction error:', error);
    throw error;
  }
};

// Send meme coin reward
const sendMemeCoinReward = async (toAddress, coinType, amount, user) => {
  try {
    const signer = getSigner();
    if (!signer) {
      throw new Error('No signer available');
    }

    let tokenAddress;
    switch (coinType.toLowerCase()) {
      case 'shiba':
        tokenAddress = process.env.SHIBA_TOKEN_ADDRESS;
        break;
      case 'pepe':
        tokenAddress = process.env.PEPE_TOKEN_ADDRESS;
        break;
      default:
        throw new Error('Unsupported meme coin type');
    }

    if (!tokenAddress) {
      throw new Error(`${coinType} token address not configured`);
    }

    // ERC-20 token transfer
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function decimals() view returns (uint8)'
      ],
      signer
    );

    const decimals = await tokenContract.decimals();
    const amountWei = ethers.parseUnits(amount.toString(), decimals);

    const transaction = await tokenContract.transfer(toAddress, amountWei);
    const receipt = await transaction.wait();

    // Save transaction to database
    const dbTransaction = new Transaction({
      userId: user._id,
      transactionHash: transaction.hash,
      transactionType: 'meme_coin_reward',
      amount: amount,
      tokenType: coinType.toUpperCase(),
      fromAddress: await signer.getAddress(),
      toAddress: toAddress,
      network: process.env.ETHEREUM_NETWORK || 'polygon',
      status: 'confirmed',
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: receipt.gasPrice.toString()
    });

    await dbTransaction.save();

    return {
      success: true,
      transactionHash: transaction.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Send meme coin reward error:', error);
    throw error;
  }
};

// Check wallet balance
const checkWalletBalance = async (address) => {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Check wallet balance error:', error);
    throw error;
  }
};

// Verify transaction
const verifyTransaction = async (transactionHash) => {
  try {
    const provider = getProvider();
    const receipt = await provider.getTransactionReceipt(transactionHash);
    
    if (!receipt) {
      return { status: 'pending' };
    }

    return {
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      confirmations: receipt.confirmations
    };
  } catch (error) {
    console.error('Verify transaction error:', error);
    throw error;
  }
};

// Get transaction details
const getTransactionDetails = async (transactionHash) => {
  try {
    const provider = getProvider();
    const transaction = await provider.getTransaction(transactionHash);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return {
      hash: transaction.hash,
      from: transaction.from,
      to: transaction.to,
      value: ethers.formatEther(transaction.value),
      gasPrice: ethers.formatUnits(transaction.gasPrice, 'gwei'),
      nonce: transaction.nonce,
      blockNumber: transaction.blockNumber
    };
  } catch (error) {
    console.error('Get transaction details error:', error);
    throw error;
  }
};

// Estimate gas for transaction
const estimateGas = async (fromAddress, toAddress, amount) => {
  try {
    const provider = getProvider();
    const tx = {
      from: fromAddress,
      to: toAddress,
      value: ethers.parseEther(amount.toString())
    };

    const gasEstimate = await provider.estimateGas(tx);
    return gasEstimate.toString();
  } catch (error) {
    console.error('Estimate gas error:', error);
    throw error;
  }
};

// Get current gas price
const getGasPrice = async () => {
  try {
    const provider = getProvider();
    const gasPrice = await provider.getFeeData();
    return {
      gasPrice: ethers.formatUnits(gasPrice.gasPrice, 'gwei'),
      maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei') : null
    };
  } catch (error) {
    console.error('Get gas price error:', error);
    throw error;
  }
};

module.exports = {
  initializeWeb3,
  getProvider,
  getSigner,
  sendMaticTransaction,
  sendPunishmentTransaction,
  sendRewardTransaction,
  sendMemeCoinReward,
  checkWalletBalance,
  verifyTransaction,
  getTransactionDetails,
  estimateGas,
  getGasPrice
};
