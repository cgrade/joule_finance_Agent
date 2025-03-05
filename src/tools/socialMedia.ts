import { TwitterApi } from 'twitter-api-v2';
import { ChartVisualizationTool } from './visualization';
import config from '../config';
import fs from 'fs';
import { XPostResult } from '../types';

/**
 * Tool for posting professional content to X/Twitter
 */
export class XProfessionalPostTool {
  private twitterClient: TwitterApi;
  private visualizationTool: ChartVisualizationTool;
  private developmentMode: boolean;

  constructor(
    visualizationTool: ChartVisualizationTool, 
    devMode: boolean = process.env.NODE_ENV !== 'production'
  ) {
    this.visualizationTool = visualizationTool;
    this.developmentMode = devMode;

    // Initialize Twitter client
    try {
      this.twitterClient = new TwitterApi(
        config.twitter.apiKey + ':' + config.twitter.apiSecret
      );
      console.log('Twitter client initialized with API keys');
    } catch (error) {
      console.error('Failed to initialize Twitter client:', error);
      throw new Error(`Twitter client initialization failed: ${(error as Error).message}`);
    }
  }

  /**
   * Posts a tweet with optional image visualization
   * @param content Tweet text content
   * @param shouldVisualize Whether to include a data visualization
   * @returns Result of posting operation
   */
  async postTweet(
    content: string, 
    shouldVisualize: boolean = true
  ): Promise<XPostResult> {
    try {
      // Generate chart if visualization is requested
      let mediaPath: string | undefined;
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
    } catch (error) {
      console.error('Error posting to X/Twitter:', error);
      return {
        success: false,
        error: (error as Error).message,
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
  private async postRealTweet(
    content: string, 
    mediaPath?: string
  ): Promise<XPostResult> {
    try {
      let mediaId: string | undefined;
      
      // Upload media if provided
      if (mediaPath) {
        console.log(`postTweet called with media path: ${mediaPath}`);
        console.log(`Attempting to use media at path: ${mediaPath}`);
        
        // Check if file exists and has content
        if (fs.existsSync(mediaPath)) {
          const stats = fs.statSync(mediaPath);
          console.log(`Media file exists! Size: ${stats.size} bytes`);
          
          if (stats.size > 0) {
            // Upload media to Twitter
            const mediaBuffer = fs.readFileSync(mediaPath);
            const mediaUpload = await this.twitterClient.v1.uploadMedia(mediaBuffer, {
              mimeType: 'image/png'
            });
            mediaId = mediaUpload;
          }
        }
      }
      
      // Post the tweet
      const tweetOptions = mediaId ? 
        { media: { media_ids: [mediaId] as [string] } } : undefined;
      const tweet = await this.twitterClient.v2.tweet(content, tweetOptions);
      
      return {
        success: true,
        tweet_id: tweet.data.id,
        text: content,
        development_mode: false
      };
    } catch (error) {
      console.error('Error posting real tweet:', error);
      throw error; // Re-throw to be caught by the parent method
    }
  }
}

export default XProfessionalPostTool; 