# Agent Module

This folder contains the core agent implementation for the Joule Finance Twitter Agent.

## Files

- **postGenerator.ts**: Generates formatted Twitter posts using market data
  - Uses templates for reliable content creation
  - Formats posts with bullet points and better visual structure
  - Includes anti-repetition mechanisms

## Usage

```typescript
import { generatePostWithData } from "./agent/postGenerator";

// Generate a post using market data
const post = await generatePostWithData(
  openaiClient,
  "Create a post about lending rates",
  marketData
);
```

## Key Functions

- `generatePostWithData`: Main function that creates a formatted Twitter post
- `formatPostForTwitter`: Organizes content with bullet points for readability
- `extractMetrics`: Parses important metrics from post content

## Integration Points

This module connects with:

- Tools for data access
- Twitter posting client
- Chart generation system
