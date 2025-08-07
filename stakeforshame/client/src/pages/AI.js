import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaRobot, FaPaperPlane, FaLightbulb, FaChartLine } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AI = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: "Hello! I'm Eliza, your AI habit coach. I'm here to help you build better habits through accountability and motivation. How can I assist you today?",
        timestamp: new Date()
      }
    ]);
    
    fetchInsights();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchInsights = async () => {
    try {
      const response = await axios.get('/api/ai/insights');
      setInsights(response.data.insights);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/ai/chat', {
        message: inputMessage
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.message,
        suggestions: response.data.suggestions || [],
        actions: response.data.actions || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">AI Assistant</h1>
        <div className="flex items-center space-x-2">
          <FaRobot className="text-2xl text-purple-400" />
          <span className="text-gray-300">Eliza AI</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <div className="glass rounded-lg h-96 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestion(suggestion)}
                            className="block w-full text-left text-xs bg-white/20 rounded px-2 py-1 hover:bg-white/30 transition-all duration-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-sm">Eliza is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/20">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask Eliza about your habits..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="space-y-4">
          <div className="glass rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <FaLightbulb className="text-yellow-400" />
              <span>AI Insights</span>
            </h3>
            {insights ? (
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <h4 className="text-white font-medium mb-1">Current Streak</h4>
                  <p className="text-gray-300 text-sm">{insights.currentStreak || 0} days</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <h4 className="text-white font-medium mb-1">Completion Rate</h4>
                  <p className="text-gray-300 text-sm">{insights.completionRate || 0}%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <h4 className="text-white font-medium mb-1">Total Staked</h4>
                  <p className="text-gray-300 text-sm">{insights.totalStaked || 0} MATIC</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-300 text-sm">Loading insights...</p>
            )}
          </div>

          <div className="glass rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <FaChartLine className="text-blue-400" />
              <span>Quick Actions</span>
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleSuggestion("How can I improve my habit consistency?")}
                className="w-full text-left bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-200"
              >
                <p className="text-white text-sm font-medium">Improve Consistency</p>
                <p className="text-gray-300 text-xs">Get tips for better habit tracking</p>
              </button>
              <button
                onClick={() => handleSuggestion("What should I do if I miss a habit?")}
                className="w-full text-left bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-200"
              >
                <p className="text-white text-sm font-medium">Missed Habit</p>
                <p className="text-gray-300 text-xs">Guidance for getting back on track</p>
              </button>
              <button
                onClick={() => handleSuggestion("Show me my progress summary")}
                className="w-full text-left bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-200"
              >
                <p className="text-white text-sm font-medium">Progress Summary</p>
                <p className="text-gray-300 text-xs">View your overall progress</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AI;
