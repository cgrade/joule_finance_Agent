/**
 * Tool for fetching and processing Joule Finance blockchain data
 */
export class JouleFinanceDataTool {
    agentRuntime;
    constructor(agentRuntime) {
        this.agentRuntime = agentRuntime;
    }
    /**
     * Fetches Joule Finance data based on requested metrics
     * @param metrics Array of metric requests
     * @returns Organized data for each requested metric
     */
    async getJouleFinanceData(metrics) {
        try {
            // Initialize the results object
            const results = {};
            // Process each requested metric
            for (const metricRequest of metrics) {
                const { metric_type, timeframe, asset } = metricRequest;
                // Generate a unique key for each metric result
                const key = `${metric_type}${asset ? `_${asset}` : ''}`;
                // In a real implementation, this would make on-chain calls via the agent runtime
                // For now, we'll use mock data for demonstration
                results[key] = {
                    metric_type,
                    timeframe,
                    asset,
                    data: this.getMockDataForMetric(metric_type, timeframe, asset),
                    timestamp: new Date().toISOString()
                };
            }
            return results;
        }
        catch (error) {
            console.error('Error fetching Joule Finance data:', error);
            throw new Error(`Failed to fetch Joule Finance data: ${error.message}`);
        }
    }
    /**
     * Generates realistic mock data for different Joule Finance metrics
     */
    getMockDataForMetric(metricType, timeframe, asset) {
        switch (metricType) {
            case "tvl":
                return {
                    total_tvl: 142500000,
                    change_percent: 42.5,
                    by_asset: {
                        "APT": 72000000,
                        "USDC": 15000000,
                        "USDT": 10500000,
                        "jpufETH": 22500000,
                        "jrswETH": 12500000,
                        "jezETH": 10000000
                    }
                };
            case "money_market":
                return {
                    total_deposits: 85000000,
                    total_borrows: 46500000,
                    utilization_rate: 54.7,
                    by_asset: {
                        "USDC": {
                            deposits: 15000000,
                            borrows: 12250000,
                            utilization: 81.7,
                            supply_apy: 3.2,
                            borrow_apy: 5.4
                        },
                        "APT": {
                            deposits: 70000000,
                            borrows: 34250000,
                            utilization: 48.9,
                            supply_apy: 2.8,
                            borrow_apy: 4.9
                        }
                    },
                    healthy_positions_percent: 96.5
                };
            case "leveraged_yield":
                return {
                    total_leveraged_positions: 18500000,
                    average_leverage: 3.7,
                    top_strategies: [
                        {
                            asset: "jpufETH",
                            base_apy: 5.8,
                            leverage: 5,
                            net_apy: 27.0,
                            total_value: 8500000
                        },
                        {
                            asset: "jrswETH",
                            base_apy: 4.6,
                            leverage: 4,
                            net_apy: 16.5,
                            total_value: 6000000
                        }
                    ],
                    average_health_factor: 1.85
                };
            case "bridge_volume":
                return {
                    total_volume: 68500000,
                    total_transactions: 22400,
                    growth_percent: 35.6,
                    by_token: {
                        "jpufETH": {
                            volume: 1500000,
                            transactions: 580,
                            avg_size: 2586
                        },
                        "jrswETH": {
                            volume: 1200000,
                            transactions: 450,
                            avg_size: 2667
                        },
                        "jezETH": {
                            volume: 800000,
                            transactions: 220,
                            avg_size: 3636
                        }
                    }
                };
            default:
                return {
                    note: "Mock data not defined for this metric type",
                    metric_type: metricType,
                    timeframe: timeframe,
                    asset: asset
                };
        }
    }
}
export default JouleFinanceDataTool;
