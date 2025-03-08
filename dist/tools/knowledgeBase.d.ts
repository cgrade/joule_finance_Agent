/**
 * Knowledge base for Joule Finance information
 */
export declare class JouleKnowledgeBase {
    private knowledge;
    private knowledgePath;
    constructor(knowledgePath?: string);
    /**
     * Loads knowledge from text files in the knowledge directory
     */
    private loadKnowledge;
    /**
     * Breaks text into manageable chunks for embedding
     * @param text Text to chunk
     * @param maxChunkSize Maximum size of each chunk
     * @returns Array of text chunks
     */
    private chunkText;
    /**
     * Retrieves relevant knowledge based on a query
     * @param query Search query
     * @param maxResults Maximum number of results to return
     * @returns Relevant knowledge chunks
     */
    getRelevantKnowledge(query: string, maxResults?: number): string[];
}
export default JouleKnowledgeBase;
