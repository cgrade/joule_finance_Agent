/**
 * Joule Finance X/Twitter Professional Posting Agent
 * 
 * Main entry point for the Joule Finance bull posting agent.
 * This agent automatically generates and posts professional content
 * about Joule Finance on the Aptos blockchain.
 * 
 * Built for the Aptos/Move hackathon using Move Agent Kit.
 */

import * as dotenv from 'dotenv';
import * as cron from 'node-cron';
import { runAsBullishPoster, createBullishPostSystem } from './poster';
import config from './config';
import { logger } from './utils/logger';
import { TwitterReplyMonitor } from './reply-monitor';
import { JouleKnowledgeBase } from './knowledge/knowledge-base';

// Ensure environment variables are loaded
dotenv.config();

// Add this function near the top of the file, after imports
function getRandomPrompt(): string {
  const prompts = [
    "Create a post about Joule Finance TVL growth and market share expansion",
    "Share the latest APY rates for Joule Finance lending markets with competitive analysis",
    "Post about Joule Finance's leveraged yield farming opportunities and risk-adjusted returns",
    "Create content about Joule Finance's cross-chain LRT capabilities and LayerZero integration",
    "Analyze Joule Finance's performance versus competing DeFi protocols with key metrics",
    "Highlight the strategic advantages of Joule Finance on Aptos blockchain",
    "Detail Joule Finance's innovative liquidation mechanisms and risk management",
    "Showcase Joule Finance's institutional-grade infrastructure and security features",
    "Explain Joule Finance's role in Aptos DeFi ecosystem development",
    "Break down Joule Finance's multi-asset lending markets and collateral efficiency",
    "Present Joule Finance's cross-chain liquidity aggregation capabilities",
    "Analyze Joule Finance's capital efficiency metrics and utilization rates",
    "Highlight Joule Finance's automated yield optimization strategies",
    "Detail Joule Finance's integration with major Aptos DeFi protocols",
    "Share Joule Finance's latest protocol upgrades and feature releases"
  ];
  
  return prompts[Math.floor(Math.random() * prompts.length)];
}

// Set up scheduler if enabled
const setupScheduler = async (): Promise<void> => {
  if (!config.scheduler.enabled) {
    console.log('Scheduler is disabled. Run the script directly to create a bull post.');
    return;
  }

  // Parse daily posting time
  const [dailyHour, dailyMinute] = config.scheduler.dailyPostingTime.split(':').map(Number);
  
  // Parse weekly report time
  const [weeklyHour, weeklyMinute] = config.scheduler.weeklyReportTime.split(':').map(Number);
  
  // Create the bull posting system
  console.log('Initializing Joule Finance Bull Posting system...');
  const createBullishPost = await createBullishPostSystem();
  
  // Schedule daily posting
  console.log(`Setting up daily posting schedule at ${config.scheduler.dailyPostingTime}`);
  cron.schedule(`${dailyMinute} ${dailyHour} * * *`, async () => {
    console.log('Running daily Joule Finance bull post...');
    try {
      await createBullishPost("Share the latest Joule Finance metrics in a professional bullish post. Focus on today's performance.");
      console.log('Daily post completed successfully!');
    } catch (error) {
      console.error('Error in daily posting:', error);
    }
  });
  
  // Schedule weekly reporting
  console.log(`Setting up weekly reporting schedule on day ${config.scheduler.weeklyReportDay} at ${config.scheduler.weeklyReportTime}`);
  cron.schedule(`${weeklyMinute} ${weeklyHour} * * ${config.scheduler.weeklyReportDay}`, async () => {
    console.log('Running weekly Joule Finance performance report...');
    try {
      await createBullishPost("Create a comprehensive weekly performance report on Joule Finance. Include TVL growth, money market metrics, and the best yield farming opportunities.");
      console.log('Weekly report completed successfully!');
    } catch (error) {
      console.error('Error in weekly reporting:', error);
    }
  });
  
  console.log('Scheduler setup complete. Waiting for scheduled tasks...');
};

/**
 * Scheduled posting with frequency from config
 */
export const startScheduledPosting = async (frequencySeconds: number): Promise<void> => {
  try {
    // Initialize knowledge base
    const knowledgeBase = new JouleKnowledgeBase();
    await knowledgeBase.initialize();
    
    // Create and initialize Twitter reply monitor
    const replyMonitor = new TwitterReplyMonitor();
    await replyMonitor.initialize();
    
    // Start monitoring for replies (check every 2 minutes)
    await replyMonitor.startMonitoring(120000);
    
    // Create the posting system with knowledge integration
    const createBullishPost = await createBullishPostSystem(knowledgeBase);
    
    // Start the posting schedule
    console.log(`Starting scheduled posting every ${frequencySeconds} seconds`);
    
    // Define the scheduled function
    const runScheduledPost = async () => {
      console.log(`[${new Date().toISOString()}] Scheduled post triggered: "${getRandomPrompt()}"`);
      try {
        await createBullishPost(getRandomPrompt());
        console.log(`Post completed. Next post in ${frequencySeconds} seconds`);
      } catch (error) {
        console.error('Error in scheduled post:', error);
      }
    };
    
    // Execute immediately first time
    await runScheduledPost();
    
    // Then schedule regular interval
    setInterval(runScheduledPost, frequencySeconds * 1000);
  } catch (error) {
    console.error('Error starting scheduled posting:', error);
    throw error;
  }
};

// Main function
const main = async (): Promise<void> => {
  try {
    // Check if this is a direct run or scheduler setup
    const args = process.argv.slice(2);
    
    if (args.includes('--schedule') || args.includes('-s')) {
      // Setup scheduler with cron
      await setupScheduler();
    } else if (args.includes('--frequency') || args.includes('-f')) {
      // Run with frequency-based scheduling from .env
      await startScheduledPosting(config.posting.frequencySeconds);
    } else if (args.includes('--help') || args.includes('-h')) {
      // Show usage instructions
      console.log(`
Usage: node dist/index.js [options] [message]

Options:
  -s, --schedule    Run as scheduler (posts at configured cron times)
  -f, --frequency   Run with frequency-based posting (posts every N seconds)
  -h, --help        Show this help message

Examples:
  node dist/index.js                                     Run with default message
  node dist/index.js "Post about Joule Finance TVL"      Run with custom message
  node dist/index.js --schedule                          Start cron scheduler
  node dist/index.js --frequency                         Start frequency-based scheduler
`);
    } else {
      // Run a single bull post
      const userInput = args.join(' ') || "Create a professional bull post about Joule Finance's performance this week";
      await runAsBullishPoster(userInput);
    }
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
};

// Run the main function
if (require.main === module) {
  main().catch(console.error);
}