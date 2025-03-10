# Workflow Module

This folder manages the agent workflow orchestration using LangGraph.

## Components

- **graph.ts**: Defines the workflow graph structure
- **index.ts**: Exports the workflow builder

## Workflow Design

The workflow is structured as a directed graph:

1. Manager agent determines the action to take
2. Reader agent fetches relevant data
3. Writer agent generates content
4. Posting agent distributes content

## Usage

```typescript
import { buildPosterWorkflow } from "./workflow";
import {
  createReaderAgent,
  createWriterAgent,
  createPostingAgent,
} from "./agents";

// Create agents
const readerAgent = createReaderAgent(dataTools);
const writerAgent = createWriterAgent(knowledgeBase);
const postingAgent = createPostingAgent(twitterTool);

// Build workflow
const workflow = buildPosterWorkflow({
  readerAgent,
  writerAgent,
  postingAgent,
});

// Run workflow
const result = await workflow.invoke({
  messages: [new HumanMessage("Post about Joule Finance TVL")],
});
```

## Graph Structure

The workflow uses a conditional graph structure:

- Nodes represent agent actions
- Edges represent state transitions
- Conditions determine which path to take
- State is passed between nodes

## Extending the Workflow

To add new capabilities:

1. Create a new agent
2. Add it as a node in the graph
3. Connect it with appropriate edges
4. Define transition conditions
