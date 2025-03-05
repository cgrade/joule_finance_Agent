import * as fs from 'fs';
import * as path from 'path';

/**
 * Knowledge base for Joule Finance information
 */
export class JouleKnowledgeBase {
  private knowledge: string[];
  private knowledgePath: string;

  constructor(knowledgePath: string = './knowledge') {
    this.knowledgePath = knowledgePath;
    this.knowledge = [];
    this.loadKnowledge();
  }

  /**
   * Loads knowledge from text files in the knowledge directory
   */
  private loadKnowledge(): void {
    console.log('Initializing Joule Finance knowledge base...');
    
    try {
      if (!fs.existsSync(this.knowledgePath)) {
        console.log(`Knowledge directory not found: ${this.knowledgePath}. Creating...`);
        fs.mkdirSync(this.knowledgePath, { recursive: true });
      }
      
      // Read all .txt files in the knowledge directory
      const files = fs.readdirSync(this.knowledgePath)
        .filter(file => file.endsWith('.txt'));
      
      let totalChunks = 0;
      
      for (const file of files) {
        const filePath = path.join(this.knowledgePath, file);
        console.log(`Loaded document from ${file}`);
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const chunks = this.chunkText(content);
        
        this.knowledge.push(...chunks);
        totalChunks += chunks.length;
      }
      
      console.log(`Knowledge base initialized with ${totalChunks} chunks from ${files.length} documents`);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    }
  }

  /**
   * Breaks text into manageable chunks for embedding
   * @param text Text to chunk
   * @param maxChunkSize Maximum size of each chunk
   * @returns Array of text chunks
   */
  private chunkText(text: string, maxChunkSize: number = 1000): string[] {
    const chunks: string[] = [];
    
    // Basic chunking by paragraphs first
    const paragraphs = text.split(/\n\s*\n/);
    
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
      // If adding this paragraph would exceed max size, add current chunk to results
      if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      // Handle paragraphs longer than max chunk size
      if (paragraph.length > maxChunkSize) {
        // If there's content in the current chunk, add it first
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        
        // Break long paragraph into sentences
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        
        let sentenceChunk = '';
        for (const sentence of sentences) {
          if (sentenceChunk.length + sentence.length > maxChunkSize && sentenceChunk.length > 0) {
            chunks.push(sentenceChunk.trim());
            sentenceChunk = '';
          }
          sentenceChunk += sentence + ' ';
        }
        
        if (sentenceChunk.length > 0) {
          chunks.push(sentenceChunk.trim());
        }
      } else {
        currentChunk += paragraph + '\n\n';
      }
    }
    
    // Add any remaining content
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  /**
   * Retrieves relevant knowledge based on a query
   * @param query Search query
   * @param maxResults Maximum number of results to return
   * @returns Relevant knowledge chunks
   */
  getRelevantKnowledge(query: string, maxResults: number = 3): string[] {
    // In a real implementation, this would use embeddings and similarity search
    // For now, we'll use simple keyword matching
    
    if (this.knowledge.length === 0) {
      return ['No knowledge available about Joule Finance.'];
    }
    
    const keywords = query.toLowerCase().split(/\s+/);
    
    // Score each chunk based on keyword matches
    const scoredChunks = this.knowledge.map(chunk => {
      const lowerChunk = chunk.toLowerCase();
      const score = keywords.reduce((total, word) => {
        return total + (lowerChunk.includes(word) ? 1 : 0);
      }, 0);
      
      return { chunk, score };
    });
    
    // Sort by score and take top results
    return scoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(item => item.chunk);
  }
}

export default JouleKnowledgeBase; 