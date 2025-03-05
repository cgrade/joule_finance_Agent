import { HumanMessage, FunctionMessage } from "@langchain/core/messages";
import { PosterState } from "../state/types";
import { pruneMessages, logStateSize } from "../state/utils";
import { getLLM } from "../utils/llm";
import { JouleFinanceDataTool } from "../tools/jouleFinance";
import { JouleMetricType, Timeframe } from "../types";

/**
 * Creates a data reader agent that fetches Joule Finance metrics
 */
export const createReaderAgent = (jouleFinanceReader: JouleFinanceDataTool) => {
  return async (state: PosterState): Promise<Partial<PosterState>> => {
    // First prune messages to prevent accumulation
    const messages = pruneMessages(state.messages || [], 20);
    
    // Log state size for debugging
    logStateSize({ messages, lastPostTime: state.lastPostTime, metrics: state.metrics }, 'reader_agent:start');
    
    try {
      const llm = getLLM();
      
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
      
      const response = await llm.invoke([new HumanMessage(prompt)]);
      
      // Extract the JSON array from the response
      let metricsToFetch: Array<{
        metric_type: JouleMetricType;
        timeframe: Timeframe;
        asset?: string;
      }>;
      
      try {
        // Extract JSON from the text if needed
        const responseText = response.content as string;
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/\[([\s\S]*?)\]/);
        
        if (jsonMatch) {
          metricsToFetch = JSON.parse(jsonMatch[0]);
        } else {
          metricsToFetch = JSON.parse(responseText);
        }
      } catch (error) {
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
        tvl: results.tvl?.data && 'total_tvl' in (results.tvl.data as any) 
          ? (results.tvl.data as any).total_tvl 
          : state.metrics?.tvl,
        apy: results.leveraged_yield?.data && 'top_strategies' in (results.leveraged_yield.data as any) && 
             Array.isArray((results.leveraged_yield.data as any).top_strategies) 
          ? (results.leveraged_yield.data as any).top_strategies[0]?.net_apy 
          : state.metrics?.apy
      };
      
      // Ensure new messages are named
      const newMessages = [...messages, new FunctionMessage({
        content: JSON.stringify(results),
        name: "reader_agent"
      })];
      
      return {
        messages: newMessages,
        lastPostTime: state.lastPostTime,
        metrics: updatedMetrics
      };
    } catch (error) {
      console.error('Error in reader agent:', error);
      return {
        messages: [...messages, new FunctionMessage({
          content: JSON.stringify({ error: (error as Error).message }),
          name: "reader_agent_error"
        })],
        lastPostTime: state.lastPostTime,
        metrics: state.metrics
      };
    }
  };
};

export default createReaderAgent; 