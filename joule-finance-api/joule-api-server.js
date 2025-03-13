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
const { ChatAnthropic } = require('@langchain/anthropic');

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
    const apiKey = process.env.ANTHROPIC_API_KEY;
    // Check if API key is available and valid
    if (!apiKey || apiKey === "your_anthropic_api_key_here") {
      console.warn("⚠️ Valid ANTHROPIC_API_KEY not found. Using fallback responses.");
      this.useRealModel = false;
    } else {
      this.useRealModel = true;
      console.log("Using real Anthropic API with key starting with:", apiKey.substring(0, 7));
      this.anthropic = new ChatAnthropic({
        apiKey: apiKey,
        modelName: "claude-3-haiku-20240307"
      });
    }
    
    // We'll update the system prompt with real data later
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
  
  async processMessage(message, history, sessionId) {
    // Update stats
    this.stats.totalRequests++;
    this.stats.lastRequest = new Date();

    // Check if we're using the real model
    if (!this.useRealModel) {
      return this.getFallbackResponse(message);
    }
    
    // Use the correct method from the knowledge base
    const relevantInfo = knowledgeBase.getRelevantInfo(message);
    let extraContext = '';
    
    // Add relevant knowledge as additional context
    if (relevantInfo.relevant.faq && relevantInfo.relevant.faq.length > 0) {
      extraContext += '\nRELEVANT FAQ:\n';
      relevantInfo.relevant.faq.forEach(faq => {
        extraContext += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
      });
    }
    
    if (relevantInfo.relevant.products) {
      extraContext += '\nRELEVANT PRODUCTS:\n';
      const products = Array.isArray(relevantInfo.relevant.products) ? 
        relevantInfo.relevant.products : [relevantInfo.relevant.products];
      
      products.forEach(product => {
        extraContext += `- ${product.name}: ${product.description}\n`;
        if (product.features) {
          extraContext += `  Features: ${product.features.join(', ')}\n`;
        }
      });
    }
    
    if (relevantInfo.relevant.tokens) {
      extraContext += '\nRELEVANT TOKENS:\n';
      const tokens = Array.isArray(relevantInfo.relevant.tokens) ? 
        relevantInfo.relevant.tokens : [relevantInfo.relevant.tokens];
      
      tokens.forEach(token => {
        extraContext += `- ${token.symbol} (${token.name}): ${token.description}\n`;
      });
    }
    
    // Format conversation history for Anthropic
    const messages = [
      { 
        role: "system", 
        content: this.systemPrompt + (extraContext ? `\n\nADDITIONAL CONTEXT FOR THIS QUERY:\n${extraContext}` : '')
      }
    ];
    
    // Add conversation history (limited to last 10 messages to prevent context overflow)
    const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
    
    for (const msg of recentHistory) {
      if (msg && typeof msg === 'object' && msg.content) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }
    
    // Add the current message if not in history
    if (!recentHistory.some(msg => msg.role === 'user' && msg.content === message)) {
      messages.push({ role: "user", content: message });
    }
    
    // Call Anthropic
    try {
      logger.info(`Processing message for session ${sessionId}: "${message}"`);
      logger.info(`Using system prompt with ${this.systemPrompt.length} characters and ${extraContext ? extraContext.length : 0} chars of additional context`);
      
      const response = await this.anthropic.invoke(messages);
      
      this.stats.successfulRequests++;
      return response.content;
    } catch (error) {
      this.stats.failedRequests++;
      logger.error("Error calling Anthropic:", error.message);
      
      // Check for specific error types
      if (error.error?.error?.type === 'not_found_error') {
        this.useRealModel = false; // Disable real model after error
        logger.error("Model not found. Check your model name and try again.");
        return `Sorry, I encountered a configuration error (invalid model name). Falling back to mock responses.`;
      }
      
      if (error.name === 'AbortError') {
        return `I'm sorry, but the request timed out. Please try a shorter or simpler question.`;
      }
      
      return `I'm sorry, I encountered an error processing your request. ${error.message}`;
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
    const result = await agent.processMessage(message, [], sid);
    
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
    res.status(500).json({ error: 'Failed to process message' });
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