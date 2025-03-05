import { FunctionMessage } from "langchain/schema";
import { PosterState } from "../state/types";
import { pruneMessages, logStateSize } from "../state/utils";
import { XProfessionalPostTool } from "../tools/socialMedia";

/**
 * Creates a posting agent that posts content to social media
 */
export const createPostingAgent = (xPoster: XProfessionalPostTool) => {
  return async (state: PosterState): Promise<Partial<PosterState>> => {
    const messages = pruneMessages(state.messages || [], 20);
    
    logStateSize({ messages, lastPostTime: state.lastPostTime, metrics: state.metrics }, 'posting_agent:start');
    console.log(`Posting agent received ${messages.length} messages`);
    console.log(`Message types: ${messages.map(m => m.name || 'unnamed').join(', ')}`);
    
    try {
      // Find the most recent writer agent message
      const latestWriterMessage = messages.findLast(msg => msg.name === 'writer_agent');
      
      if (!latestWriterMessage) {
        throw new Error('No writer agent message found in state');
      }
      
      const content = latestWriterMessage.content as string;
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
    } catch (error) {
      console.error('Error in posting agent:', error);
      return {
        messages: [...messages, new FunctionMessage({
          content: JSON.stringify({ 
            success: false, 
            error: (error as Error).message 
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