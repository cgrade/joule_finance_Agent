/**
 * Joule Finance metric types
 */
export type JouleMetricType = "tvl" | "money_market" | "leveraged_yield" | "bridge_volume" | "liquidation_stats" | "apy_rates";
/**
 * Timeframe options for data retrieval
 */
export type Timeframe = "24h" | "7d" | "30d" | "all";
/**
 * Generic result interface for tool operations
 */
export interface ToolResult {
    success: boolean;
    error?: string;
    [key: string]: any;
}
/**
 * Twitter/X post result interface
 */
export interface XPostResult extends ToolResult {
    tweet_id?: string;
    text?: string;
    development_mode: boolean;
}
/**
 * Data structure for Joule Finance metrics
 */
export interface JouleFinanceData {
    [key: string]: {
        metric_type: JouleMetricType;
        timeframe: Timeframe;
        asset?: string;
        data?: any;
        timestamp: string;
    };
}
