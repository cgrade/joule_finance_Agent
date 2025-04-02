import chalk from 'chalk';
import * as fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Twitter client for posting tweets
 */
export class TwitterClient {
  private client: TwitterApi | null = null;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // Check if we have all required Twitter credentials
    const hasCredentials = 
      process.env.TWITTER_API_KEY && 
      process.env.TWITTER_API_SECRET && 
      process.env.TWITTER_ACCESS_TOKEN && 
      process.env.TWITTER_ACCESS_TOKEN_SECRET &&
      process.env.TWITTER_CLIENT_ID &&
      process.env.TWITTER_CLIENT_SECRET;
    
    if (this.isProduction && hasCredentials) {
      // Initialize the Twitter client with credentials
      this.client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY!,
        appSecret: process.env.TWITTER_API_SECRET!,
        accessToken: process.env.TWITTER_ACCESS_TOKEN!,
        accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!
      });
      
      console.log(chalk.green('✅ Twitter client initialized in PRODUCTION mode'));
    } else {
      console.log(chalk.yellow('⚠️ Twitter client initialized in DEVELOPMENT mode (tweets will be logged but not posted)'));
      
      if (!hasCredentials) {
        console.log(chalk.yellow('Missing Twitter API credentials. Add them to your .env file to enable actual posting.'));
      }
    }
  }

  /**
   * Post a tweet to Twitter
   */
  async tweet(content: string): Promise<boolean> {
    console.log(chalk.blue('🐦 Tweet content:'), content);
    
    if (this.isProduction && this.client) {
      try {
        // Actually post to Twitter in production mode
        const response = await this.client.v2.tweet({
          text: content
        });
        console.log(chalk.green('✅ Tweet posted successfully:'), response.data.id);
        return true;
      } catch (error) {
        console.error(chalk.red('❌ Error posting tweet:'), error);
        return false;
      }
    } else {
      // In development mode, just log the tweet
      console.log(chalk.yellow('ℹ️ DEVELOPMENT MODE: Tweet would be posted in production'));
      return true;
    }
  }
  
  /**
   * Post a tweet with media attachment to Twitter
   */
  async tweetWithMedia(content: string, mediaPath: string): Promise<boolean> {
    console.log(chalk.blue('🐦 Tweet with media:'), content);
    console.log(chalk.blue('📊 Media file:'), mediaPath);
    
    // Verify media file exists
    if (!fs.existsSync(mediaPath)) {
      console.error(chalk.red('❌ Media file not found:'), mediaPath);
      return false;
    }
    
    if (this.isProduction && this.client) {
      try {
        // Upload the media file using v1 API
        const media = await this.client.v1.uploadMedia(mediaPath);
        
        // Post tweet with media
        const response = await this.client.v2.tweet({
          text: content,
          media: { media_ids: [media] }
        });
        
        console.log(chalk.green('✅ Tweet with media posted successfully:'), response.data.id);
        return true;
      } catch (error) {
        console.error(chalk.red('❌ Error posting tweet with media:'), error);
        return false;
      }
    } else {
      // In development mode, just log what would happen
      console.log(chalk.yellow('ℹ️ DEVELOPMENT MODE: Tweet with media would be posted in production'));
      return true;
    }
  }
} 