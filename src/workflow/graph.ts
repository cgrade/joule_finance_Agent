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
          let marketData = { tvl: 0, apr: 0 };
          try {
            // Use type assertion to tell TypeScript this method exists
            const tool = jouleFinanceTool as any;
            marketData = await tool.getData() || marketData;
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
                content: `Write content for a social media post about: ${input}
                Based on this data: ${readerContent}
                Include metrics, comparisons, and highlight Joule Finance's advantages.
                Keep it professional, concise and engaging.`
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