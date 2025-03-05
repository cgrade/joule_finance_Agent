import { Annotation } from "langraph";
import { BaseMessage } from "langchain/schema";
import { PosterState } from "./types";

/**
 * LangGraph state annotation for the Poster agent system
 */
export const StateAnnotation = Annotation.Root({
  // Define messages with proper reducer function
  messages: Annotation({
    reducer: (current: BaseMessage[], addition: BaseMessage[]) => [...current, ...addition],
    default: () => [] as BaseMessage[]
  }),
  
  // Define lastPostTime with proper reducer function
  lastPostTime: Annotation({
    reducer: (_old: Date, current: Date) => current,
    default: () => new Date()
  }),
  
  // Define metrics with proper reducer function
  metrics: Annotation({
    reducer: (_old: { tvl?: number, apy?: number }, current: { tvl?: number, apy?: number }) => current,
    default: () => ({} as { tvl?: number, apy?: number })
  })
});

// Export default as well for direct imports
export default StateAnnotation; 