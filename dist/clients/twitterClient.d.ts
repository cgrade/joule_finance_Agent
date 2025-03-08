/**
 * Simple Twitter client for posting tweets
 */
export declare class TwitterClient {
    constructor();
    /**
     * Post a tweet to Twitter
     */
    tweet(content: string): Promise<boolean>;
    /**
     * Post a tweet with media attachment to Twitter
     */
    tweetWithMedia(content: string, mediaPath: string): Promise<boolean>;
}
