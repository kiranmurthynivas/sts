import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { FaWallet, FaCoins, FaExchangeAlt, FaHistory, FaCopy } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Wallet = () => {
  const { isConnected, connectWallet, disconnectWallet, balance, address } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchTransactions();
    }
  }, [isConnected]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual API call
      // const response = await axios.get('/api/transactions');
      // setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard!');
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Wallet</h1>
        {isConnected ? (
          <button
            onClick={disconnectWallet}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200"
          >
            Disconnect Wallet
          </button>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
          >
            <FaWallet />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>

      {!isConnected ? (
        <div className="glass rounded-lg p-8 text-center">
          <FaWallet className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300 mb-6">
            Connect your MetaMask wallet to start staking crypto for habit accountability
          </p>
          <button
            onClick={connectWallet}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
          >
            Connect MetaMask
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Wallet Info */}
          <div className="glass rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Wallet Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                <div className="flex items-center space-x-2">
                  <code className="bg-white/10 px-3 py-2 rounded-lg text-white font-mono">
                    {formatAddress(address)}
                  </code>
                  <button
                    onClick={copyAddress}
                    className="text-gray-400 hover:text-white"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Balance</label>
                <div className="flex items-center space-x-2">
                  <FaCoins className="text-yellow-400" />
                  <span className="text-white font-medium text-lg">
                    {balance ? `${balance} MATIC` : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
                <FaCoins className="text-2xl mx-auto mb-2" />
                <span>Stake MATIC</span>
              </button>
              <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200">
                <FaExchangeAlt className="text-2xl mx-auto mb-2" />
                <span>Swap Tokens</span>
              </button>
              <button className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200">
                <FaHistory className="text-2xl mx-auto mb-2" />
                <span>View History</span>
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="glass rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{tx.type}</p>
                      <p className="text-gray-300 text-sm">{tx.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount} MATIC
                      </p>
                      <p className="text-gray-300 text-sm">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaHistory className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">No transactions yet</p>
                <p className="text-gray-400 text-sm">Start creating habits to see your transaction history</p>
              </div>
            )}
          </div>

          {/* Token Balances */}
          <div className="glass rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Token Balances</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full"></div>
                  <div>
                    <p className="text-white font-medium">MATIC</p>
                    <p className="text-gray-300 text-sm">Polygon</p>
                  </div>
                </div>
                <span className="text-white font-medium">{balance || '0'} MATIC</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
                  <div>
                    <p className="text-white font-medium">SHIBA</p>
                    <p className="text-gray-300 text-sm">Meme Coin</p>
                  </div>
                </div>
                <span className="text-white font-medium">0 SHIBA</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
