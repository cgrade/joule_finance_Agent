# Agents Module

This folder contains the specialized agents that form the agent workflow system.

## Agent Types

- **readerAgent**: Fetches and processes Joule Finance data
- **writerAgent**: Generates professional content based on the data
- **postingAgent**: Handles the Twitter posting mechanics
- **managerAgent**: Coordinates the overall workflow

## Architecture

The agents follow a sequential workflow:

1. Manager determines what to do
2. Reader fetches relevant data
3. Writer creates content
4. Poster distributes the content

## Usage

```typescript
import {
  createReaderAgent,
  createWriterAgent,
  createPostingAgent,
} from "./agents";

// Initialize agents
const readerAgent = createReaderAgent(dataTools);
const writerAgent = createWriterAgent(knowledgeBase);
const postingAgent = createPostingAgent(twitterTool);

// Use in workflow
// See workflow/graph.ts for integration
```

## State Management

Each agent is designed to:

- Receive a state object
- Process that state
- Return a modified state
- Handle its own errors gracefully

## Agent Creation Pattern

All agents follow a factory pattern using creator functions that return async state handlers.
