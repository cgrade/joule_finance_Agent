import { AgentRuntime } from "../agent/runtime";
import { JouleFinanceData, JouleMetricType, Timeframe } from "../types";
/**
 * Tool for fetching and processing Joule Finance blockchain data
 */
export declare class JouleFinanceDataTool {
    private agentRuntime;
    constructor(agentRuntime: AgentRuntime);
    /**
     * Fetches Joule Finance data based on requested metrics
     * @param metrics Array of metric requests
     * @returns Organized data for each requested metric
     */
    getJouleFinanceData(metrics: Array<{
        metric_type: JouleMetricType;
        timeframe: Timeframe;
        asset?: string;
    }>): Promise<JouleFinanceData>;
    /**
     * Generates realistic mock data for different Joule Finance metrics
     */
    private getMockDataForMetric;
}
export default JouleFinanceDataTool;
