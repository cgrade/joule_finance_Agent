import { JouleFinanceDataTool } from './tools/jouleFinanceDataTool.js';
import { generateAssetDistributionChart } from './charts/chartGenerator.js';
import * as fs from 'fs';
import * as path from 'path';
async function testChart() {
    try {
        console.log('Testing chart generation with updated Joule Finance data...');
        // Get Joule Finance data
        const dataProvider = new JouleFinanceDataTool();
        const data = await dataProvider.getData();
        console.log('Successfully retrieved Joule Finance data:');
        console.log(`TVL: $${data.tvl.toLocaleString()}`);
        console.log(`Average APR: ${data.apr.toFixed(2)}%`);
        console.log(`Users: ${data.users.toLocaleString()}`);
        console.log('\nAsset breakdown:');
        // Display asset data in a sorted table format
        const sortedAssets = Object.entries(data.assets)
            .sort((a, b) => b[1].tvl - a[1].tvl)
            .map(([symbol, assetData]) => ({
            symbol,
            tvl: assetData.tvl,
            percentage: (assetData.tvl / data.tvl * 100).toFixed(2),
            apr: assetData.apr.toFixed(2)
        }));
        console.table(sortedAssets);
        // Generate chart
        console.log('\nGenerating asset distribution chart...');
        const chartPath = await generateAssetDistributionChart(data);
        console.log(`\nChart successfully generated at: ${chartPath}`);
        console.log('You can open this image file to view the chart.');
        // Create charts directory in project root for convenience
        const rootChartsDir = path.join(__dirname, '../charts');
        fs.mkdirSync(rootChartsDir, { recursive: true });
        // Copy the chart to project root for easier access
        const filename = path.basename(chartPath);
        const destPath = path.join(rootChartsDir, filename);
        fs.copyFileSync(chartPath, destPath);
        console.log(`\nChart also copied to: ${destPath} for easier access`);
    }
    catch (error) {
        console.error('Error generating chart:', error);
    }
}
// Run the test
testChart().catch(console.error);
