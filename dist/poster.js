"use strict";
/**
 * Joule Finance X/Twitter Professional Posting Agent
 *
 * This module creates an AI-powered agent that automatically generates
 * professional, data-driven posts about Joule Finance on Aptos blockchain.
 *
 * Built for the Aptos/Move hackathon using Move Agent Kit.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAsBullishPoster = exports.createBullishPostSystem = void 0;
const messages_1 = require("@langchain/core/messages");
const runtime_1 = require("./agent/runtime");
const signer_1 = require("./utils/signer");
const config_1 = __importDefault(require("./config"));
const workflow_1 = require("./workflow");
const tools_1 = require("./tools");
/**
 * Initialize the Joule Finance poster system
 */
const createBullishPostSystem = async () => {
    try {
        console.log('Initializing Joule Finance bullish post system...');
        // Initialize agent runtime
        const agentRuntime = await initializeAgentRuntime();
        // Initialize Joule Finance tools
        const jouleFinanceTool = new tools_1.JouleFinanceDataTool(agentRuntime);
        const visualizationTool = new tools_1.ChartVisualizationTool();
        // Use the XProfessionalPostTool from the tools module instead of defining it here
        const xPostTool = new tools_1.XProfessionalPostTool(visualizationTool);
        const knowledgeBase = new tools_1.JouleKnowledgeBase();
        // Build the workflow
        const app = (0, workflow_1.buildPosterWorkflow)(jouleFinanceTool, xPostTool, knowledgeBase);
        // Return a function that uses the app directly
        return async (userInput) => {
            const startTime = Date.now();
            try {
                console.log(`Processing request: ${userInput}`);
                // Initialize with a properly named HumanMessage
                const initialMessage = new messages_1.HumanMessage({
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
exports.createBullishPostSystem = createBullishPostSystem;
/**
 * Initialize Move Agent Kit runtime
 */
const initializeAgentRuntime = async () => {
    try {
        // Create local signer
        const signer = new signer_1.LocalSigner(config_1.default.aptos.privateKey, config_1.default.aptos.network, config_1.default.aptos.nodeUrl);
        // Create agent runtime
        const agent = new runtime_1.AgentRuntime(signer, {
            ANTHROPIC_API_KEY: config_1.default.llm.apiKey,
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
const runAsBullishPoster = async (userInput) => {
    try {
        // Use provided input or default
        const input = userInput || "Create a professional bull post about Joule Finance's performance this week";
        // Create and run the system
        const createBullishPost = await (0, exports.createBullishPostSystem)();
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
exports.runAsBullishPoster = runAsBullishPoster;
// Export default for module imports
exports.default = { createBullishPostSystem: exports.createBullishPostSystem, runAsBullishPoster: exports.runAsBullishPoster };
//# sourceMappingURL=poster.js.map