# Knowledge Module

This folder manages the knowledge base for the Joule Finance agent.

## Components

- **knowledge-base.ts**: Implements retrieval and management of knowledge
  - Loads knowledge from text files
  - Chunks text for better retrieval
  - Retrieves relevant knowledge for queries

## Knowledge Organization

Knowledge is stored as text files in the `/knowledge` directory at the project root.
These files contain information about:

- Joule Finance protocol details
- Common questions and answers
- Technical explanations

## Usage

```typescript
import { JouleKnowledgeBase } from "./knowledge/knowledge-base";

// Initialize knowledge base
const knowledgeBase = new JouleKnowledgeBase("./knowledge");

// Retrieve relevant information
const relevantInfo = knowledgeBase.getRelevantKnowledge(
  "What are Joule Finance APRs?",
  3 // number of results
);
```

## Knowledge Chunking

The system splits knowledge into manageable chunks for better retrieval:

- Paragraph-based chunking
- Size-limited chunks
- Overlap for context preservation

## Future Enhancements

In a production system, this would be extended with:

- Vector embeddings for semantic search
- Regular updates from official documentation
- Relevance scoring using cosine similarity
