# Types Module

This folder contains TypeScript type definitions used throughout the application.

## Key Type Definitions

- **Market Data Interfaces**: Structures for financial data
- **Blockchain Types**: Types for blockchain interactions
- **Agent Types**: Interfaces for the agent system
- **Response Types**: Standardized response structures

## Usage

```typescript
import { MarketData, AssetData } from "./types";

// Type-safe data handling
const data: MarketData = {
  tvl: 10000000,
  apr: 5.2,
  users: 5000,
  volume24h: 1500000,
  assets: {
    USDC: { tvl: 5000000, apr: 4.5 },
  },
  dataSource: "blockchain",
  lastUpdated: new Date().toISOString(),
};
```

## Design Patterns

The type system implements several patterns:

- Composition over inheritance
- Discriminated unions for state handling
- Readonly properties for immutability
- Optional properties for flexibility

## Extending Types

When adding new features:

1. Add new interfaces/types to the appropriate file
2. Export them from index.ts
3. Use consistent naming conventions
