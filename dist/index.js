/**
 * Joule Finance Twitter Posting Agent
 *
 * This script generates and posts informative content about Joule Finance,
 * a lending protocol on the Aptos blockchain.
 */
import * as dotenv from 'dotenv';
import chalk from "chalk";
import { JouleFinanceDataTool } from './tools/jouleFinanceDataTool.js';
import { TwitterClient } from './clients/twitterClient.js';
import { generatePostWithData } from './agent/postGenerator.js';
import config from './config.js';
import { ChartType, generateChart } from './charts/chartGenerator.js';
import { fileURLToPath } from 'url';
// Load environment variables
dotenv.config();
// Initialize tools
const jouleFinanceTool = new JouleFinanceDataTool();
const twitterClient = new TwitterClient();
// Add or modify any environment checks
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
    console.log(chalk.green('🚀 Starting Joule Finance Agent in PRODUCTION mode'));
    console.log(chalk.green('🐦 Tweets will be actually posted to Twitter'));
}
else {
    console.log(chalk.yellow('⚠️ Running in DEVELOPMENT mode'));
    console.log(chalk.yellow('🐦 Tweets will be logged but not posted'));
}
// Print banner
console.log(chalk.cyan('\n🔄 JOULE FINANCE AGENT 🔄'));
console.log(chalk.cyan('==============================\n'));
console.log(chalk.cyan('➤ Initializing Joule Finance posting agent...'));
// Development mode warning for Twitter API
if (config.DEVELOPMENT_MODE) {
    console.log(chalk.yellow('WARNING: Missing Twitter API credentials'));
    console.log(chalk.yellow('The agent will run in development mode (tweets will be logged but not posted)'));
}
// Sample post topics
const POST_TOPICS = [
    "Joule Finance TVL and yield opportunities",
    "Multi-asset lending on Joule Finance",
    "Joule Finance user growth and ecosystem impact",
    "Latest Joule Finance protocol updates",
    "Joule Finance cross-chain capabilities",
    "Joule Finance security features and audits",
    "Joule Finance yield optimization strategies",
    "Joule Finance lending and borrowing markets",
    "Joule Finance integration with other Aptos protocols"
];
/**
 * Select a random chart type
 */
function getRandomChartType() {
    const types = [
        ChartType.AssetDistribution,
        ChartType.AprsComparison
        // ChartType.TvlTrend,  // Uncomment when implemented
        // ChartType.RiskAdjustedReturn
    ];
    return types[Math.floor(Math.random() * types.length)];
}
// Add this function to decide when to include a chart
function shouldIncludeChart(postCount) {
    // Include a chart every 3 posts
    return postCount % 3 === 0;
}
// Function to decide when to tag the Joule Finance account
function shouldTagJouleFinance() {
    // Tag approximately once every 5-7 posts (15-20% of the time)
    return Math.random() < 0.18;
}
// Add a counter to track the number of posts
let postCount = 0;
// Modify the postTweet function to occasionally include charts and tags
async function postTweet(prompt = "Joule Finance latest analytics") {
    console.log(`Processing request: ${prompt}`);
    try {
        // Get market data
        const marketData = await jouleFinanceTool.getData();
        console.log(`Retrieved market data: ${marketData ? 'success' : 'failed'}`);
        // Increment post count
        postCount++;
        // Decide whether to include a chart
        const includeChart = shouldIncludeChart(postCount);
        // Decide whether to tag Joule Finance
        const tagJouleFinance = shouldTagJouleFinance();
        const jouleTag = tagJouleFinance ? "@JouleFinance " : "";
        if (includeChart) {
            console.log('Generating chart for this post...');
            // Select chart type
            const chartType = getRandomChartType();
            let chartPath = '';
            let chartContent = '';
            // Generate appropriate chart based on type
            chartPath = await generateChart(chartType, marketData);
            // Then create content based on chart type
            switch (chartType) {
                case ChartType.AssetDistribution:
                    chartContent = `${jouleTag}Joule Finance Asset Distribution Analysis:\n\n` +
                        `TVL: $${marketData.tvl.toLocaleString()} 📈\n` +
                        `Top assets leading the ecosystem: ${Object.entries(marketData.assets)
                            .sort((a, b) => b[1].tvl - a[1].tvl)
                            .slice(0, 3)
                            .map(([symbol]) => symbol)
                            .join(', ')} 💰\n` +
                        `Impressive average APR: ${marketData.apr.toFixed(2)}% 🔥\n\n` +
                        `#AptosDeFi #YieldFarming #JouleFinance`;
                    break;
                case ChartType.AprsComparison:
                    // For future implementation
                    chartContent = `${jouleTag}Joule Finance APR Analysis - Outperforming the Market:\n\n` +
                        `Industry-leading average lending APR: ${marketData.apr.toFixed(2)}% 💸\n` +
                        `Top yielding assets crushing the competition: ${Object.entries(marketData.assets)
                            .sort((a, b) => b[1].apr - a[1].apr)
                            .slice(0, 3)
                            .map(([symbol, data]) => `${symbol} (${data.apr.toFixed(2)}%)`)
                            .join(', ')} ⚡\n\n` +
                        `#PassiveIncome #DeFiYields #JouleFinance`;
                    break;
            }
            // Post with the chart
            await twitterClient.tweetWithMedia(chartContent, chartPath);
        }
        else {
            // Generate regular text post
            let content = await generatePostWithData(null, prompt, marketData);
            // Always add Joule Finance tag at the beginning
            content = `${jouleTag}${content}`;
            console.log("\n=== GENERATED POST ===");
            console.log(content);
            console.log("======================\n");
            // Post the text-only tweet
            await twitterClient.tweet(content);
        }
        console.log("Post completed.");
    }
    catch (error) {
        console.error("Error posting tweet:", error);
    }
}
// Handle the scheduled posting
async function runScheduledPost() {
    try {
        // Choose a random topic from our list
        const randomIndex = Math.floor(Math.random() * POST_TOPICS.length);
        const topic = POST_TOPICS[randomIndex];
        console.log(chalk.cyan(`[${new Date().toISOString()}] Scheduled post triggered: "${topic}"`));
        await postTweet(topic);
        console.log('Post completed. Next post in', config.POST_FREQUENCY_SECONDS, 'seconds');
    }
    catch (error) {
        console.error('Error in scheduled post:', error);
    }
}
// Main function
const main = async () => {
    try {
        // Check command line arguments
        const args = process.argv.slice(2);
        if (args.includes('--frequency') || args.includes('-f')) {
            // Start scheduled posting with configured frequency
            const frequencySeconds = config.POST_FREQUENCY_SECONDS;
            console.log(chalk.blue(`ℹ️ Starting scheduled posting every ${frequencySeconds} seconds`));
            // Run immediately
            await runScheduledPost();
            // Then set up interval
            setInterval(runScheduledPost, frequencySeconds * 1000);
        }
        else if (args.includes('--help') || args.includes('-h')) {
            // Show help message
            console.log(`
Usage: npm run start [options]

Options:
  --frequency, -f    Run scheduled posting with the configured frequency
  --help, -h         Show this help message

Example:
  npm run start --frequency
`);
        }
        else {
            // Run once with a random topic
            const randomIndex = Math.floor(Math.random() * POST_TOPICS.length);
            const topic = POST_TOPICS[randomIndex];
            await postTweet(topic);
            process.exit(0);
        }
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
// Check if this module is being run directly
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
    main().catch(error => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}
