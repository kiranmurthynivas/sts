import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaWallet, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const [stats, setStats] = useState({
    totalHabits: 0,
    totalStaked: 0,
    totalPunished: 0,
    totalRewarded: 0,
    currentStreak: 0,
    longestStreak: 0
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || ''
      });
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      // This would be replaced with actual API calls
      // const response = await axios.get('/api/user/stats');
      // setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || ''
    });
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
          >
            <FaEdit />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="glass rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
            
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
                  >
                    <FaSave />
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2"
                  >
                    <FaTimes />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="flex items-center space-x-3">
                    <FaUser className="text-gray-400" />
                    <span className="text-white">{user?.username || 'Not set'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="flex items-center space-x-3">
                    <FaEnvelope className="text-gray-400" />
                    <span className="text-white">{user?.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Wallet Address
                  </label>
                  <div className="flex items-center space-x-3">
                    <FaWallet className="text-gray-400" />
                    <span className="text-white font-mono">
                      {user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'Not connected'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Member Since
                  </label>
                  <span className="text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <div className="glass rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Habits</span>
                <span className="text-white font-medium">{stats.totalHabits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Current Streak</span>
                <span className="text-green-400 font-medium">{stats.currentStreak} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Longest Streak</span>
                <span className="text-blue-400 font-medium">{stats.longestStreak} days</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Staked</span>
                <span className="text-yellow-400 font-medium">{stats.totalStaked} MATIC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Punished</span>
                <span className="text-red-400 font-medium">{stats.totalPunished} MATIC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Rewarded</span>
                <span className="text-green-400 font-medium">{stats.totalRewarded} MATIC</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Wallet Connected</span>
                <span className={`font-medium ${user?.isWalletConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {user?.isWalletConnected ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Account Status</span>
                <span className={`font-medium ${user?.isActive ? 'text-green-400' : 'text-red-400'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
