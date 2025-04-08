# Joule Finance Assistant

The Joule Finance Assistant is an AI-powered platform designed to provide information and support for users of the Joule Finance DeFi protocol on the Aptos blockchain.

## Main Components

1. **Joule Finance Chat**: A web-based chat interface for real-time assistance
2. **Twitter Agent**: Automated social media presence
3. **Knowledge Base**: Structured information about Joule Finance
4. **API Backend**: Powers both interfaces with Anthropic Claude AI

This documentation will guide you through setting up, configuring, and maintaining the Joule Finance Assistant.

{% hint style="info" %}
Last updated: March 2025
{% endhint %}

## Overview

The Joule Finance Twitter Agent is an AI-powered posting system that automatically generates and shares professional content about Joule Finance on X/Twitter. It leverages blockchain data, knowledge bases, and language models to create informative, engaging posts about DeFi metrics, lending rates, and protocol performance.

## Technical Architecture

### Core Components

- **Data Layer**: Fetches and processes Joule Finance blockchain data

  - `JouleFinanceDataTool`: Primary data access through Aptos blockchain API
  - Fallback mechanisms for handling API failures
  - Caching system for performance optimization

- **Visualization Layer**: Generates data visualizations using a factory pattern

  - `ChartFactory`: Centralizes chart generation decisions
  - Concrete chart implementations (`AssetDistributionChart`, `AprsComparisonChart`, etc.)
  - Canvas-based rendering for serverless environments
  - Modular design for easy extension with new chart types

- **Content Generation**: Creates professional social media posts

  - Template-based generation with data interpolation
  - LLM-powered content refinement
  - Anti-repetition mechanisms to avoid content duplication
  - Post formatting optimized for Twitter's display constraints

- **Posting System**: Handles social media interactions

  - API-based posting to Twitter
  - Media attachment handling
  - Development/production mode toggle
  - Error handling and retry logic

- **Agent Orchestration**: Coordinates the workflow
  - LangGraph-based agent system
  - Reader, Writer, and Posting specialized agents
  - State management for tracking post history

### Data Flow

```
Blockchain → JouleFinanceDataTool → Market Data → ChartFactory → Visualizations
                                  ↓                            ↓
                          Content Templates → Post Generator → Twitter Client
```

## Chart Factory Implementation

The visualization system uses the Factory pattern to centralize chart creation:

1. **Chart Interface**: All charts implement the `Chart` interface with standard methods
2. **Factory Class**: `ChartFactory` creates appropriate chart instances based on requested type
3. **Base Chart**: Abstract `BaseChart` provides common functionality like saving/exporting
4. **Concrete Charts**: Specialized implementations for each visualization type

This design allows for:

- Easy addition of new chart types
- Consistent API across all chart types
- Separation of chart creation logic from rendering logic
- Better testability through dependency injection

## Development Guide

### Setting Up the Development Environment

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/joule-finance-poster.git
   cd joule-finance-poster
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your API keys and preferences
   ```

4. Build the project:
   ```bash
   npm run build
   ```

### Testing Components Individually

The repository includes several test scripts to verify each component:

- Test chart generation: `npm run test:chart`
- Test Twitter posting: `npm run test:tweet`
- Test tweet with chart: `npm run test:chart-post`

### Adding a New Chart Type

1. Create a new chart class that extends `BaseChart`:

   ```typescript
   // src/charts/MyNewChart.ts
   import { BaseChart } from "./BaseChart";
   import { MarketData } from "../tools/jouleFinanceDataTool";
   import { Canvas } from "canvas";

   export class MyNewChart extends BaseChart {
     constructor(data: MarketData) {
       super(data, "My New Chart Title");
     }

     async draw(): Promise<Canvas> {
       // Setup canvas
       this.setupCanvas();

       // Draw title
       this.drawTitle();

       // Custom rendering logic here

       // Draw footer
       this.drawFooter();

       return this.canvas;
     }
   }
   ```

2. Add the new chart type to `ChartType` enum in `src/charts/types.ts`

3. Register the chart in `ChartFactory.createChart()` method

4. Add any needed utility methods to the chart generator

### Data Flow Architecture

```
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│                 │        │                 │        │                 │
│  Data Sources   │───────▶│   Agent System  │───────▶│  Distribution   │
│                 │        │                 │        │                 │
└─────────────────┘        └─────────────────┘        └─────────────────┘
        │                         │                          │
        ▼                         ▼                          ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│  Blockchain     │        │  Reader Agent   │        │  Twitter API    │
│  Aptos RPC      │        │  Writer Agent   │        │  Media Upload   │
│  Price Oracles  │        │  Posting Agent  │        │  Tweet Posting  │
└─────────────────┘        └─────────────────┘        └─────────────────┘
```

## Configuration Options

Configure the following in your `.env` file:

- `NODE_ENV`: Set to `production` for live posting or `development` for testing
- `TWITTER_API_KEY`: Your Twitter API key
- `TWITTER_API_SECRET`: Your Twitter API secret
- `TWITTER_ACCESS_TOKEN`: Your Twitter access token
- `TWITTER_ACCESS_TOKEN_SECRET`: Your Twitter access token secret
- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude LLM
- `APTOS_NODE_URL`: Aptos blockchain RPC URL (defaults to mainnet)
- `POST_FREQUENCY`: How often to post (in minutes, default: 360)

## Advanced Customization

### Custom Templates

Modify `POST_TEMPLATES` in `src/agent/postGenerator.ts` to add your own post templates.

### Chart Customization

All charts can be customized by modifying their respective files in `src/charts/`. Common properties like colors, fonts, and dimensions are defined in each chart implementation.

### Data Source Extension

To add a new data source:

1. Implement the `BlockchainDataTool` interface
2. Add necessary API clients in `src/utils/`
3. Update the data fetching logic

## License

[MIT License](LICENSE)

## Features

- **AI-Powered Content Generation**: Uses Claude to create professional DeFi analysis
- **Real-time Blockchain Data**: Fetches TVL, APY rates, and other metrics from Aptos blockchain
- **Automatic Posting**: Scheduled or on-demand posting to X/Twitter
- **Data Visualization**: Generates charts and graphs for financial metrics
- **Reply Monitoring**: Responds to mentions and comments using a knowledge base
- **LangGraph Workflow**: Structured agent system with reader, writer, and posting components

## Technology Stack

- **TypeScript**: Core programming language
- **LangGraph**: For agent orchestration and state management
- **LangChain**: For LLM integration and tools
- **Claude (Anthropic)**: For generating professional content
- **Twitter API v2**: For posting to Twitter
- **Aptos SDK**: For blockchain data access
- **Canvas**: For visualization generation

## Configuration

Configure the following in your `.env` file:
