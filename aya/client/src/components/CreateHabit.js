import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import elizaService from '../services/elizaService';
import './CreateHabit.css';

function CreateHabit() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [habitData, setHabitData] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize conversation when component mounts
  useEffect(() => {
    initializeConversation();
  }, []);

  const initializeConversation = async () => {
    setIsLoading(true);
    try {
      const response = await elizaService.startConversation();
      setMessages([{
        id: Date.now(),
        text: response.message,
        sender: 'ai',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error initializing conversation:', error);
      setMessages([{
        id: Date.now(),
        text: "Hey there! 👋 I'm Eliza, your AI habit coach! I'm here to help you create an awesome habit backed by crypto stakes. What habit would you like to work on today? 💪",
        sender: 'ai',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await elizaService.sendMessage(userMessage.text);
      
      setIsTyping(false);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: response.message,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (response.isComplete) {
        setIsComplete(true);
        setHabitData(response.extractedData);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Oops! I had a little hiccup there. Can you repeat that? I'm still here to help you create an amazing habit! 😅",
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateHabit = async () => {
    if (!habitData) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/habits', {
        ...habitData,
        userId: user._id
      });

      if (response.data.success) {
        setSuccess('🎉 Habit created successfully! Your crypto is now your accountability partner! 💎🚀');
        
        // Add success message to chat
        const successMessage = {
          id: Date.now(),
          text: "🎉 BOOM! Your habit has been officially created and your MATIC is staked! Welcome to the accountability game - your future self will thank you (and your wallet will keep you honest)! 💎🚀\n\nYou can now track your progress in the dashboard. Remember: diamond hands for habits! 💪",
          sender: 'ai',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, successMessage]);
        
        // Reset after delay
        setTimeout(() => {
          resetConversation();
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating habit:', error);
      setError('Failed to create habit. Please try again.');
      
      const errorMessage = {
        id: Date.now(),
        text: "Oops! There was an issue creating your habit. Don't worry, your conversation is saved. Let's try again! 😅",
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    elizaService.resetConversation();
    setMessages([]);
    setHabitData(null);
    setIsComplete(false);
    setSuccess('');
    setError('');
    initializeConversation();
  };

  const formatMessage = (text) => {
    // Convert line breaks to JSX
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="create-habit">
      <div className="create-habit-container">
        <div className="habit-header">
          <span className="habit-mascot">🤖</span>
          <h1>AI Habit Creator</h1>
          <p>Chat with Eliza to create your perfect habit! 💬✨</p>
          <div className="ai-badge">
            <span className="ai-icon">🧠</span>
            <span>Powered by ElizaOS via Comput3</span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">😅</span>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="success-icon">🎉</span>
            {success}
          </div>
        )}

        <div className="chat-container">
          <div className="messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-avatar">
                  {message.sender === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {formatMessage(message.text)}
                  </div>
                  <div className="message-timestamp">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message ai-message">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {isComplete && habitData && (
            <div className="habit-summary">
              <h3>📋 Habit Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Habit:</span>
                  <span className="summary-value">{habitData.name}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Frequency:</span>
                  <span className="summary-value">{habitData.frequency}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Stake:</span>
                  <span className="summary-value">{habitData.stakeAmount} MATIC</span>
                </div>
                {habitData.daysOfWeek.length > 0 && (
                  <div className="summary-item">
                    <span className="summary-label">Days:</span>
                    <span className="summary-value">{habitData.daysOfWeek.join(', ')}</span>
                  </div>
                )}
              </div>
              <button
                className="create-habit-btn"
                onClick={handleCreateHabit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Creating Habit...
                  </>
                ) : (
                  <>
                    💎 Stake My MATIC & Create Habit! 🚀
                  </>
                )}
              </button>
            </div>
          )}

          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <textarea
                ref={inputRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me about the habit you want to create..."
                className="chat-input"
                rows="1"
                disabled={isLoading}
              />
              <button
                className="send-button"
                onClick={handleSendMessage}
                disabled={isLoading || !currentMessage.trim()}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  '🚀'
                )}
              </button>
            </div>
            <div className="chat-actions">
              <button
                className="reset-button"
                onClick={resetConversation}
                disabled={isLoading}
              >
                🔄 Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateHabit;
