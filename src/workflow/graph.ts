import { LLMChain } from "langchain/chains";
import { SequentialChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import Anthropic from '@anthropic-ai/sdk';
import {
  createManagerAgent,
  createReaderAgent, 
  createWriterAgent,
  createPostingAgent
} from "../agents";
import { 
  JouleFinanceDataTool,
  ChartVisualizationTool,
  XProfessionalPostTool,
  JouleKnowledgeBase
} from "../tools";
import config from "../config";

// Define the market data interface
interface MarketData {
  tvl: number;
  apr: number;
  users: number;
  volume24h: number;
  assets: Record<string, { price: number; tvl: number; apr: number; }>;
  [key: string]: any;
}

// Complete the implementation with proper visualization support
export const buildPosterWorkflow = (
  jouleFinanceTool: JouleFinanceDataTool,
  xPostTool: XProfessionalPostTool,
  knowledgeBase?: JouleKnowledgeBase
) => {
  try {
    console.log('Building Joule Finance poster workflow...');
    
    // Initialize direct Anthropic client
    const anthropicClient = new Anthropic({
      apiKey: config.llm.apiKey,
    });
    
    console.log('Initializing with API key starting with:', config.llm.apiKey.substring(0, 4) + '...');
    
    return {
      invoke: async (stateObject: any) => {
        // Extract input
        let input = extractInput(stateObject);
        console.log(`Extracted input: "${input}"`);
        
        try {
          // 1. Manager stage
          const managerResult = await anthropicClient.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1000,
            messages: [{ role: 'user', content: `Manage the request: ${input}` }]
          });
          
          // 2. Reader stage - proper error handling for getData
          // Initialize marketData with a default empty structure
          let marketData: MarketData = {
            tvl: 0,
            apr: 0,
            users: 0,
            volume24h: 0,
            assets: {}
          };
          
          try {
            // Try to use the tool's getData if it exists
            if (jouleFinanceTool && typeof (jouleFinanceTool as any).getData === 'function') {
              marketData = await (jouleFinanceTool as any).getData() || marketData;
            }
          } catch (error) {
            console.error("Error getting market data:", error);
          }
          console.log("Retrieved market data:", marketData ? "success" : "failed");
          
          const readerResult = await anthropicClient.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1000,
            messages: [
              { role: 'user', content: `Read data for: ${input}\nHere's the market data: ${JSON.stringify(marketData)}` }
            ]
          });
          
          // Fix content access - extract text safely
          const readerContent = getMessageContent(readerResult);
          
          // 3. Writer stage
          const writerResult = await anthropicClient.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1500,
            messages: [
              { 
                role: 'user', 
                content: `Write a concise, data-driven social media post about: ${input}
                
                ${marketData.dataSource === "blockchain" 
                  ? `Based on this Joule Finance real-time data from the blockchain:
                
                - TVL: $${(marketData.tvl/1000000).toFixed(2)}M
                - Current APR: ${marketData.apr.toFixed(2)}%
                - 24h Trading Volume: $${(marketData.volume24h/1000000).toFixed(2)}M
                - Active Users: ${marketData.users.toLocaleString()}
                
                Blockchain confirmation: ${marketData.blockchainProof || "Data verified from blockchain"}
                Last updated: ${marketData.lastUpdated || new Date().toISOString()}
                
                Top Assets:
                ${Object.entries(marketData.assets)
                  .sort((a, b) => b[1].tvl - a[1].tvl)
                  .slice(0, 3)
                  .map(([asset, data]) => 
                    `- ${asset}: Price $${data.price.toFixed(2)}, TVL $${(data.tvl/1000000).toFixed(2)}M, APR ${data.apr.toFixed(2)}%`
                  ).join('\n')}`
                  : `I was unable to retrieve real-time blockchain data for Joule Finance.
                  Error: ${marketData.error || "Unknown connection issue"}
                  
                  Please write a post about Joule Finance that explains we are currently 
                  unable to access real-time metrics, but focus on the protocol's features 
                  without quoting specific numbers.`
                }
                
                IMPORTANT INSTRUCTIONS:
                1. ${marketData.dataSource === "blockchain" 
                    ? "Your post MUST include specific numbers from the data above and clearly state they are real-time blockchain metrics"
                    : "Explain that real-time metrics could not be retrieved from the blockchain. DO NOT make up or invent any metrics."
                  }
                2. Keep it professional, concise and engaging (max 280 characters)
                3. Format as a ready-to-post tweet
                
                Now write an informative ${marketData.dataSource === "blockchain" ? "data-driven" : "general"} tweet about Joule Finance:`
              }
            ]
          });
          
          // 4. Create visualization with proper error handling
          let chartUrl = "";
          try {
            // Use type assertion to access methods
            const tool = xPostTool as any;
            
            // Try different ways to access the visualization tool
            if (typeof tool.createChart === 'function') {
              chartUrl = await tool.createChart(marketData, "Joule Finance Performance", "line");
            }
            
            if (tool.visualize && typeof tool.visualize === 'function') {
              chartUrl = await tool.visualize(marketData);
            }
          } catch (err) {
            console.error("Error generating chart:", err);
          }
          
          // 5. Posting stage - safely extract content
          const writerContent = getMessageContent(writerResult);
          const tweetText = writerContent.substring(0, 280); // Truncate to Twitter limit
          
          // Log the post
          console.log("\n=== GENERATED POST ===");
          console.log(tweetText);
          if (chartUrl) {
            console.log("With image:", chartUrl);
          }
          console.log("======================\n");
          
          return {
            poster_output: tweetText,
            chart_url: chartUrl,
            full_content: writerContent
          };
        } catch (error) {
          console.error('Direct Anthropic API error:', error);
          throw error;
        }
      }
    };
  } catch (error) {
    console.error('Error building workflow:', error);
    throw error;
  }
};

// Helper function to extract input
function extractInput(stateObject: any): string {
  if (typeof stateObject === 'string') return stateObject;
  
  if (stateObject.messages && stateObject.messages.length > 0) {
    const message = stateObject.messages[0];
    if (message.kwargs && message.kwargs.content) return message.kwargs.content;
    if (message.content) return message.content;
  }
  
  return "";
}

// Helper function to safely get message content
function getMessageContent(result: any): string {
  if (!result || !result.content) return "";
  
  // Handle different response formats
  try {
    if (result.content[0]) {
      // Try different properties that might contain the text
      return result.content[0].text || 
             result.content[0].value || 
             (typeof result.content[0] === 'string' ? result.content[0] : JSON.stringify(result.content[0]));
    }
    
    // If content is a string
    if (typeof result.content === 'string') return result.content;
    
    // Fallback: stringify the whole content
    return JSON.stringify(result.content);
  } catch (e) {
    console.error("Error extracting content:", e);
    return "";
  }
}

// Helper function to create chart
async function createChartFromMarketData(xPostTool: XProfessionalPostTool, marketData: any): Promise<string> {
  try {
    // Use type assertion to access methods
    const tool = xPostTool as any;
    
    // Try different ways to access the visualization tool
    if (typeof tool.createChart === 'function') {
      return await tool.createChart(marketData, "Joule Finance Performance", "line");
    }
    
    if (tool.visualize && typeof tool.visualize === 'function') {
      return await tool.visualize(marketData);
    }
    
    // Last resort - if there's a public method to create charts
    return "";
  } catch (e) {
    console.error("Chart creation error:", e);
    return "";
  }
}

export default buildPosterWorkflow; 