import { HumanMessage, FunctionMessage } from "@langchain/core/messages";
import { PosterState } from "../state/types.js";
import { pruneMessages, logStateSize } from "../state/utils.js";
import { getLLM } from "../utils/llm.js";
import { JouleKnowledgeBase } from "../tools/knowledgeBase.js";

/**
 * Creates a content writer agent that generates professional posts about Joule Finance
 */
export const createWriterAgent = (knowledgeBase?: JouleKnowledgeBase) => {
  return async (state: PosterState): Promise<Partial<PosterState>> => {
    // Move this declaration before the try/catch
    const messages = pruneMessages(state.messages || [], 20);
    
    // Log state size for debugging
    logStateSize({ messages, lastPostTime: state.lastPostTime, metrics: state.metrics }, 'writer_agent:start');
    
    try {
      const llm = getLLM();
      
      // Get the most recent reader agent response
      const readerMessage = messages.findLast(msg => msg.name === 'reader_agent');
      if (!readerMessage) {
        throw new Error('No reader agent message found in state');
      }
      
      // Parse the JSON data from the reader agent
      const jouleData = JSON.parse(readerMessage.content as string);
      
      // Create a prompt that includes data from the reader agent
      const writerPrompt = `You are a professional crypto content writer specializing in DeFi analytics.
      Your goal is to create a concise, data-driven tweet (max 280 characters) about Joule Finance on Aptos.

      Here is the latest data about Joule Finance:
      ${JSON.stringify(jouleData, null, 2)}

      Guidelines:
      - Focus on the most impressive metrics that show growth, adoption, or stability
      - Use precise numbers and growth percentages when available
      - Include comparative context when relevant (e.g., "outperforming peers by X%")
      - Tone should be professional, factual, and optimistic
      - No hashtags or @mentions
      - Stay under 280 characters
      - Don't use emojis

      Format your response as a simple text tweet without any additional explanation.`;
      
      // Generate the content using the LLM
      const response = await llm.invoke([new HumanMessage(writerPrompt)]);
      const generatedContent = response.content as string;
      
      console.log('Generated tweet content:', generatedContent);
      
      // Create a writer message with name property
      console.log('Creating writer message with name property...');
      const writerMessage = new FunctionMessage({
        content: generatedContent,
        name: "writer_agent"
      });
      console.log('Writer message created:', JSON.stringify(writerMessage));
      
      const updatedMessages = [...messages, writerMessage];
      
      // Returns only the updated messages property
      return {
        messages: updatedMessages,
        // Preserve other state properties
        lastPostTime: state.lastPostTime,
        metrics: state.metrics
      };
    } catch (error) {
      console.error('Error in writer agent:', error);
      // Proper error handling
      return {
        messages: [...messages, new FunctionMessage({
          content: JSON.stringify({ error: (error as Error).message }),
          name: "writer_agent_error"
        })],
        lastPostTime: state.lastPostTime,
        metrics: state.metrics
      };
    }
  };
};

export default createWriterAgent; 