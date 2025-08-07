import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHistory, FaCoins, FaArrowUp, FaArrowDown, FaExternalLinkAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions');
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'stake':
        return <FaCoins className="text-yellow-400" />;
      case 'punishment':
        return <FaArrowDown className="text-red-400" />;
      case 'reward':
        return <FaArrowUp className="text-green-400" />;
      case 'return':
        return <FaArrowUp className="text-blue-400" />;
      default:
        return <FaHistory className="text-gray-400" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'stake':
        return 'text-yellow-400';
      case 'punishment':
        return 'text-red-400';
      case 'reward':
        return 'text-green-400';
      case 'return':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.transactionType === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Transaction History</h1>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Transactions</option>
            <option value="stake">Stakes</option>
            <option value="punishment">Punishments</option>
            <option value="reward">Rewards</option>
            <option value="return">Returns</option>
          </select>
        </div>
      </div>

      <div className="glass rounded-lg p-6">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {filteredTransactions.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {getTransactionIcon(tx.transactionType)}
                  </div>
                  <div>
                    <p className={`font-medium ${getTransactionColor(tx.transactionType)}`}>
                      {tx.transactionType.charAt(0).toUpperCase() + tx.transactionType.slice(1)}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {tx.habitId ? `Habit: ${tx.habitId}` : 'System Transaction'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} {tx.tokenType}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {tx.status}
                  </p>
                  {tx.transactionHash && (
                    <a
                      href={`https://polygonscan.com/tx/${tx.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs flex items-center space-x-1"
                    >
                      <span>View on Explorer</span>
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaHistory className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Transactions Yet</h3>
            <p className="text-gray-300">
              {filter === 'all' 
                ? 'Start creating habits to see your transaction history'
                : `No ${filter} transactions found`
              }
            </p>
          </div>
        )}
      </div>

      {/* Transaction Summary */}
      {transactions.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="glass rounded-lg p-4 text-center">
            <h3 className="text-gray-300 text-sm mb-2">Total Staked</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {transactions
                .filter(tx => tx.transactionType === 'stake')
                .reduce((sum, tx) => sum + tx.amount, 0)
                .toFixed(2)} MATIC
            </p>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <h3 className="text-gray-300 text-sm mb-2">Total Punished</h3>
            <p className="text-2xl font-bold text-red-400">
              {transactions
                .filter(tx => tx.transactionType === 'punishment')
                .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
                .toFixed(2)} MATIC
            </p>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <h3 className="text-gray-300 text-sm mb-2">Total Rewarded</h3>
            <p className="text-2xl font-bold text-green-400">
              {transactions
                .filter(tx => tx.transactionType === 'reward')
                .reduce((sum, tx) => sum + tx.amount, 0)
                .toFixed(2)} MATIC
            </p>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <h3 className="text-gray-300 text-sm mb-2">Total Returns</h3>
            <p className="text-2xl font-bold text-blue-400">
              {transactions
                .filter(tx => tx.transactionType === 'return')
                .reduce((sum, tx) => sum + tx.amount, 0)
                .toFixed(2)} MATIC
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
