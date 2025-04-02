/**
 * Joule Finance X/Twitter Professional Posting Agent
 *
 * This module creates an AI-powered agent that automatically generates
 * professional, data-driven posts about Joule Finance on Aptos blockchain.
 *
 * Built for the Aptos/Move hackathon using Move Agent Kit.
 */
import { HumanMessage } from "@langchain/core/messages";
import { AgentRuntime } from "./agent/runtime.js";
import { LocalSigner } from "./utils/signer.js";
import config from "./config.js";
import { buildPosterWorkflow } from "./workflow/index.js";
import { JouleFinanceDataTool, ChartVisualizationTool, XProfessionalPostTool, JouleKnowledgeBase } from "./tools/index.js";
/**
 * Initialize the Joule Finance poster system
 */
export const createBullishPostSystem = async () => {
    try {
        console.log('Initializing Joule Finance bullish post system...');
        // Initialize agent runtime
        const agentRuntime = await initializeAgentRuntime();
        // Initialize Joule Finance tools
        const jouleFinanceTool = new JouleFinanceDataTool(agentRuntime);
        const visualizationTool = new ChartVisualizationTool();
        // Use the XProfessionalPostTool from the tools module instead of defining it here
        const xPostTool = new XProfessionalPostTool(visualizationTool);
        const knowledgeBase = new JouleKnowledgeBase();
        // Build the workflow
        const app = buildPosterWorkflow(jouleFinanceTool, xPostTool, knowledgeBase);
        // Return a function that uses the app directly
        return async (userInput) => {
            const startTime = Date.now();
            try {
                console.log(`Processing request: ${userInput}`);
                // Initialize with a properly named HumanMessage
                const initialMessage = new HumanMessage({
                    content: userInput,
                    name: "user_input"
                });
                // Directly invoke the app with our state
                const result = await app.invoke({
                    messages: [initialMessage],
                    lastPostTime: new Date(),
                    metrics: {}
                });
                console.log(`Request completed in ${(Date.now() - startTime) / 1000}s`);
                return result;
            }
            catch (error) {
                console.error(`Error running the bullish post system (${(Date.now() - startTime) / 1000}s):`, error);
                throw error;
            }
        };
    }
    catch (error) {
        console.error('Error creating the bullish post system:', error);
        throw error;
    }
};
/**
 * Initialize Move Agent Kit runtime
 */
const initializeAgentRuntime = async () => {
    try {
        // Create local signer
        const signer = new LocalSigner(config.aptos.privateKey, config.aptos.network, config.aptos.nodeUrl);
        // Create agent runtime
        const agent = new AgentRuntime(signer, {
            ANTHROPIC_API_KEY: config.llm.apiKey,
        });
        return agent;
    }
    catch (error) {
        console.error('Failed to initialize agent runtime:', error);
        throw new Error(`Agent runtime initialization failed: ${error.message}`);
    }
};
/**
 * Script for running the system as a standalone process
 */
export const runAsBullishPoster = async (userInput) => {
    try {
        // Use provided input or default
        const input = userInput || "Create a professional bull post about Joule Finance's performance this week";
        // Create and run the system
        const createBullishPost = await createBullishPostSystem();
        const result = await createBullishPost(input);
        // Print the result
        console.log('\nFINAL RESULT:');
        console.log(JSON.stringify(result.poster_output?.slice(-3), null, 2));
        // Extract the posted tweet from the result
        const postingResult = result.poster_output?.find((msg) => msg.name === 'posting_agent');
        if (postingResult) {
            const postData = JSON.parse(postingResult.content);
            console.log('\nTWEET POSTED:');
            if (postData.success) {
                console.log(`Tweet ID: ${postData.tweet_id}`);
                console.log(`Content: ${postData.text}`);
                console.log(`Development Mode: ${postData.development_mode ? 'Yes' : 'No'}`);
            }
            else {
                console.log(`Posting failed: ${postData.error}`);
            }
        }
    }
    catch (error) {
        console.error('Error running the application:', error);
    }
};
// Export default for module imports
export default { createBullishPostSystem, runAsBullishPoster };
