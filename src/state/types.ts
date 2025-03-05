import { BaseMessage } from "langchain/schema";

/**
 * Core state interface for the poster agent system
 */
export interface PosterState {
  messages: BaseMessage[];
  lastPostTime: Date;
  metrics: { 
    tvl?: number;
    apy?: number; 
    // Add more metrics as needed
  };
} 