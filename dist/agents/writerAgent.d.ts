import { PosterState } from "../state/types";
import { JouleKnowledgeBase } from "../tools/knowledgeBase";
/**
 * Creates a content writer agent that generates professional posts about Joule Finance
 */
export declare const createWriterAgent: (knowledgeBase?: JouleKnowledgeBase) => (state: PosterState) => Promise<Partial<PosterState>>;
export default createWriterAgent;
