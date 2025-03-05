import { TwitterApi, TwitterApiReadWrite } from 'twitter-api-v2';
import { ChatAnthropic } from '@langchain/anthropic';
import config from './config';
import { JouleKnowledgeBase } from './knowledge/knowledge-base';
import { HumanMessage } from '@langchain/core/messages';

/**
 * Monitor and reply to Twitter mentions and comments
 */
export class TwitterReplyMonitor {
  private twitterClient: TwitterApi;
  private knowledgeBase: JouleKnowledgeBase;
  private llm: ChatAnthropic;
  private lastCheckedId: string | null = null;
  private myUserId: string;
  private lastErrorLogTime: number = 0;
  
  constructor() {
    // Initialize Twitter client using type assertion to bypass strict type checking
    this.twitterClient = new TwitterApi({
      appKey: config.twitter.apiKey,
      appSecret: config.twitter.apiSecret,
      accessToken: config.twitter.accessToken,
      accessSecret: config.twitter.accessSecret
    } as any);
    
    // Initialize knowledge base
    this.knowledgeBase = new JouleKnowledgeBase();
    
    // Initialize LLM
    this.llm = new ChatAnthropic({
      anthropicApiKey: config.llm.apiKey,
      modelName: "claude-3-sonnet-20240229"
    });
    
    // My Twitter user ID (will be populated during init)
    this.myUserId = '';
  }
  
  /**
   * Initialize the monitor
   */
  async initialize(): Promise<void> {
    try {
      // Initialize knowledge base
      await this.knowledgeBase.initialize();
      
      // Get my user ID
      const me = await this.twitterClient.currentUser();
      this.myUserId = me.id_str;
      console.log(`Twitter reply monitor initialized for user ID: ${this.myUserId}`);
    } catch (error) {
      console.error('Error initializing Twitter reply monitor:', error);
      throw error;
    }
  }
  
  /**
   * Start monitoring for mentions and replies
   */
  async startMonitoring(interval: number = 60000): Promise<void> {
    try {
      // Do an initial check
      await this.checkForReplies();
      
      // Set up regular interval
      setInterval(async () => {
        try {
          await this.checkForReplies();
        } catch (error) {
          console.error('Error checking for replies:', error);
        }
      }, interval);
      
      console.log(`Started monitoring Twitter replies every ${interval/1000} seconds`);
    } catch (error) {
      console.error('Error starting Twitter reply monitoring:', error);
    }
  }
  
  /**
   * Check for new mentions and replies
   */
  private async checkForReplies(): Promise<void> {
    try {
      // Get mentions timeline
      const params: any = { count: 10 };
      if (this.lastCheckedId) {
        params.since_id = this.lastCheckedId;
      }
      
      const mentions = await this.twitterClient.v1.mentionTimeline(params);
      
      if (mentions.data.length === 0) {
        console.log('No new mentions found');
        return;
      }
      
      // Update last checked ID
      this.lastCheckedId = String(mentions.data[0].id);
      
      // Process each mention
      for (const mention of mentions.data) {
        // Skip if it's our own tweet
        if (mention.user.id_str === this.myUserId) {
          continue;
        }
        
        // Process the reply
        await this.processReply(mention);
      }
    } catch (error) {
      // Check if this is an API access level error (code 453)
      if (typeof error === 'object' && 
          error !== null && 
          'errors' in error && 
          Array.isArray(error.errors) && 
          error.errors.length > 0 && 
          error.errors[0].code === 453) {
        
        // Log only once every 10 minutes to reduce spam
        const now = new Date().getTime();
        if (!this.lastErrorLogTime || now - this.lastErrorLogTime > 600000) {
          console.log('Twitter API access level insufficient for mentions timeline. Upgrade your developer account access level.');
          this.lastErrorLogTime = now;
        }
        return;
      }
      
      console.error('Error checking for Twitter replies:', error);
    }
  }
  
  /**
   * Process a single reply or mention
   */
  private async processReply(tweet: any): Promise<void> {
    try {
      console.log(`Processing reply: ${tweet.id_str} from @${tweet.user.screen_name}`);
      
      // Get the conversation context
      const conversationContext = await this.getConversationContext(tweet);
      
      // Search knowledge base for relevant information
      const query = `${tweet.text} ${conversationContext}`;
      const knowledgeContext = await this.knowledgeBase.search(query);
      
      // Generate reply
      const reply = await this.generateReply(tweet, conversationContext, knowledgeContext);
      
      // Post the reply (with rate limiting consideration)
      await this.postReply(reply, tweet.id_str);
      
      console.log(`Successfully replied to tweet ${tweet.id_str}`);
    } catch (error) {
      console.error(`Error processing reply to tweet ${tweet.id_str}:`, error);
      
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 88) {
        console.log('Rate limited by Twitter API. Will try again later.');
      }
    }
  }
  
  /**
   * Get context from the conversation thread
   */
  private async getConversationContext(tweet: any): Promise<string> {
    // If this is a reply, get the parent tweet
    if (tweet.in_reply_to_status_id_str) {
      try {
        const parentTweet = await this.twitterClient.v1.singleTweet(tweet.in_reply_to_status_id_str);
        return `Original tweet: "${parentTweet.text}" by @${parentTweet.user.screen_name}\n` +
               `Reply: "${tweet.text}" by @${tweet.user.screen_name}`;
      } catch (error) {
        console.error('Error getting parent tweet:', error);
      }
    }
    
    return tweet.text;
  }
  
  /**
   * Generate a reply using LLM and knowledge context
   */
  private async generateReply(tweet: any, conversationContext: string, knowledgeContext: string): Promise<string> {
    const prompt = `You are representing Joule Finance, a professional DeFi protocol on the Aptos blockchain. 
    You need to craft a helpful, professional response to a Twitter user.

    ABOUT JOULE FINANCE:
    Joule Finance is an advanced DeFi protocol offering isolated lending, leveraged yield farming, and cross-chain liquidity via LayerZero.
    
    CONVERSATION CONTEXT:
    ${conversationContext}
    
    RELEVANT KNOWLEDGE:
    ${knowledgeContext || "No specific knowledge found for this query."}
    
    TWITTER USER: @${tweet.user.screen_name}
    
    Guidelines for your response:
    1. Be professional, helpful, and concise (max 280 characters)
    2. Address the specific question or comment
    3. Include relevant facts and data if available
    4. Provide accurate information about Joule Finance
    5. Do not use hashtags or emojis
    6. Maintain a professional tone appropriate for a financial protocol
    
    Your response should be ONLY the reply text, nothing else.`;
    
    const response = await this.llm.invoke([new HumanMessage(prompt)]);
    let replyText = response.content as string;
    
    // Ensure the reply isn't too long for Twitter
    if (replyText.length > 280) {
      replyText = replyText.substring(0, 277) + "...";
    }
    
    return replyText;
  }
  
  /**
   * Post a reply to Twitter with rate limit awareness
   */
  private async postReply(replyText: string, inReplyToId: string): Promise<void> {
    try {
      // Add a small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Post the reply
      await this.twitterClient.v1.reply(replyText, inReplyToId);
    } catch (error) {
      console.error('Error posting reply to Twitter:', error);
      
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 88) {
        console.log('Rate limited by Twitter API. Will try again later.');
      }
    }
  }
} 