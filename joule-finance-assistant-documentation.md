# Joule Finance Assistant

{% hint style="info" %}
This documentation covers the AI assistant system for the Joule Finance protocol, including the chat interface and Twitter agent.
{% endhint %}

## Project Overview

The Joule Finance Assistant is an AI-powered platform designed to provide information and support for users of the Joule Finance DeFi protocol on the Aptos blockchain. The platform consists of two main user interfaces:

1. **Joule Finance Chat**: A web-based chat interface where users can ask questions about Joule Finance products, market data, protocol information, and receive real-time assistance.

2. **Twitter Agent**: An automated Twitter bot that responds to user queries, posts market updates, and engages with the Joule Finance community on social media.

Both interfaces are powered by a common backend API that integrates with Claude AI models from Anthropic to deliver accurate, helpful responses based on a structured knowledge base about Joule Finance.

## System Architecture

The system follows a modern microservices architecture with the following layers:

### Frontend Layer

- React-based web chat interface
- Twitter API integration for the Twitter agent

### API Layer

- Express.js server
- RESTful API endpoints
- WebSocket connections for real-time chat

### AI Processing Layer

- Anthropic Claude integration
- Knowledge base processing
- Context management

### Data Layer

- PostgreSQL database for conversation history
- JSON-based knowledge repositories
- Real-time market data integration

{% hint style="success" %}
This architecture enables both real-time chat and Twitter interactions to use the same knowledge base and AI capabilities.
{% endhint %}

## Components

### Joule Finance API

The core backend service powering both the chat interface and Twitter agent. Built with Node.js and Express, it handles:

- AI model integration with Anthropic Claude
- Knowledge base management
- Conversation history and session tracking
- Market data retrieval and processing

**Key Files:**

- `joule-api-server.js`: Main server implementation
- `services/jouleFinanceData.js`: Market data service
- `services/knowledgeBase.js`: Knowledge management
- `services/conversationService.js`: Conversation tracking

### Joule Finance Chat Client

A responsive web application that provides a chat interface for users to interact with the Joule Finance assistant.

**Features:**

- Real-time conversation with AI assistant
- Conversation history
- Markdown support for formatted responses
- Mobile-responsive design

### Twitter Agent

An automated Twitter presence that:

- Responds to @mentions and DMs
- Posts scheduled updates about market conditions
- Engages with community questions
- Provides support through Twitter's platform

## Knowledge Base

The assistant's intelligence comes from a structured knowledge base organized into several categories:

### Market Data

Stored in `market-data.json`, contains:

- Current TVL, market size, and borrowing statistics
- Asset-specific metrics including supply/borrow amounts and APYs
- Collateral factors and risk parameters

```json
{
  "overview": {
    "marketSize": 20319686.38,
    "totalBorrowed": 11721373.35,
    "tvl": 8598313.03
  },
  "markets": [
    {
      "symbol": "USDC",
      "name": "Circle USDC",
      "collateralFactor": 0.8,
      "supplied": 5420000,
      "suppliedUSD": 5420000,
      "borrowed": 4660000,
      "borrowedUSD": 4660000,
      "supplyAPY": 8.74,
      "borrowAPY": 6.02,
      "boosted": true
    }
    // Additional assets...
  ]
}
```

### Protocol Information

Stored in `protocol.json`, contains:

- Comprehensive protocol description
- Features and unique selling points
- Technical architecture
- Risk management parameters
- Governance structure

### Tokens Information

Stored in `tokens.json`, contains:

- Supported tokens and their specifications
- Token utilities and use cases
- Integration details

### Products Information

Stored in `products.json`, contains:

- Detailed information about Joule Finance products
- Feature specifications
- User guides

## Setup & Installation

### Prerequisites

- Node.js v14+ and npm
- PostgreSQL database
- Anthropic API key
- Twitter Developer credentials (for Twitter agent)

### Environment Setup

Create a `.env` file with the following variables:

```
# API Keys
ANTHROPIC_API_KEY=sk-ant-...

# Database Configuration
DATABASE_URL=postgres://...

# Server Configuration
PORT=3000
NODE_ENV=production

# Twitter API (for Twitter agent)
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...
```

### Installation Steps

1. Clone the repository:

```bash
git clone https://github.com/joule-finance/joule-assistant.git
cd joule-assistant
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npx sequelize-cli db:migrate
```

4. Start the server:

```bash
npm start
```

## API Reference

### Chat Endpoints

#### POST /api/chat

Processes a user message and returns an AI response.

**Request Body:**

```json
{
  "message": "What is Joule Finance?",
  "sessionId": "user-session-uuid"
}
```

**Response:**

```json
{
  "response": "Joule Finance is a DeFi protocol built on the Aptos blockchain...",
  "conversationId": "conversation-uuid"
}
```

#### GET /api/conversations/:sessionId

Retrieves conversation history for a user.

### Admin Endpoints

#### GET /api/admin/stats

Returns usage statistics and system status.

#### POST /api/admin/refresh-knowledge

Refreshes the knowledge base from source files.

## Configuration

### AI Model Configuration

The API supports different Claude models that can be configured in `joule-api-server.js`:

```javascript
const messagesApiModels = [
  "claude-3-5-sonnet-20240307", // Claude 3.5 Sonnet
  "claude-3-5-sonnet-20241022", // Claude 3.5 Sonnet 2024-10-22
  "claude-3-opus-20240229", // Claude 3 Opus
  "claude-3-sonnet-20240229", // Claude 3 Sonnet
  "claude-3-haiku-20240307", // Claude 3 Haiku
];
```

### System Prompt Customization

The base system prompt can be adjusted in the `EnhancedAgent` class:

```javascript
this.baseSystemPrompt = `You are the Joule Finance assistant, an expert on the Joule Finance DeFi protocol built on the Aptos blockchain.
Answer questions helpfully, accurately, and concisely.`;
```

## Deployment

### Heroku Deployment

{% hint style="info" %}
The system is optimized for deployment on Heroku.
{% endhint %}

1. Create a Heroku application:

```bash
heroku create joule-finance-chat
```

2. Add PostgreSQL add-on:

```bash
heroku addons:create heroku-postgresql:hobby-dev
```

3. Set environment variables:

```bash
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
```

4. Deploy the application:

```bash
git push heroku main
```

### Docker Deployment

A Dockerfile is provided for containerized deployment:

```bash
docker build -t joule-finance-assistant .
docker run -p 3000:3000 --env-file .env joule-finance-assistant
```

## Troubleshooting

### Common Issues

{% hint style="warning" %}

#### API Key Issues

- **Error**: `No ANTHROPIC_API_KEY provided, using fallback response mode`
- **Solution**: Verify API key is correctly set in environment variables
  {% endhint %}

{% hint style="warning" %}

#### Model Compatibility

- **Error**: `Error with Messages API for model: 404 not_found_error`
- **Solution**: Update the model list in `joule-api-server.js` to use only models available with your API key
  {% endhint %}

{% hint style="warning" %}

#### System Prompt Format

- **Error**: `Unexpected role "system". The Messages API accepts a top-level system parameter`
- **Solution**: Ensure system prompt is passed as a top-level parameter in the Messages API call
  {% endhint %}

## Maintenance and Updates

### Updating Market Data

The market data is automatically refreshed from external sources. To manually update:

1. Edit the `knowledge/market-data.json` file
2. Restart the server or call the `/api/admin/refresh-knowledge` endpoint

### Adding New Knowledge

To expand the assistant's knowledge:

1. Add new JSON files to the `knowledge/` directory
2. Register them in `services/knowledgeBase.js`
3. Update the system prompt generation to include the new knowledge

---

{% hint style="info" %}
This documentation was generated for Joule Finance Assistant v1.0. Last updated: March 2025.
{% endhint %}
