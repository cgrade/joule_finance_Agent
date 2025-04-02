import { HumanMessage, AIMessage, FunctionMessage } from "@langchain/core/messages";
import { pruneMessages } from "../state/utils.js";
import { getLLM } from "../utils/llm.js";
/**
 * Creates a manager agent that coordinates the workflow
 */
export const createManagerAgent = () => {
    return async (state) => {
        // First prune messages to prevent accumulation
        const latestMessages = pruneMessages(state.messages || [], 20);
        try {
            const llm = getLLM();
            const managerPrompt = `You are the manager of a professional crypto analytics team focused on Joule Finance on Aptos.
      Joule Finance is a comprehensive DeFi protocol on Aptos offering:
      - Money Market with isolated lending positions
      - Leveraged Yield Farming opportunities
      - LayerZero cross-chain bridge for LRT tokens
      - Liquidity Anchors for other dApps
      
      A user has requested: "${latestMessages[latestMessages.length - 1].content}"
      
      Your job is to:
      1. Determine if this is a request to create bullish content about Joule Finance
      2. If yes, instruct the reader agent what kind of data would be most impressive to highlight
      3. If no, explain that your team specializes in creating professional posts about Joule Finance metrics
      
      Focus on helping create professional, fact-based content that highlights positive metrics and trends.
      Provide your response in a concise, professional manner.`;
            const response = await llm.invoke([new HumanMessage(managerPrompt)]);
            const updatedMessages = [...latestMessages, new AIMessage({
                    content: response.content,
                    name: "manager_agent"
                })];
            // Only return the update
            return {
                messages: updatedMessages,
                // Preserve other state properties
                lastPostTime: state.lastPostTime,
                metrics: state.metrics
            };
        }
        catch (error) {
            // Always name error messages too
            return {
                messages: [...state.messages || [], new FunctionMessage({
                        content: JSON.stringify({ error: error.message }),
                        name: "manager_agent_error"
                    })],
                lastPostTime: state.lastPostTime,
                metrics: state.metrics
            };
        }
    };
};
export default createManagerAgent;
