const axios = require('axios');
const { ethers } = require('ethers');

class AIAgent {
  constructor() {
    this.apiUrl = process.env.OPENAI_API_URL || 'https://api.comput3.ai/v1';
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.LARGE_OPENAI_MODEL || 'llama3:70b';
    this.charityWallet = process.env.CHARITY_WALLET_ADDRESS;
    this.polygonRpc = process.env.POLYGON_RPC_URL;
  }

  async evaluateHabit(habitData, action, userId) {
    try {
      const prompt = this.buildEvaluationPrompt(habitData, action);
      const response = await this.callAI(prompt);
      
      return this.parseAIResponse(response, habitData);
    } catch (error) {
      console.error('AI evaluation failed:', error);
      return this.getDefaultDecision(action);
    }
  }

  buildEvaluationPrompt(habitData, action) {
    return `
You are an AI agent responsible for evaluating habit completion and making decisions about crypto staking rewards and punishments.

Habit Information:
- Name: ${habitData.habit_name}
- Stake Amount: ${habitData.stake_amount} MATIC
- Current Streak: ${habitData.streak} days
- Status: ${habitData.status}
- Days: ${habitData.days?.join(', ')}
- Last Action: ${habitData.last_action_date}

Action: ${action}

Please evaluate this habit and provide a decision in the following JSON format:
{
  "decision": "success|failure|warning",
  "recommendation": "string describing the decision",
  "stakeAction": "return|deduct|transfer_to_charity",
  "reasoning": "detailed explanation of the decision",
  "confidence": 0.0-1.0
}

Rules:
1. If action is "complete" and streak reaches 7 days, return stake and give bonus
2. If action is "fail" and it's the first failure, deduct stake and warn
3. If action is "fail" and it's the second failure, transfer all stakes to charity
4. Consider habit consistency, streak length, and user behavior patterns
5. Be fair but strict to maintain accountability

Respond only with valid JSON:
`;
  }

  async callAI(prompt) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an AI agent for habit accountability. Respond only with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI API call failed:', error);
      throw error;
    }
  }

  parseAIResponse(response, habitData) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const decision = JSON.parse(jsonMatch[0]);
      
      // Validate decision structure
      if (!decision.decision || !decision.recommendation || !decision.stakeAction) {
        throw new Error('Invalid decision structure');
      }

      return {
        ...decision,
        habitId: habitData.id,
        timestamp: new Date().toISOString(),
        originalResponse: response
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.getDefaultDecision(habitData.action);
    }
  }

  getDefaultDecision(action) {
    return {
      decision: action === 'complete' ? 'success' : 'failure',
      recommendation: action === 'complete' ? 'Habit completed successfully' : 'Habit failed',
      stakeAction: action === 'complete' ? 'return' : 'deduct',
      reasoning: 'Default decision due to AI evaluation failure',
      confidence: 0.5,
      timestamp: new Date().toISOString()
    };
  }

  async executeStakeAction(decision, habitData, walletProvider) {
    try {
      switch (decision.stakeAction) {
        case 'return':
          return await this.returnStake(habitData, walletProvider);
        case 'deduct':
          return await this.deductStake(habitData, walletProvider);
        case 'transfer_to_charity':
          return await this.transferToCharity(habitData, walletProvider);
        default:
          throw new Error(`Unknown stake action: ${decision.stakeAction}`);
      }
    } catch (error) {
      console.error('Stake action execution failed:', error);
      throw error;
    }
  }

  async returnStake(habitData, walletProvider) {
    // This would implement the actual on-chain transaction to return stakes
    // For now, we'll return a mock transaction
    return {
      action: 'return_stake',
      amount: habitData.stake_amount,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
      status: 'success',
      timestamp: new Date().toISOString()
    };
  }

  async deductStake(habitData, walletProvider) {
    // This would implement the actual on-chain transaction to deduct stakes
    return {
      action: 'deduct_stake',
      amount: habitData.stake_amount,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
      status: 'success',
      timestamp: new Date().toISOString()
    };
  }

  async transferToCharity(habitData, walletProvider) {
    // This would implement the actual on-chain transaction to transfer to charity
    return {
      action: 'transfer_to_charity',
      amount: habitData.stake_amount,
      recipient: this.charityWallet,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
      status: 'success',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = AIAgent;
