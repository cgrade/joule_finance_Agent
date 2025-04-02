import { FunctionMessage } from "@langchain/core/messages";
import { pruneMessages, logStateSize } from "../state/utils.js";
/**
 * Creates a posting agent that posts content to social media
 */
export const createPostingAgent = (xPoster) => {
    return async (state) => {
        const messages = pruneMessages(state.messages || [], 20);
        logStateSize({ messages, lastPostTime: state.lastPostTime, metrics: state.metrics }, 'posting_agent:start');
        console.log(`Posting agent received ${messages.length} messages`);
        console.log(`Message types: ${messages.map(m => m.name || 'unnamed').join(', ')}`);
        try {
            // Find the most recent writer agent message using reverse() and find() instead of findLast
            const latestWriterMessage = [...messages].reverse().find(msg => msg.name === 'writer_agent');
            if (!latestWriterMessage) {
                throw new Error('No writer agent message found in state');
            }
            const content = latestWriterMessage.content;
            console.log(`Using latest content from messageStore: ${content}`);
            // Post the tweet using the X posting tool
            const result = await xPoster.postTweet(content);
            // Update lastPostTime if successful
            const newLastPostTime = result.success ? new Date() : state.lastPostTime;
            const updatedMessages = [...messages, new FunctionMessage({
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
                messages: [...messages, new FunctionMessage({
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
export default createPostingAgent;
