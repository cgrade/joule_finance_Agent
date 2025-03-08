"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostingAgent = void 0;
const schema_1 = require("langchain/schema");
const utils_1 = require("../state/utils");
/**
 * Creates a posting agent that posts content to social media
 */
const createPostingAgent = (xPoster) => {
    return async (state) => {
        const messages = (0, utils_1.pruneMessages)(state.messages || [], 20);
        (0, utils_1.logStateSize)({ messages, lastPostTime: state.lastPostTime, metrics: state.metrics }, 'posting_agent:start');
        console.log(`Posting agent received ${messages.length} messages`);
        console.log(`Message types: ${messages.map(m => m.name || 'unnamed').join(', ')}`);
        try {
            // Find the most recent writer agent message
            const latestWriterMessage = messages.findLast(msg => msg.name === 'writer_agent');
            if (!latestWriterMessage) {
                throw new Error('No writer agent message found in state');
            }
            const content = latestWriterMessage.content;
            console.log(`Using latest content from messageStore: ${content}`);
            // Post the tweet using the X posting tool
            const result = await xPoster.postTweet(content);
            // Update lastPostTime if successful
            const newLastPostTime = result.success ? new Date() : state.lastPostTime;
            const updatedMessages = [...messages, new schema_1.FunctionMessage({
                    content: JSON.stringify(result),
                    name: "posting_agent"
                })];
            return {
                messages: updatedMessages,
                lastPostTime: newLastPostTime,
                metrics: state.metrics
            };
        }
        catch (error) {
            console.error('Error in posting agent:', error);
            return {
                messages: [...messages, new schema_1.FunctionMessage({
                        content: JSON.stringify({
                            success: false,
                            error: error.message
                        }),
                        name: "posting_agent_error"
                    })],
                lastPostTime: state.lastPostTime,
                metrics: state.metrics
            };
        }
    };
};
exports.createPostingAgent = createPostingAgent;
exports.default = exports.createPostingAgent;
//# sourceMappingURL=postingAgent.js.map