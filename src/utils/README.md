# Utils Module

This folder contains utility functions and helpers used throughout the application.

## Key Utilities

- **llm.ts**: LLM initialization and configuration
- **logger.ts**: Structured logging utilities
- **aptos-client.ts**: Low-level Aptos blockchain client
- **signer.ts**: Cryptographic signing utilities

## LLM Utilities

The LLM utilities provide:

- Consistent configuration of Claude models
- Error handling for API calls
- Temperature and model selection

## Logging Utilities

The logger provides consistent formatting with:

- Log levels (info, warn, error, debug)
- Conditional debug logging
- Structured output format

## Aptos Client

A wrapper around Aptos API calls:

- View function calling
- Resource fetching
- Error handling

## Usage

```typescript
import { getLLM } from "./utils/llm";
import { logger } from "./utils/logger";
import { AptosClient } from "./utils/aptos-client";

// Get configured LLM
const llm = getLLM();

// Log with different levels
logger.info("Processing started");
logger.debug("Detailed information", { someValue: 123 });

// Use Aptos client
const aptosClient = new AptosClient();
const resources = await aptosClient.getResources(address);
```

## Design Philosophy

Utilities are designed to be:

- Single-purpose
- Stateless when possible
- Well-documented
- Reusable across the codebase
