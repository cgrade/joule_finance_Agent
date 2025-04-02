import { JouleFinanceDataTool } from './tools/jouleFinanceDataTool.js';
import { generateAssetDistributionChart } from './charts/chartGenerator.js';
import { TwitterClient } from './clients/twitterClient.js';
async function testChartPost() {
    try {
        console.log('Testing chart generation and posting...');
        // Get Joule Finance data
        const dataProvider = new JouleFinanceDataTool();
        const data = await dataProvider.getData();
        // Generate chart
        console.log('Generating asset distribution chart...');
        const chartPath = await generateAssetDistributionChart(data);
        // Create tweet content
        const tweetContent = `Joule Finance Asset Distribution Analysis:\n\n` +
            `TVL: $${data.tvl.toLocaleString()}\n` +
            `Top assets: ${Object.entries(data.assets)
                .sort((a, b) => b[1].tvl - a[1].tvl)
                .slice(0, 3)
                .map(([symbol]) => symbol)
                .join(', ')}\n` +
            `Average APR: ${data.apr.toFixed(2)}%\n\n` +
            `#JouleFinance #DeFi #Aptos`;
        // Post to Twitter
        console.log('Posting chart to Twitter...');
        const twitterClient = new TwitterClient();
        const result = await twitterClient.tweetWithMedia(tweetContent, chartPath);
        if (result) {
            console.log('✅ Chart successfully posted to Twitter!');
        }
        else {
            console.log('❌ Failed to post chart to Twitter.');
        }
    }
    catch (error) {
        console.error('Error testing chart posting:', error);
    }
}
// Run the test
testChartPost().catch(console.error);
