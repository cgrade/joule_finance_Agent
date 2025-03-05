import fs from 'fs';
import path from 'path';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";

/**
 * Knowledge base for Joule Finance content
 */
export class JouleKnowledgeBase {
  private vectorStore: Chroma | null = null;
  private knowledgePath: string;
  
  constructor() {
    this.knowledgePath = path.join(process.cwd(), 'knowledge');
    // Create knowledge directory if it doesn't exist
    if (!fs.existsSync(this.knowledgePath)) {
      fs.mkdirSync(this.knowledgePath, { recursive: true });
    }
  }
  
  /**
   * Initialize the knowledge base by loading and indexing all documents
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Joule Finance knowledge base...');
      
      // Get all files in the knowledge directory
      const files = fs.readdirSync(this.knowledgePath);
      
      // Load all documents
      const documents: Document[] = [];
      
      for (const file of files) {
        const filePath = path.join(this.knowledgePath, file);
        const fileExt = path.extname(file).toLowerCase();
        
        try {
          if (fileExt === '.txt') {
            // Use direct file loading instead of TextLoader
            const fileDocuments = await this.loadTextFile(filePath);
            documents.push(...fileDocuments);
            console.log(`Loaded document from ${file}`);
          } else {
            console.log(`Skipping non-text file: ${file}`);
          }
        } catch (error) {
          console.error(`Error loading file ${file}:`, error);
        }
      }
      
      // Split documents into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
      });
      const splitDocs = await textSplitter.splitDocuments(documents);
      
      // Create embeddings and vector store
      const embeddings = new OpenAIEmbeddings();
      this.vectorStore = await Chroma.fromDocuments(
        splitDocs, 
        embeddings,
        { collectionName: "joule_finance_kb" }
      );
      
      console.log(`Knowledge base initialized with ${splitDocs.length} chunks from ${documents.length} documents`);
    } catch (error) {
      console.error('Error initializing knowledge base:', error);
      throw error;
    }
  }
  
  /**
   * Search the knowledge base for relevant information
   */
  async search(query: string, topK: number = 5): Promise<string> {
    if (!this.vectorStore) {
      await this.initialize();
    }
    
    try {
      const results = await this.vectorStore!.similaritySearch(query, topK);
      
      // Format results into a single string
      const formattedResults = results.map((doc, i) => 
        `DOCUMENT ${i+1}:\n${doc.pageContent}\n`
      ).join('\n');
      
      return formattedResults;
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return '';
    }
  }

  // Add a function to create document objects directly
  private async loadTextFile(filePath: string): Promise<Document[]> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return [{
        pageContent: content,
        metadata: { source: filePath }
      }];
    } catch (error) {
      console.error(`Error loading text file ${filePath}:`, error);
      return [];
    }
  }
} 