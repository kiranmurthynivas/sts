const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const AIAgent = require('./server/ai-agent');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize AI Agent
const aiAgent = new AIAgent();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-vercel-domain.vercel.app' : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Passport configuration
passport.use(new (require('passport-local').Strategy)({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !users) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, users.password);
    if (!isValidPassword) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    return done(null, users);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return done(error);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          name: name || email.split('@')[0]
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Habit routes
app.post('/api/habits', authenticateToken, async (req, res) => {
  try {
    const { habit_name, stake_amount, days } = req.body;
    const userId = req.user.userId;

    const { data: habit, error } = await supabase
      .from('habits')
      .insert([
        {
          user_id: userId,
          habit_name,
          stake_amount,
          days,
          status: 'active',
          streak: 0,
          last_action_date: null
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/habits', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: habits, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/habits/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Get current habit
    const { data: habit, error: fetchError } = await supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Use AI agent to evaluate the habit
    const aiDecision = await aiAgent.evaluateHabit(habit, 'complete', userId);

    // Update habit
    const today = new Date().toISOString().split('T')[0];
    const newStreak = habit.streak + 1;
    const status = newStreak >= 7 ? 'completed' : 'active';

    const { data: updatedHabit, error: updateError } = await supabase
      .from('habits')
      .update({
        streak: newStreak,
        last_action_date: today,
        status: status
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Log AI decision
    await supabase
      .from('ai_decisions')
      .insert([
        {
          habit_id: id,
          user_id: userId,
          decision: aiDecision.decision,
          recommendation: aiDecision.recommendation,
          stake_action: aiDecision.stakeAction,
          reasoning: aiDecision.reasoning,
          confidence: aiDecision.confidence,
          original_response: aiDecision.originalResponse
        }
      ]);

    res.json({
      habit: updatedHabit,
      aiDecision
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/habits/:id/fail', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Get current habit
    const { data: habit, error: fetchError } = await supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Use AI agent to evaluate the habit
    const aiDecision = await aiAgent.evaluateHabit(habit, 'fail', userId);

    // Update habit failure
    const failureCount = (habit.failure_count || 0) + 1;
    const status = failureCount >= 2 ? 'punished' : 'failed_once';

    const { data: updatedHabit, error: updateError } = await supabase
      .from('habits')
      .update({
        failure_count: failureCount,
        status: status,
        last_action_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Log AI decision
    await supabase
      .from('ai_decisions')
      .insert([
        {
          habit_id: id,
          user_id: userId,
          decision: aiDecision.decision,
          recommendation: aiDecision.recommendation,
          stake_action: aiDecision.stakeAction,
          reasoning: aiDecision.reasoning,
          confidence: aiDecision.confidence,
          original_response: aiDecision.originalResponse
        }
      ]);

    res.json({
      habit: updatedHabit,
      aiDecision
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Agent routes
app.post('/api/ai/evaluate-habit', authenticateToken, async (req, res) => {
  try {
    const { habitId, action } = req.body;
    const userId = req.user.userId;

    // Get habit data
    const { data: habit, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single();

    if (error || !habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Evaluate with AI
    const decision = await aiAgent.evaluateHabit(habit, action, userId);
    
    res.json(decision);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Stake-for-Shame server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 AI Agent: ${aiAgent.model}`);
});
