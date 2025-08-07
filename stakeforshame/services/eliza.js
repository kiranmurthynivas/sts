const axios = require('axios');

let elizaInitialized = false;

// Initialize Eliza with Comput3
const initializeEliza = async () => {
  try {
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_URL) {
      console.warn('⚠️ Eliza AI not configured - missing API credentials');
      return;
    }

    // Test connection to Comput3
    const response = await axios.post(
      `${process.env.OPENAI_API_URL}/chat/completions`,
      {
        model: process.env.SMALL_OPENAI_MODEL || 'llama3:70b',
        messages: [
          {
            role: 'system',
            content: 'You are Eliza, an AI assistant for the Stake-for-Shame habit tracking application. You help users build better habits through accountability and motivation.'
          },
          {
            role: 'user',
            content: 'Hello Eliza!'
          }
        ],
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200) {
      elizaInitialized = true;
      console.log('✅ Eliza AI initialized successfully with Comput3');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Eliza AI:', error.message);
  }
};

// Chat with Eliza
const elizaChat = async (message, user, context = {}) => {
  try {
    if (!elizaInitialized) {
      return {
        message: "I'm sorry, but I'm not available right now. Please try again later.",
        suggestions: [],
        actions: []
      };
    }

    const systemPrompt = `You are Eliza, an AI assistant for the Stake-for-Shame habit tracking application. 

Your role is to:
1. Help users build better habits through accountability and motivation
2. Provide personalized feedback on their habit progress
3. Suggest improvements and strategies
4. Be encouraging but also firm about accountability
5. Help users understand the consequences of their actions

User context:
- User: ${user.username || user.email}
- Wallet connected: ${user.isWalletConnected ? 'Yes' : 'No'}
- Total staked: ${user.totalStaked} MATIC
- Total punished: ${user.totalPunished} MATIC
- Total rewarded: ${user.totalRewarded} MATIC

Current context: ${JSON.stringify(context)}

Be conversational, motivational, and helpful. Keep responses concise but engaging.`;

    const response = await axios.post(
      `${process.env.OPENAI_API_URL}/chat/completions`,
      {
        model: process.env.SMALL_OPENAI_MODEL || 'llama3:70b',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    // Extract suggestions and actions from the response
    const suggestions = extractSuggestions(aiResponse);
    const actions = extractActions(aiResponse);

    return {
      message: aiResponse,
      suggestions,
      actions
    };
  } catch (error) {
    console.error('Eliza chat error:', error);
    return {
      message: "I'm having trouble processing your request right now. Please try again later.",
      suggestions: [],
      actions: []
    };
  }
};

// Get habit feedback from Eliza
const getHabitFeedback = async (habit, logs, user) => {
  try {
    if (!elizaInitialized) {
      return {
        feedback: "AI feedback is not available right now.",
        suggestions: [],
        score: 0
      };
    }

    const completionRate = logs.length > 0 ? logs.filter(log => log.completed).length / logs.length : 0;
    const recentLogs = logs.slice(0, 7); // Last 7 days

    const prompt = `Analyze this habit and provide feedback:

Habit: ${habit.name}
Description: ${habit.description || 'No description'}
Stake amount: ${habit.stakeAmount} MATIC
Days of week: ${habit.daysOfWeek.join(', ')}
Current streak: ${habit.currentStreak}
Longest streak: ${habit.longestStreak}
Completion rate: ${(completionRate * 100).toFixed(1)}%

Recent activity (last 7 days):
${recentLogs.map(log => `${log.date.toDateString()}: ${log.completed ? '✅ Completed' : '❌ Failed'}`).join('\n')}

Provide:
1. Overall assessment (1-10 score)
2. Specific feedback
3. 2-3 actionable suggestions
4. Motivational message

Format as JSON:
{
  "score": number,
  "feedback": "string",
  "suggestions": ["string"],
  "motivation": "string"
}`;

    const response = await axios.post(
      `${process.env.OPENAI_API_URL}/chat/completions`,
      {
        model: process.env.SMALL_OPENAI_MODEL || 'llama3:70b',
        messages: [
          {
            role: 'system',
            content: 'You are an AI habit coach. Provide constructive feedback in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    
    try {
      const feedback = JSON.parse(aiResponse);
      return feedback;
    } catch (parseError) {
      return {
        score: Math.round(completionRate * 10),
        feedback: aiResponse,
        suggestions: [
          "Track your progress daily",
          "Set smaller, achievable goals",
          "Find an accountability partner"
        ],
        motivation: "Every step forward is progress!"
      };
    }
  } catch (error) {
    console.error('Get habit feedback error:', error);
    return {
      score: 5,
      feedback: "Unable to generate AI feedback at this time.",
      suggestions: ["Keep tracking your habits", "Stay consistent"],
      motivation: "You're doing great!"
    };
  }
};

// Process habit analysis
const processHabitAnalysis = async (habit, logs) => {
  try {
    if (!elizaInitialized) {
      return {
        analysis: "AI analysis not available",
        trends: [],
        recommendations: []
      };
    }

    const completionRate = logs.length > 0 ? logs.filter(log => log.completed).length / logs.length : 0;
    const weeklyTrends = calculateWeeklyTrends(logs);

    const prompt = `Analyze this habit data and provide insights:

Habit: ${habit.name}
Total logs: ${logs.length}
Completion rate: ${(completionRate * 100).toFixed(1)}%
Current streak: ${habit.currentStreak}
Stake amount: ${habit.stakeAmount} MATIC

Weekly trends: ${JSON.stringify(weeklyTrends)}

Provide analysis in JSON format:
{
  "analysis": "Overall assessment",
  "trends": ["Trend 1", "Trend 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

    const response = await axios.post(
      `${process.env.OPENAI_API_URL}/chat/completions`,
      {
        model: process.env.SMALL_OPENAI_MODEL || 'llama3:70b',
        messages: [
          {
            role: 'system',
            content: 'You are an AI habit analyst. Provide insights in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    
    try {
      return JSON.parse(aiResponse);
    } catch (parseError) {
      return {
        analysis: aiResponse,
        trends: weeklyTrends,
        recommendations: ["Continue tracking", "Stay consistent"]
      };
    }
  } catch (error) {
    console.error('Process habit analysis error:', error);
    return {
      analysis: "Unable to analyze habit at this time.",
      trends: [],
      recommendations: []
    };
  }
};

// Helper function to extract suggestions from AI response
const extractSuggestions = (response) => {
  const suggestions = [];
  const lines = response.split('\n');
  
  for (const line of lines) {
    if (line.includes('•') || line.includes('-') || line.includes('*')) {
      const suggestion = line.replace(/^[•\-\*]\s*/, '').trim();
      if (suggestion) suggestions.push(suggestion);
    }
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
};

// Helper function to extract actions from AI response
const extractActions = (response) => {
  const actions = [];
  const actionKeywords = ['create', 'update', 'delete', 'log', 'check', 'review'];
  
  for (const keyword of actionKeywords) {
    if (response.toLowerCase().includes(keyword)) {
      actions.push(keyword);
    }
  }
  
  return actions;
};

// Helper function to calculate weekly trends
const calculateWeeklyTrends = (logs) => {
  const trends = [];
  const weeks = {};
  
  logs.forEach(log => {
    const weekStart = new Date(log.date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = { completed: 0, total: 0 };
    }
    weeks[weekKey].total++;
    if (log.completed) weeks[weekKey].completed++;
  });
  
  const weekEntries = Object.entries(weeks).sort();
  for (let i = 1; i < weekEntries.length; i++) {
    const prevWeek = weekEntries[i - 1][1];
    const currWeek = weekEntries[i][1];
    
    const prevRate = prevWeek.total > 0 ? prevWeek.completed / prevWeek.total : 0;
    const currRate = currWeek.total > 0 ? currWeek.completed / currWeek.total : 0;
    
    if (currRate > prevRate) {
      trends.push('Improving');
    } else if (currRate < prevRate) {
      trends.push('Declining');
    } else {
      trends.push('Stable');
    }
  }
  
  return trends;
};

module.exports = {
  initializeEliza,
  elizaChat,
  getHabitFeedback,
  processHabitAnalysis
};
