# Tools Module

This folder contains tools that provide capabilities to the agent system.

## Key Tools

- **jouleFinanceDataTool.ts**: Fetches data from Joule Finance protocol
- **socialMedia.ts**: Handles posting to social platforms
- **visualization.ts**: Creates data visualizations
- **twitter.ts**: Tools for Twitter interactions
- **knowledgeBase.ts**: Retrieves information from knowledge base
- **blockchain-data.ts**: Raw blockchain data access
- **chartVisualizationTool.ts**: Creates charts from data

## Tool Design Pattern

Tools follow the LangChain structured tool pattern:

- Define a schema for inputs and outputs
- Implement the `_call` method for execution
- Provide descriptions for LLM understanding

## Usage

```typescript
import { JouleFinanceDataTool } from "./tools/jouleFinanceDataTool";
import { XProfessionalPostTool } from "./tools/socialMedia";

// Create tools
const dataTool = new JouleFinanceDataTool();
const posterTool = new XProfessionalPostTool(visualizationTool);

// Use tools
const marketData = await dataTool.getData();
const result = await posterTool.postTweet("Market update...");
```

## Data Tools

The Joule Finance data tool:

- Fetches TVL, APRs, and user metrics
- Has fallback mechanisms for reliability
- Formats data consistently for consumption

## Social Media Tools

The Twitter posting tools:

- Support text and media posts
- Handle authentication and rate limits
- Provide development mode for testing
