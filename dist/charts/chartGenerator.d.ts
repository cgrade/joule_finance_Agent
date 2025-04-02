import { MarketData } from "../tools/jouleFinanceDataTool.js";
import { ChartType } from "./types.js";
/**
 * Generate an asset distribution chart based on the provided market data
 */
export declare function generateAssetDistributionChart(marketData: MarketData): Promise<string>;
/**
 * Generate an APR comparison chart based on the provided market data
 */
export declare function generateAprsComparisonChart(marketData: MarketData): Promise<string>;
/**
 * Generate a chart by type
 */
export declare function generateChart(type: ChartType, marketData: MarketData): Promise<string>;
export { ChartType };
