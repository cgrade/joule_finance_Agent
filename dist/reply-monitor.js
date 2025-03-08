"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterReplyMonitor = void 0;
const twitter_api_v2_1 = require("twitter-api-v2");
const anthropic_1 = require("@langchain/anthropic");
const config_1 = __importDefault(require("./config"));
const knowledge_base_1 = require("./knowledge/knowledge-base");
const messages_1 = require("@langchain/core/messages");
const chalk_1 = __importDefault(require("chalk"));
/**
 * Monitor and reply to Twitter mentions and comments
 */
class TwitterReplyMonitor {
    constructor() {
        this.twitterClient = null;
        this.lastCheckedId = null;
        this.lastErrorLogTime = 0;
        this.isInitialized = false;
        this.isDevelopmentMode = true;
        // Initialize knowledge base
        this.knowledgeBase = new knowledge_base_1.JouleKnowledgeBase();
        // Initialize LLM
        this.llm = new anthropic_1.ChatAnthropic({
            anthropicApiKey: config_1.default.llm.apiKey,
            modelName: "claude-3-sonnet-20240229"
        });
        // My Twitter user ID (will be populated during init)
        this.myUserId = '';
    }
    /**
     * Initialize the monitor
     */
    async initialize() {
        try {
            // Check if all required Twitter credentials are available
            if (!config_1.default.twitter.apiKey || !config_1.default.twitter.apiSecret ||
                !config_1.default.twitter.accessToken || !config_1.default.twitter.accessSecret) {
                console.log(chalk_1.default.yellow('⚠️ Missing Twitter API credentials - Reply monitoring disabled'));
                this.isDevelopmentMode = true;
                return;
            }
            this.twitterClient = new twitter_api_v2_1.TwitterApi({
                appKey: config_1.default.twitter.apiKey,
                appSecret: config_1.default.twitter.apiSecret,
                accessToken: config_1.default.twitter.accessToken,
                accessSecret: config_1.default.twitter.accessSecret
            });
            this.isInitialized = true;
            this.isDevelopmentMode = false;
            console.log(chalk_1.default.green('✅ Twitter reply monitor initialized successfully'));
        }
        catch (error) {
            console.log(chalk_1.default.red(`✖️ Error initializing Twitter reply monitor: ${error.message}`));
            console.log(chalk_1.default.yellow('⚠️ Reply monitoring will be disabled. App will continue in dev mode.'));
            this.isDevelopmentMode = true;
        }
    }
    /**
     * Start monitoring for mentions and replies
     */
    async startMonitoring(interval = 60000) {
        if (this.isDevelopmentMode || !this.twitterClient) {
            console.log(chalk_1.default.blue('ℹ️ Reply monitoring skipped (development mode)'));
            return;
        }
        try {
            // Do an initial check
            await this.checkForReplies();
            // Set up regular interval
            setInterval(async () => {
                try {
                    await this.checkForReplies();
                }
                catch (error) {
                    console.error('Error checking for replies:', error);
                }
            }, interval);
            console.log(`Started monitoring Twitter replies every ${interval / 1000} seconds`);
        }
        catch (error) {
            console.error('Error starting Twitter reply monitoring:', error);
        }
    }
    /**
     * Check for new mentions and replies
     */
    async checkForReplies() {
        if (!this.twitterClient) {
            return; // Skip if no client
        }
        try {
            // Get mentions timeline
            const params = { count: 10 };
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
        }
        catch (error) {
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
    async processReply(tweet) {
        if (!this.twitterClient) {
            console.log(chalk_1.default.yellow('⚠️ Cannot process reply (development mode): would reply to tweet ' + tweet.id_str));
            return;
        }
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
        }
        catch (error) {
            console.error(`Error processing reply to tweet ${tweet.id_str}:`, error);
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 88) {
                console.log('Rate limited by Twitter API. Will try again later.');
            }
        }
    }
    /**
     * Get context from the conversation thread
     */
    async getConversationContext(tweet) {
        if (!this.twitterClient) {
            return tweet.text;
        }
        // If this is a reply, get the parent tweet
        if (tweet.in_reply_to_status_id_str) {
            try {
                const parentTweet = await this.twitterClient.v1.singleTweet(tweet.in_reply_to_status_id_str);
                return `Original tweet: "${parentTweet.text}" by @${parentTweet.user.screen_name}\n` +
                    `Reply: "${tweet.text}" by @${tweet.user.screen_name}`;
            }
            catch (error) {
                console.error('Error getting parent tweet:', error);
            }
        }
        return tweet.text;
    }
    /**
     * Generate a reply using LLM and knowledge context
     */
    async generateReply(tweet, conversationContext, knowledgeContext) {
        if (!this.twitterClient) {
            return "No Twitter client available for generating reply";
        }
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
        const response = await this.llm.invoke([new messages_1.HumanMessage(prompt)]);
        let replyText = response.content;
        // Ensure the reply isn't too long for Twitter
        if (replyText.length > 280) {
            replyText = replyText.substring(0, 277) + "...";
        }
        return replyText;
    }
    /**
     * Post a reply to Twitter with rate limit awareness
     */
    async postReply(replyText, inReplyToId) {
        if (!this.twitterClient) {
            console.log(chalk_1.default.yellow('⚠️ Cannot reply (development mode): would reply to tweet ' + inReplyToId));
            return;
        }
        try {
            // Add a small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Post the reply
            await this.twitterClient.v1.reply(replyText, inReplyToId);
        }
        catch (error) {
            console.error('Error posting reply to Twitter:', error);
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 88) {
                console.log('Rate limited by Twitter API. Will try again later.');
            }
        }
    }
}
exports.TwitterReplyMonitor = TwitterReplyMonitor;
//# sourceMappingURL=reply-monitor.js.map