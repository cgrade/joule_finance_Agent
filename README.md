# Joule Finance Twitter Agent

## Overview

The Joule Finance Twitter Agent is an AI-powered posting system that automatically generates and shares professional content about Joule Finance on X/Twitter. It leverages blockchain data, knowledge bases, and language models to create informative, engaging posts about DeFi metrics, lending rates, and protocol performance.

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

## Installation

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

## Configuration

Configure the following in your `.env` file:
