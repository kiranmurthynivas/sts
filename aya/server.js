const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Habit = require('./models/Habit');
const HabitLog = require('./models/HabitLog');
const Transaction = require('./models/Transaction');

// Import services
const mcpService = require('./services/mcpService');

// Import routes
const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const transactionRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3001', // React app URL
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Configure passport-local strategy
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Cron jobs for daily habit evaluation and reminders
// Run daily at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily habit reminders...');
  try {
    await mcpService.sendDailyReminders();
  } catch (error) {
    console.error('Error in daily reminders cron job:', error);
  }
});

// Run daily at 11 PM to evaluate missed habits
cron.schedule('0 23 * * *', async () => {
  console.log('Running daily habit evaluation...');
  try {
    await mcpService.evaluateHabits();
  } catch (error) {
    console.error('Error in daily evaluation cron job:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Stake-for-Shame server running on port ${PORT}`);
  console.log(`📊 MongoDB: ${process.env.MONGODB_URI}`);
  console.log(`🤖 AI Model: ${process.env.LARGE_OPENAI_MODEL}`);
  console.log(`⛓️  Charity Wallet: ${process.env.CHARITY_WALLET_ADDRESS}`);
  console.log(`🕘 Daily reminders: 9:00 AM`);
  console.log(`🕚 Daily evaluation: 11:00 PM`);
});

module.exports = app;
