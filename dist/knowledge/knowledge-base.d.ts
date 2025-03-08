/**
 * Knowledge base for Joule Finance content
 */
export declare class JouleKnowledgeBase {
    private vectorStore;
    private knowledgePath;
    constructor();
    /**
     * Initialize the knowledge base by loading and indexing all documents
     */
    initialize(): Promise<void>;
    /**
     * Search the knowledge base for relevant information
     */
    search(query: string, topK?: number): Promise<string>;
    private loadTextFile;
}
