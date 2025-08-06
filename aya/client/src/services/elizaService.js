// ElizaOS AI Service for Conversational Habit Creation
import axios from 'axios';

class ElizaService {
  constructor() {
    this.baseURL = 'https://launch.comput3.ai'; // Comput3 API endpoint
    this.conversationHistory = [];
    this.habitData = {
      name: '',
      description: '',
      frequency: 'daily',
      daysOfWeek: [],
      stakeAmount: 0,
      category: '',
      reminderTime: '',
      difficulty: 'medium'
    };
  }

  // Initialize conversation with ElizaOS
  async startConversation() {
    const initialPrompt = `You are Eliza, a friendly and motivational AI assistant for the "Stake-for-Shame" crypto-powered habit accountability app. Your job is to help users create new habits through natural conversation.

IMPORTANT GUIDELINES:
1. Be conversational, friendly, and slightly playful with crypto/meme references
2. Extract habit information naturally through conversation
3. Ask follow-up questions to get complete habit details
4. Use emojis and crypto slang occasionally (HODL, diamond hands, etc.)
5. Be encouraging but also mention the "shame" aspect humorously

INFORMATION TO COLLECT:
- Habit name (what they want to do)
- Description (more details about the habit)
- Frequency (daily, weekly, custom days)
- Days of week (if not daily)
- Stake amount in MATIC (how much they're willing to lose)
- Category (health, productivity, learning, etc.)
- Reminder time (optional)
- Difficulty level (easy, medium, hard)

Start by greeting the user and asking what habit they'd like to create. Make it engaging and mention that they'll be staking crypto against their commitment!`;

    try {
      await axios.post(`${this.baseURL}/api/chat`, {
        message: initialPrompt,
        conversation_id: this.generateConversationId(),
        model: 'llama-3-8b-instruct',
        system_prompt: initialPrompt
      });

      const aiResponse = {
        message: "Hey there, future habit champion! 💪✨ Welcome to Stake-for-Shame, where we turn your good intentions into crypto-backed commitments! 🚀\n\nI'm Eliza, your AI habit coach, and I'm here to help you create a habit that'll stick (because nobody wants to lose their precious MATIC, right? 😅).\n\nSo, what habit are you looking to build? Maybe something like working out, reading, coding, or perhaps finally organizing that crypto portfolio? Tell me what you want to commit to! 💎🙌",
        isComplete: false,
        extractedData: {}
      };

      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date().toISOString()
      });

      return aiResponse;
    } catch (error) {
      console.error('Error starting conversation with ElizaOS:', error);
      return {
        message: "Hey there! 👋 I'm Eliza, your AI habit coach! I'm here to help you create an awesome habit backed by crypto stakes. What habit would you like to work on today? 💪",
        isComplete: false,
        extractedData: {}
      };
    }
  }

  // Send user message and get AI response
  async sendMessage(userMessage) {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    });

    try {
      const conversationContext = this.conversationHistory
        .slice(-6) // Keep last 6 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const systemPrompt = `You are Eliza, helping create a habit for the Stake-for-Shame app. Based on the conversation, extract habit information and respond naturally.

CURRENT EXTRACTED DATA: ${JSON.stringify(this.habitData, null, 2)}

INSTRUCTIONS:
1. Continue the natural conversation
2. Ask follow-up questions for missing information
3. When you have enough information, indicate completion
4. Be encouraging but mention the crypto stakes humorously
5. Use crypto/meme references occasionally

REQUIRED INFO TO COLLECT:
- Habit name and description
- Frequency (daily/weekly/custom)
- Days of week (if not daily)
- Stake amount in MATIC
- Category and difficulty

If you have all required information, end your response with: [HABIT_COMPLETE]`;

      const response = await axios.post(`${this.baseURL}/api/chat`, {
        message: `${conversationContext}\nuser: ${userMessage}`,
        conversation_id: this.generateConversationId(),
        model: 'llama-3-8b-instruct',
        system_prompt: systemPrompt
      });

      let aiMessage = response.data.response || response.data.message || "I'm here to help you create an amazing habit! Tell me more about what you'd like to work on.";
      
      // Extract habit information from the conversation
      this.extractHabitData(userMessage, aiMessage);
      
      // Check if habit creation is complete
      const isComplete = aiMessage.includes('[HABIT_COMPLETE]') || this.isHabitDataComplete();
      
      if (isComplete) {
        aiMessage = aiMessage.replace('[HABIT_COMPLETE]', '').trim();
        aiMessage += "\n\n🎉 Perfect! I've got all the details for your habit. Ready to stake your MATIC and make this commitment official? Your future self will thank you (and your wallet will motivate you)! 💎🚀";
      }

      const aiResponse = {
        message: aiMessage,
        isComplete: isComplete,
        extractedData: isComplete ? this.habitData : {}
      };

      this.conversationHistory.push({
        role: 'assistant',
        content: aiMessage,
        timestamp: new Date().toISOString()
      });

      return aiResponse;
    } catch (error) {
      console.error('Error communicating with ElizaOS:', error);
      
      // Fallback response with basic extraction
      this.extractHabitData(userMessage, '');
      
      const fallbackResponse = this.generateFallbackResponse(userMessage);
      
      this.conversationHistory.push({
        role: 'assistant',
        content: fallbackResponse.message,
        timestamp: new Date().toISOString()
      });

      return fallbackResponse;
    }
  }

  // Extract habit data from conversation
  extractHabitData(userMessage, aiMessage) {
    const message = userMessage.toLowerCase();
    
    // Extract habit name
    if (!this.habitData.name && (message.includes('want to') || message.includes('habit') || message.includes('do'))) {
      const patterns = [
        /want to (.+?)(?:\.|$|,)/,
        /habit (?:of |is )?(.+?)(?:\.|$|,)/,
        /do (.+?)(?:\.|$|,)/,
        /start (.+?)(?:\.|$|,)/
      ];
      
      for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match && match[1].length > 2) {
          this.habitData.name = match[1].trim();
          break;
        }
      }
    }

    // Extract frequency
    if (message.includes('daily') || message.includes('every day')) {
      this.habitData.frequency = 'daily';
      this.habitData.daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    } else if (message.includes('weekly') || message.includes('once a week')) {
      this.habitData.frequency = 'weekly';
    }

    // Extract days of week
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const foundDays = days.filter(day => message.includes(day));
    if (foundDays.length > 0) {
      this.habitData.daysOfWeek = foundDays;
      this.habitData.frequency = 'custom';
    }

    // Extract stake amount
    const stakeMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:matic|tokens?|coins?)/);
    if (stakeMatch) {
      this.habitData.stakeAmount = parseFloat(stakeMatch[1]);
    }

    // Extract category
    const categories = {
      'health': ['exercise', 'workout', 'gym', 'run', 'fitness', 'health', 'diet', 'eat'],
      'productivity': ['work', 'code', 'study', 'learn', 'read', 'write', 'productivity'],
      'personal': ['meditate', 'journal', 'sleep', 'wake', 'personal', 'habit'],
      'finance': ['save', 'invest', 'budget', 'money', 'crypto', 'trading']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        this.habitData.category = category;
        break;
      }
    }

    // Extract difficulty
    if (message.includes('easy') || message.includes('simple')) {
      this.habitData.difficulty = 'easy';
    } else if (message.includes('hard') || message.includes('difficult') || message.includes('challenging')) {
      this.habitData.difficulty = 'hard';
    }

    // Set description if not set
    if (!this.habitData.description && this.habitData.name) {
      this.habitData.description = `${this.habitData.name} - Created through AI conversation`;
    }
  }

  // Check if habit data is complete
  isHabitDataComplete() {
    return this.habitData.name && 
           this.habitData.frequency && 
           this.habitData.stakeAmount > 0 &&
           (this.habitData.frequency === 'daily' || this.habitData.daysOfWeek.length > 0);
  }

  // Generate fallback response when API fails
  generateFallbackResponse(userMessage) {
    if (!this.habitData.name) {
      return {
        message: "That sounds interesting! Can you tell me more specifically what habit you'd like to build? For example, 'I want to exercise daily' or 'I want to read for 30 minutes'? 📚💪",
        isComplete: false,
        extractedData: {}
      };
    } else if (!this.habitData.stakeAmount) {
      return {
        message: `Great! So you want to work on "${this.habitData.name}". Now, how much MATIC are you willing to stake against this habit? Remember, if you fail, this goes to charity! 💸 Maybe 1 MATIC? 5 MATIC? How much will motivate you? 💎`,
        isComplete: false,
        extractedData: {}
      };
    } else if (this.habitData.frequency !== 'daily' && this.habitData.daysOfWeek.length === 0) {
      return {
        message: "Perfect! Now, which days of the week do you want to do this? You can say something like 'Monday, Wednesday, Friday' or 'weekdays only' or 'daily'. What works best for you? 📅",
        isComplete: false,
        extractedData: {}
      };
    } else if (this.isHabitDataComplete()) {
      return {
        message: "🎉 Awesome! I think I have everything I need to create your habit. Ready to make this official and stake your MATIC? Your crypto is about to become your accountability partner! 🚀💎",
        isComplete: true,
        extractedData: this.habitData
      };
    } else {
      return {
        message: "Tell me a bit more about your habit! I want to make sure we set you up for success (and keep your MATIC safe)! 😄💪",
        isComplete: false,
        extractedData: {}
      };
    }
  }

  // Generate unique conversation ID
  generateConversationId() {
    return `habit_creation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Reset conversation
  resetConversation() {
    this.conversationHistory = [];
    this.habitData = {
      name: '',
      description: '',
      frequency: 'daily',
      daysOfWeek: [],
      stakeAmount: 0,
      category: '',
      reminderTime: '',
      difficulty: 'medium'
    };
  }

  // Get current habit data
  getHabitData() {
    return { ...this.habitData };
  }

  // Get conversation history
  getConversationHistory() {
    return [...this.conversationHistory];
  }
}

const elizaServiceInstance = new ElizaService();
export default elizaServiceInstance;
