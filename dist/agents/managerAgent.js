"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createManagerAgent = void 0;
const schema_1 = require("langchain/schema");
const utils_1 = require("../state/utils");
const llm_1 = require("../utils/llm");
/**
 * Creates a manager agent that coordinates the workflow
 */
const createManagerAgent = () => {
    return async (state) => {
        // First prune messages to prevent accumulation
        const latestMessages = (0, utils_1.pruneMessages)(state.messages || [], 20);
        try {
            const llm = (0, llm_1.getLLM)();
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
            const response = await llm.invoke([new schema_1.HumanMessage(managerPrompt)]);
            const updatedMessages = [...latestMessages, new schema_1.AIMessage({
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
                messages: [...state.messages || [], new schema_1.FunctionMessage({
                        content: JSON.stringify({ error: error.message }),
                        name: "manager_agent_error"
                    })],
                lastPostTime: state.lastPostTime,
                metrics: state.metrics
            };
        }
    };
};
exports.createManagerAgent = createManagerAgent;
exports.default = exports.createManagerAgent;
//# sourceMappingURL=managerAgent.js.map