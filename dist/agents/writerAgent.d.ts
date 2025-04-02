import { PosterState } from "../state/types.js";
import { JouleKnowledgeBase } from "../tools/knowledgeBase.js";
/**
 * Creates a content writer agent that generates professional posts about Joule Finance
 */
export declare const createWriterAgent: (knowledgeBase?: JouleKnowledgeBase) => (state: PosterState) => Promise<Partial<PosterState>>;
export default createWriterAgent;
