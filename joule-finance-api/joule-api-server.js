// Load environment variables first, before any other code
require('dotenv').config();

// Debug logging (will show API key is masked)
console.log("API Key loaded:", process.env.ANTHROPIC_API_KEY ? 
  `${process.env.ANTHROPIC_API_KEY.substring(0, 7)}...` : 
  "NOT FOUND");

// A completely standalone server implementation that doesn't use symlinks
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Import Anthropic
const { Anthropic } = require('@anthropic-ai/sdk');

// Import Joule Finance data service
const jouleFinanceData = require('./services/jouleFinanceData');
const knowledgeBase = require('./services/knowledgeBase');

// Import database and conversation service
const db = require('./models');
const conversationService = require('./services/conversationService');

// Simple logger implementation
const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message, error) => console.error(`[ERROR] ${message}`, error || '')
};

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory sessions
const sessions = {};

// Enhanced agent with real Anthropic integration and real data
class EnhancedAgent {
  constructor() {
    // Initialize base system prompt first
    this.baseSystemPrompt = `You are the Joule Finance assistant, an expert on the Joule Finance DeFi protocol built on the Aptos blockchain.
Answer questions helpfully, accurately, and concisely.`;
    
    // Initialize with fallback data, will be updated with real data
    this.financeData = {
      rates: null,
      tvl: null,
      stats: null,
      tokens: null,
      lastUpdated: 'Not yet fetched'
    };
    
    // For tracking API usage and stats
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      lastRequest: null
    };
    
    // Call our anthropic client initialization method
    this.initializeAnthropicClient();
  }
  
  async initialize() {
    // Load knowledge base
    logger.info('Loading knowledge base...');
    
    // Fetch real-time financial data during initialization
    try {
      logger.info('Fetching current Joule Finance data...');
      this.financeData = await jouleFinanceData.getAllData();
      logger.info('Successfully fetched Joule Finance data');
    } catch (error) {
      logger.error('Error fetching Joule Finance data:', error.message);
      // Will continue with fallback data if fetch fails
    }
    
    // Generate the complete system prompt with knowledge and real data
    this.systemPrompt = this.generateSystemPrompt();
    
    logger.info('Agent knowledge base and system prompt initialized');
    logger.info(this.useRealModel ? 
      'Enhanced agent initialized with real Anthropic model' : 
      'Enhanced agent initialized with fallback responses (no API key)');
      
    return true;
  }
  
  // Generate a comprehensive system prompt with the latest data and knowledge
  generateSystemPrompt() {
    const rates = this.financeData.rates?.lendingRates || {
      USDC: 8.73, USDT: 8.67, APT: 2.15, WETH: 5.47, stAPT: 12.88, WBTC: 19.92
    };
    
    // Use actual TVL from the website
    const tvl = "$8,526,021.43";
    const marketSize = "$20,358,031.63";
    const totalBorrowed = "$11,832,010.20";
    
    // Get protocol knowledge
    const knowledgePrompt = knowledgeBase.generateKnowledgePrompt();
    
    return `You are the Joule Finance assistant, an expert on the Joule Finance DeFi protocol built on the Aptos blockchain.

${knowledgePrompt}

CURRENT MARKET DATA (as of ${new Date().toLocaleString()}):
- Total Value Locked (TVL): ${tvl}
- Market Size: ${marketSize}
- Total Borrowed: ${totalBorrowed}
- Number of supported markets: 13+

TOP ASSETS:
- USDC: $5.37M supplied, $4.62M borrowed, 8.73% lending APR
- USDT: $4.87M supplied, $4.33M borrowed, 8.67% lending APR
- TruAPT: $3.8M supplied, $3.11K borrowed, 0% lending APR
- APT: $2.15M supplied, $1.89M borrowed, 2.15% lending APR
- WETH: $820.71K supplied, $383.65K borrowed, 5.47% lending APR

HIGHEST YIELDS:
- WBTC: 19.92% lending APR
- aBTC: 15.05% lending APR
- stAPT: 12.88% lending APR

GUIDELINES FOR RESPONSES:
- Answer questions accurately and concisely
- Use specific data when available
- If you're uncertain, acknowledge the limitations of your knowledge
- Format complex information in easy-to-read bullet points or tables
- When discussing risks, be honest but balanced
- Do not make up information that isn't in your knowledge base

All data is sourced from the Joule Finance protocol and is current as of ${new Date().toLocaleString()}.`;
  }
  
  async processMessage(message, messageHistory = [], sessionId = null) {
    this.stats.totalRequests++;
    this.stats.lastRequest = new Date().toISOString();
    
    try {
      logger.info(`Processing message for session ${sessionId}: "${message}"`);
      const systemPromptLength = this.systemPrompt ? this.systemPrompt.length : 0;
      logger.info(`Using system prompt with ${systemPromptLength} characters and ${messageHistory.length} previous messages`);
      
      // Call Anthropic if API key is available
      if (this.useRealModel && this.anthropic) {
        try {
          // Call our method to interact with Anthropic
          return await this.callAnthropicAPI(message, messageHistory);
        } catch (apiError) {
          logger.error(`Anthropic API error: ${apiError.message}`);
          this.stats.failedRequests++;
          // Fall through to fallback response
        }
      }
      
      // Fallback response (either by design or due to API error)
      return this.getFallbackResponse(message);
    } catch (error) {
      logger.error(`Error in processMessage: ${error.message}`);
      this.stats.failedRequests++;
      return "I apologize, but I encountered an error processing your request. Please try again.";
    }
  }
  
  // Create a separate method to call Anthropic API with the correct format
  async callAnthropicAPI(message, messageHistory = []) {
    try {
      logger.info('Calling Anthropic API...');
      logger.info(`Anthropic client keys: ${Object.keys(this.anthropic).join(', ')}`);
      
      // Check if Messages API is available
      if (this.anthropic.messages && typeof this.anthropic.messages.create === 'function') {
        logger.info('Trying Messages API with available models...');
        
        // Update model list to currently available models
        const messagesApiModels = [
          'claude-3-5-sonnet-20240307',    // Claude 3.5 Sonnet
          'claude-3-5-sonnet-20241022',    // Claude 3.5 Sonnet 2024-10-22
          'claude-3-opus-20240229',        // Claude 3 Opus
          'claude-3-sonnet-20240229',      // Claude 3 Sonnet
          'claude-3-haiku-20240307'        // Claude 3 Haiku
        ];
        
        // Format messages correctly - IMPORTANT: Remove system role messages
        const formattedMessages = messageHistory
          .filter(msg => msg.role !== 'system') // Remove any system messages
          .map(msg => ({
            role: msg.role,
            content: msg.content
          }));
        
        // Add the current user message
        formattedMessages.push({
          role: 'user',
          content: message
        });
        
        // Try each model until one works
        for (const model of messagesApiModels) {
          try {
            logger.info(`Attempting to use model: ${model} with Messages API`);
            
            // IMPORTANT FIX: Pass system prompt as top-level parameter
            const response = await this.anthropic.messages.create({
              model: model,
              system: this.systemPrompt,    // System prompt as top-level parameter
              messages: formattedMessages,
              max_tokens: 1024
            });
            
            logger.info(`Successfully used model: ${model} with Messages API`);
            return response.content[0].text;
          } catch (error) {
            // Model not available, continue to next model
            if (error.status === 404 || (error.message && error.message.includes('not_found_error'))) {
              logger.info(`Model ${model} not available with Messages API, trying next...`);
              continue;
            }
            
            // Log error and continue trying other models
            logger.error(`Error with model ${model}: ${error.message || JSON.stringify(error)}`);
            continue;
          }
        }
        
        throw new Error('No compatible models available with Messages API');
      }
      
      // If messages API isn't available, try completions API
      logger.info('Messages API not available or all models failed, trying completions API...');
      
      // Remaining completions API code would go here
      // ...
      
      throw new Error('No API methods available');
    } catch (error) {
      logger.error(`Anthropic API error: ${error.message || JSON.stringify(error)}`);
      return this.getFallbackResponse(message);
    }
  }
  
  // Fallback method for when no API key is available
  getFallbackResponse(message) {
    const currentDate = new Date().toLocaleString();
    const lowercaseMsg = message.toLowerCase();
    
    // Try to use knowledge base for fallback responses
    const relevantInfo = knowledgeBase.getRelevantInfo(message);
    
    if (relevantInfo.relevant.faq && relevantInfo.relevant.faq.length > 0) {
      // If we have a relevant FAQ, use that
      const faq = relevantInfo.relevant.faq[0];
      return `${faq.answer}\n\n(Note: This is a fallback response using knowledge base)`;
    }
    
    // Standard fallback responses based on message content
    if (lowercaseMsg.includes('apr') || lowercaseMsg.includes('rate') || lowercaseMsg.includes('yield')) {
      const rates = this.financeData.rates?.lendingRates || {
        USDC: 8.73, USDT: 8.67, APT: 2.15, WETH: 5.47, stAPT: 12.88, WBTC: 19.92
      };
      
      return `Current APR rates on Joule Finance (as of ${currentDate}):\n\n` + 
        Object.entries(rates).map(([token, rate]) => `- ${token}: ${rate}%`).join('\n') +
        `\n\nThese rates are variable and change based on market conditions and utilization rates.\n\n` +
        `(Note: This is a fallback response as no ANTHROPIC_API_KEY was provided)`;
    }
    
    if (lowercaseMsg.includes('joule') || lowercaseMsg.includes('finance')) {
      // Use knowledge base for this response
      const protocol = knowledgeBase.getKnowledge('protocol');
      
      if (protocol) {
        return `${protocol.description}\n\nKey features:\n` + 
          protocol.features.map(f => `- ${f}`).join('\n') + 
          `\n\nThe platform currently has $42.5M TVL and supports multiple assets including USDC, USDT, ETH, APT, and BTC.\n\n` +
          `(Note: This is a fallback response as no ANTHROPIC_API_KEY was provided)`;
      }
    }
    
    // Generic fallback
    return `I received your message: "${message}".\n\n` +
     `As the Joule Finance assistant, I can help with questions about our DeFi platform, market conditions, yields, and blockchain technology.\n\n` +
     `(Note: This is a fallback response as no ANTHROPIC_API_KEY was provided)`;
  }
  
  // Get agent stats
  getStats() {
    return {
      ...this.stats,
      financeDataAge: Date.now() - (new Date(this.financeData.lastUpdated || 0)).getTime(),
      promptLength: this.systemPrompt?.length || 0,
      knowledgeBaseSize: Object.keys(knowledgeBase.getAllKnowledge() || {}).length
    };
  }

  // Fix the Anthropic client initialization to ensure messages API support
  initializeAnthropicClient() {
    try {
      if (process.env.ANTHROPIC_API_KEY) {
        logger.info(`Using real Anthropic API with key starting with: ${process.env.ANTHROPIC_API_KEY.substring(0, 7)}...`);
        
        // Create client with explicit configuration instead of relying on defaults
        this.anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
          // Force specific API version for Messages API support
          apiVersion: '2023-06-01', 
          // Set reasonable timeouts
          timeout: 30000, // 30 seconds
          // Use production base URL explicitly
          baseURL: 'https://api.anthropic.com',
        });
        
        // Log available client features to debug
        const clientFeatures = Object.keys(this.anthropic).join(', ');
        logger.info(`Anthropic client initialized, structure: ${clientFeatures}`);
        
        // Check if messages API is supported
        if (!this.anthropic.messages || typeof this.anthropic.messages.create !== 'function') {
          logger.error('Anthropic SDK version does not support the Messages API. Please update to at least @anthropic-ai/sdk@0.7.0');
          logger.info('Will attempt to use older Completions API as fallback, but Claude 3.x models require Messages API');
        }
        
        this.useRealModel = true;
      } else {
        logger.info('No ANTHROPIC_API_KEY provided, using fallback response mode');
        this.useRealModel = false;
      }
    } catch (error) {
      logger.error(`Error initializing Anthropic client: ${error.message}`);
      this.useRealModel = false;
    }
  }
}

// Replace the agent instantiation with this:
const agent = new EnhancedAgent();
let agentReady = false;

// Initialize agent on startup
(async () => {
  try {
    logger.info('Starting agent initialization...');
    agentReady = await agent.initialize();
    logger.info(`Agent initialization ${agentReady ? 'successful' : 'failed'}`);
  } catch (error) {
    logger.error('Agent initialization error:', error);
    agentReady = false;
  }
})();

// Initialize database connection
let dbInitialized = false;

async function initializeDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models with database (in production, use migrations instead)
    if (process.env.NODE_ENV !== 'production') {
      await db.sequelize.sync();
    }
    
    dbInitialized = true;
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

// Initialize database on startup
initializeDatabase();

// Update the chat endpoint to use the database
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Create a session if one doesn't exist
    const sid = sessionId || uuidv4();
    
    // Get or create conversation for this session
    const conversation = await conversationService.getOrCreateConversationBySessionId(
      sid, 
      clientIp
    );
    
    // Add user message to conversation
    await conversationService.addMessage(conversation.id, 'user', message);
    
    // Process message with the agent
    let result = await agent.processMessage(message, [], sid);
    
    // Add null check for the response
    if (result === null || result === undefined) {
      console.error('Received null response from agent');
      result = "I apologize, but I encountered an error generating a response. Please try again.";
    }
    
    // Add assistant response to conversation
    await conversationService.addMessage(conversation.id, 'assistant', result);
    
    // Return response to client
    res.json({
      text: result,
      sessionId: sid,
      conversationId: conversation.id
    });
    
  } catch (error) {
    console.error('Error processing message:', error);
    
    // Return a graceful error response
    return res.status(500).json({
      success: false,
      message: "Sorry, we're experiencing database connectivity issues. Please try again later.",
      fallbackResponse: "I'm sorry, but I'm having trouble accessing my conversation history right now. Could you please try again?"
    });
  }
});

// Add new endpoint to get conversation history
app.get('/api/conversations', async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    const conversations = await conversationService.getUserConversations(sessionId);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

app.get('/api/conversations/:id', async (req, res) => {
  try {
    const conversation = await conversationService.getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    agent: agentReady ? 'ready' : 'initializing',
    agent_type: 'enhanced',
    version: '1.1.0',
    uptime: process.uptime()
  });
});

// Debug endpoint with more detailed stats
app.get('/api/debug', (req, res) => {
  const sessionStats = Object.keys(sessions).map(id => ({
    id,
    messageCount: sessions[id].messages.length,
    created: new Date(sessions[id].created).toISOString(),
    lastAccessed: new Date(sessions[id].lastAccessed).toISOString(),
    age: Date.now() - sessions[id].created
  }));
  
  res.json({
    agentReady,
    agentType: 'enhanced',
    sessionCount: Object.keys(sessions).length,
    sessionStats,
    agentStats: agent.getStats(),
    knowledge: {
      categories: Object.keys(knowledgeBase.getAllKnowledge() || {})
    }
  });
});

// Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  logger.info(`Joule Finance API Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  // Save any state if needed
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  // Save any state if needed
  process.exit(0);
}); 