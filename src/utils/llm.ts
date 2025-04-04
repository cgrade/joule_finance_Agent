import { ChatAnthropic } from "@langchain/anthropic";
import config from "../config.js";

/**
 * Get configured LLM instance for the agent
 */
export const getLLM = (): ChatAnthropic => {
  try {
    return new ChatAnthropic({
      temperature: config.llm.temperature,
      model: config.llm.model,
      apiKey: config.llm.apiKey,
    });
  } catch (error) {
    console.error('Failed to initialize LLM:', error);
    throw new Error(`LLM initialization failed: ${(error as Error).message}`);
  }
};

export default getLLM; 