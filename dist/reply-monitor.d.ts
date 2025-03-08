/**
 * Monitor and reply to Twitter mentions and comments
 */
export declare class TwitterReplyMonitor {
    private twitterClient;
    private knowledgeBase;
    private llm;
    private lastCheckedId;
    private myUserId;
    private lastErrorLogTime;
    private isInitialized;
    private isDevelopmentMode;
    constructor();
    /**
     * Initialize the monitor
     */
    initialize(): Promise<void>;
    /**
     * Start monitoring for mentions and replies
     */
    startMonitoring(interval?: number): Promise<void>;
    /**
     * Check for new mentions and replies
     */
    private checkForReplies;
    /**
     * Process a single reply or mention
     */
    private processReply;
    /**
     * Get context from the conversation thread
     */
    private getConversationContext;
    /**
     * Generate a reply using LLM and knowledge context
     */
    private generateReply;
    /**
     * Post a reply to Twitter with rate limit awareness
     */
    private postReply;
}
