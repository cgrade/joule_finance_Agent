# Charts Module

This folder implements the visualization system using the Factory pattern.

## Key Components

- **types.ts**: Defines the `Chart` interface and `ChartType` enum
- **BaseChart.ts**: Abstract class with common chart functionality
- **ChartFactory.ts**: Factory class that creates appropriate chart instances
- **Concrete Charts**: Implementations for specific visualization types:
  - `AssetDistributionChart.ts`: Pie chart showing asset allocation
  - `AprsComparisonChart.ts`: Bar chart comparing APRs across assets
  - `TvlTrendChart.ts`: Line chart showing TVL over time
  - `RiskAdjustedReturnChart.ts`: Risk/reward scatter plot

## Factory Pattern Implementation

The system uses a classic Factory pattern:

1. Client code requests a chart by type
2. Factory instantiates the appropriate concrete chart
3. All charts share a common interface for consistent usage

## Usage

```typescript
import { ChartFactory, ChartType } from "./charts";

// Create a chart using the factory
const chart = ChartFactory.createChart(ChartType.AssetDistribution, marketData);

// Save the chart to a file
const filePath = await chart.save();

// Or get as base64 for embedding
const base64Data = await chart.getBase64();
```

## Adding New Chart Types

1. Create a new class extending BaseChart
2. Add a new entry to the ChartType enum
3. Register the new chart in ChartFactory.createChart()

## Rendering Details

All charts use the Canvas API for rendering, making them compatible with both Node.js and serverless environments.
