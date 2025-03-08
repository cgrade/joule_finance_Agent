"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReaderAgent = void 0;
const messages_1 = require("@langchain/core/messages");
const utils_1 = require("../state/utils");
const llm_1 = require("../utils/llm");
/**
 * Creates a data reader agent that fetches Joule Finance metrics
 */
const createReaderAgent = (jouleFinanceReader) => {
    return async (state) => {
        // First prune messages to prevent accumulation
        const messages = (0, utils_1.pruneMessages)(state.messages || [], 20);
        // Log state size for debugging
        (0, utils_1.logStateSize)({ messages, lastPostTime: state.lastPostTime, metrics: state.metrics }, 'reader_agent:start');
        try {
            const llm = (0, llm_1.getLLM)();
            // Determine which metrics to fetch based on the request
            const prompt = `You are an on-chain data analyst specialized in Joule Finance on Aptos.
      Your job is to determine which metrics would be most relevant and bullish to fetch based on this request:
      "${messages[messages.length - 1].content}"
      
      Respond with a JSON array of objects, where each object contains:
      - metric_type: One of "tvl", "money_market", "leveraged_yield", "bridge_volume", "liquidation_stats", "apy_rates"
      - timeframe: "24h", "7d", "30d", or "all" 
      - asset (optional): specific asset symbol like "APT", "USDC", "jpufETH", etc.
      
      Choose metrics that would show positive momentum, growth, or strong fundamentals of Joule Finance.
      Only include metrics that would help create a bullish post about Joule.
      
      Do not include any explanation, just the JSON array.
      `;
            const response = await llm.invoke([new messages_1.HumanMessage(prompt)]);
            // Extract the JSON array from the response
            let metricsToFetch;
            try {
                // Extract JSON from the text if needed
                const responseText = response.content;
                const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/\[([\s\S]*?)\]/);
                if (jsonMatch) {
                    metricsToFetch = JSON.parse(jsonMatch[0]);
                }
                else {
                    metricsToFetch = JSON.parse(responseText);
                }
            }
            catch (error) {
                console.error('Failed to parse metrics from LLM response:', error);
                // Fallback metrics that highlight Joule's strengths
                metricsToFetch = [
                    { metric_type: "tvl", timeframe: "7d" },
                    { metric_type: "money_market", timeframe: "24h" },
                    { metric_type: "leveraged_yield", timeframe: "7d", asset: "jpufETH" }
                ];
            }
            // Use the JouleFinanceDataTool to fetch the metrics
            console.log('Fetching Joule Finance metrics:', metricsToFetch);
            const results = await jouleFinanceReader.getJouleFinanceData(metricsToFetch);
            // Store relevant metrics for future reference
            const updatedMetrics = {
                ...state.metrics,
                // Use type assertion to safely access potentially mismatched properties
                tvl: results.tvl?.data && 'total_tvl' in results.tvl.data
                    ? results.tvl.data.total_tvl
                    : state.metrics?.tvl,
                apy: results.leveraged_yield?.data && 'top_strategies' in results.leveraged_yield.data &&
                    Array.isArray(results.leveraged_yield.data.top_strategies)
                    ? results.leveraged_yield.data.top_strategies[0]?.net_apy
                    : state.metrics?.apy
            };
            // Ensure new messages are named
            const newMessages = [...messages, new messages_1.FunctionMessage({
                    content: JSON.stringify(results),
                    name: "reader_agent"
                })];
            return {
                messages: newMessages,
                lastPostTime: state.lastPostTime,
                metrics: updatedMetrics
            };
        }
        catch (error) {
            console.error('Error in reader agent:', error);
            return {
                messages: [...messages, new messages_1.FunctionMessage({
                        content: JSON.stringify({ error: error.message }),
                        name: "reader_agent_error"
                    })],
                lastPostTime: state.lastPostTime,
                metrics: state.metrics
            };
        }
    };
};
exports.createReaderAgent = createReaderAgent;
exports.default = exports.createReaderAgent;
//# sourceMappingURL=readerAgent.js.map