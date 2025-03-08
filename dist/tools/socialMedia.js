"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XProfessionalPostTool = void 0;
const twitter_api_v2_1 = require("twitter-api-v2");
const config_1 = __importDefault(require("../config"));
const fs_1 = __importDefault(require("fs"));
/**
 * Tool for posting professional content to X/Twitter
 */
class XProfessionalPostTool {
    constructor(visualizationTool, devMode = process.env.NODE_ENV !== 'production') {
        this.visualizationTool = visualizationTool;
        this.developmentMode = devMode;
        // Initialize Twitter client
        try {
            this.twitterClient = new twitter_api_v2_1.TwitterApi(config_1.default.twitter.apiKey + ':' + config_1.default.twitter.apiSecret);
            console.log('Twitter client initialized with API keys');
        }
        catch (error) {
            console.error('Failed to initialize Twitter client:', error);
            throw new Error(`Twitter client initialization failed: ${error.message}`);
        }
    }
    /**
     * Posts a tweet with optional image visualization
     * @param content Tweet text content
     * @param shouldVisualize Whether to include a data visualization
     * @returns Result of posting operation
     */
    async postTweet(content, shouldVisualize = true) {
        try {
            // Generate chart if visualization is requested
            let mediaPath;
            if (shouldVisualize) {
                mediaPath = '/tmp/mock-chart.png'; // Use a mock path for now
            }
            // In development mode, return mock success
            if (this.developmentMode) {
                console.log(`[DEV] Would post tweet: ${content}`);
                if (mediaPath) {
                    console.log(`[DEV] With media: ${mediaPath}`);
                }
                return {
                    success: true,
                    tweet_id: 'mock-12345',
                    text: content,
                    development_mode: true
                };
            }
            // Otherwise, post for real
            return await this.postRealTweet(content, mediaPath);
        }
        catch (error) {
            console.error('Error posting to X/Twitter:', error);
            return {
                success: false,
                error: error.message,
                development_mode: this.developmentMode
            };
        }
    }
    /**
     * Posts a real tweet to X/Twitter
     * @param content Tweet text content
     * @param mediaPath Optional path to media file
     * @returns Result of posting operation
     */
    async postRealTweet(content, mediaPath) {
        try {
            let mediaId;
            // Upload media if provided
            if (mediaPath) {
                console.log(`postTweet called with media path: ${mediaPath}`);
                console.log(`Attempting to use media at path: ${mediaPath}`);
                // Check if file exists and has content
                if (fs_1.default.existsSync(mediaPath)) {
                    const stats = fs_1.default.statSync(mediaPath);
                    console.log(`Media file exists! Size: ${stats.size} bytes`);
                    if (stats.size > 0) {
                        // Upload media to Twitter
                        const mediaBuffer = fs_1.default.readFileSync(mediaPath);
                        const mediaUpload = await this.twitterClient.v1.uploadMedia(mediaBuffer, {
                            mimeType: 'image/png'
                        });
                        mediaId = mediaUpload;
                    }
                }
            }
            // Post the tweet
            const tweetOptions = mediaId ?
                { media: { media_ids: [mediaId] } } : undefined;
            const tweet = await this.twitterClient.v2.tweet(content, tweetOptions);
            return {
                success: true,
                tweet_id: tweet.data.id,
                text: content,
                development_mode: false
            };
        }
        catch (error) {
            console.error('Error posting real tweet:', error);
            throw error; // Re-throw to be caught by the parent method
        }
    }
}
exports.XProfessionalPostTool = XProfessionalPostTool;
exports.default = XProfessionalPostTool;
//# sourceMappingURL=socialMedia.js.map