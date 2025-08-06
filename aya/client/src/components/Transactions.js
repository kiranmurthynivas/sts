import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [page, filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10
      };
      
      if (filter !== 'all') {
        params.type = filter;
      }

      const response = await axios.get('/transactions', { params });
      setTransactions(response.data.transactions || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/transactions/stats/summary');
      setStats(response.data.summary);
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'punishment': return '😱';
      case 'reward': return '🏆';
      case 'stake': return '💰';
      case 'refund': return '↩️';
      default: return '💸';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending', class: 'pending' },
      confirmed: { text: 'Confirmed', class: 'confirmed' },
      failed: { text: 'Failed', class: 'failed' }
    };
    
    return badges[status] || badges.pending;
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

  const formatHash = (hash) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const openInExplorer = (hash) => {
    window.open(`https://polygonscan.com/tx/${hash}`, '_blank');
  };

  const retryTransaction = async (transactionId) => {
    try {
      const response = await axios.post(`/transactions/${transactionId}/retry`);
      alert('Transaction retry initiated');
      fetchTransactions();
    } catch (error) {
      console.error('Error retrying transaction:', error);
      alert('Failed to retry transaction');
    }
  };

  if (loading && transactions.length === 0) {
    return <div className="loading">Loading transactions...</div>;
  }

  return (
    <div className="transactions">
      <div className="transactions-container">
        {/* Header */}
        <div className="transactions-header">
          <h1>Transaction History</h1>
          <p>Track all your crypto accountability transactions</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="stats-overview">
            <div className="stat-item">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>{stats.totalTransactions}</h3>
                <p>Total Transactions</p>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>{stats.totalStaked.toFixed(2)}</h3>
                <p>MATIC Staked</p>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">😱</div>
              <div className="stat-content">
                <h3>{stats.totalPunishments.toFixed(2)}</h3>
                <p>MATIC Lost</p>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <h3>{stats.totalRewards.toFixed(2)}</h3>
                <p>MATIC Earned</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters">
          <div className="filter-buttons">
            {['all', 'stake', 'punishment', 'reward', 'refund'].map(filterType => (
              <button
                key={filterType}
                className={`filter-btn ${filter === filterType ? 'active' : ''}`}
                onClick={() => {
                  setFilter(filterType);
                  setPage(1);
                }}
              >
                {filterType === 'all' ? 'All' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="transactions-list">
          {transactions.length > 0 ? (
            <>
              {transactions.map(transaction => {
                const statusBadge = getStatusBadge(transaction.status);
                
                return (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-icon">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    <div className="transaction-content">
                      <div className="transaction-main">
                        <div className="transaction-description">
                          {transaction.description}
                        </div>
                        <div className="transaction-amount">
                          {transaction.amount} {transaction.currency}
                        </div>
                      </div>
                      
                      <div className="transaction-meta">
                        <div className="transaction-hash">
                          <button 
                            onClick={() => openInExplorer(transaction.hash)}
                            className="hash-link"
                            title="View on Polygonscan"
                          >
                            {formatHash(transaction.hash)}
                          </button>
                        </div>
                        
                        <div className="transaction-date">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="transaction-status">
                      <span className={`status-badge ${statusBadge.class}`}>
                        {statusBadge.text}
                      </span>
                      
                      {transaction.status === 'failed' && (
                        <button 
                          onClick={() => retryTransaction(transaction.id)}
                          className="retry-btn"
                          title="Retry transaction"
                        >
                          🔄 Retry
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  
                  <span className="pagination-info">
                    Page {pagination.current} of {pagination.pages}
                  </span>
                  
                  <button 
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-transactions">
              <div className="empty-icon">💸</div>
              <h3>No Transactions Yet</h3>
              <p>
                {filter === 'all' 
                  ? 'Start creating habits and logging activities to see your transactions here!'
                  : `No ${filter} transactions found. Try a different filter.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
