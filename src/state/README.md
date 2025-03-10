# State Module

This folder manages state for the agent workflow system.

## Components

- **types.ts**: Defines the state interfaces
- **utils.ts**: Helper functions for state manipulation
- **annotation.ts**: Type annotations and schemas

## State Structure

The main state object `PosterState` includes:

- Messages: The conversation history
- LastPostTime: When the last post was made
- Metrics: Performance and usage statistics

## Usage

```typescript
import { PosterState } from "./state/types";
import { pruneMessages, logStateSize } from "./state/utils";

// Prune messages to prevent state bloat
const reducedMessages = pruneMessages(state.messages, 20);

// Log state size for debugging
logStateSize(state, "before_processing");
```

## State Management Patterns

The module implements several patterns:

- Immutable state updates
- Pruning to prevent state bloat
- Structured message handling
- Serialization/deserialization helpers

## Integration

This state system is designed to work with LangGraph for agent orchestration, providing a consistent way to track conversation and action history across multiple agent steps.
