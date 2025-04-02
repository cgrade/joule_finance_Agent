import { ChartFactory } from "./ChartFactory.js";
import { ChartType } from "./types.js";
/**
 * Generate an asset distribution chart based on the provided market data
 */
export async function generateAssetDistributionChart(marketData) {
    console.log('Generating asset distribution chart...');
    const chart = ChartFactory.createChart(ChartType.AssetDistribution, marketData);
    return await chart.save();
}
/**
 * Generate an APR comparison chart based on the provided market data
 */
export async function generateAprsComparisonChart(marketData) {
    console.log('Generating APRs comparison chart...');
    const chart = ChartFactory.createChart(ChartType.AprsComparison, marketData);
    return await chart.save();
}
/**
 * Generate a chart by type
 */
export async function generateChart(type, marketData) {
    console.log(`Generating ${type} chart...`);
    const chart = ChartFactory.createChart(type, marketData);
    return await chart.save();
}
// Export types
export { ChartType };
