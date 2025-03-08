"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JouleKnowledgeBase = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const text_splitter_1 = require("langchain/text_splitter");
const openai_1 = require("@langchain/openai");
const chroma_1 = require("@langchain/community/vectorstores/chroma");
/**
 * Knowledge base for Joule Finance content
 */
class JouleKnowledgeBase {
    constructor() {
        this.vectorStore = null;
        this.knowledgePath = path_1.default.join(process.cwd(), 'knowledge');
        // Create knowledge directory if it doesn't exist
        if (!fs_1.default.existsSync(this.knowledgePath)) {
            fs_1.default.mkdirSync(this.knowledgePath, { recursive: true });
        }
    }
    /**
     * Initialize the knowledge base by loading and indexing all documents
     */
    async initialize() {
        try {
            console.log('Initializing Joule Finance knowledge base...');
            // Get all files in the knowledge directory
            const files = fs_1.default.readdirSync(this.knowledgePath);
            // Load all documents
            const documents = [];
            for (const file of files) {
                const filePath = path_1.default.join(this.knowledgePath, file);
                const fileExt = path_1.default.extname(file).toLowerCase();
                try {
                    if (fileExt === '.txt') {
                        // Use direct file loading instead of TextLoader
                        const fileDocuments = await this.loadTextFile(filePath);
                        documents.push(...fileDocuments);
                        console.log(`Loaded document from ${file}`);
                    }
                    else {
                        console.log(`Skipping non-text file: ${file}`);
                    }
                }
                catch (error) {
                    console.error(`Error loading file ${file}:`, error);
                }
            }
            // Split documents into chunks
            const textSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200
            });
            const splitDocs = await textSplitter.splitDocuments(documents);
            // Create embeddings and vector store
            const embeddings = new openai_1.OpenAIEmbeddings();
            this.vectorStore = await chroma_1.Chroma.fromDocuments(splitDocs, embeddings, { collectionName: "joule_finance_kb" });
            console.log(`Knowledge base initialized with ${splitDocs.length} chunks from ${documents.length} documents`);
        }
        catch (error) {
            console.error('Error initializing knowledge base:', error);
            throw error;
        }
    }
    /**
     * Search the knowledge base for relevant information
     */
    async search(query, topK = 5) {
        if (!this.vectorStore) {
            await this.initialize();
        }
        try {
            const results = await this.vectorStore.similaritySearch(query, topK);
            // Format results into a single string
            const formattedResults = results.map((doc, i) => `DOCUMENT ${i + 1}:\n${doc.pageContent}\n`).join('\n');
            return formattedResults;
        }
        catch (error) {
            console.error('Error searching knowledge base:', error);
            return '';
        }
    }
    // Add a function to create document objects directly
    async loadTextFile(filePath) {
        try {
            const content = fs_1.default.readFileSync(filePath, 'utf8');
            return [{
                    pageContent: content,
                    metadata: { source: filePath }
                }];
        }
        catch (error) {
            console.error(`Error loading text file ${filePath}:`, error);
            return [];
        }
    }
}
exports.JouleKnowledgeBase = JouleKnowledgeBase;
//# sourceMappingURL=knowledge-base.js.map