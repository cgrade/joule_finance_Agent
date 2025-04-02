# Joule Finance API

The core backend service powering both the chat interface and Twitter agent. Built with Node.js and Express, it handles:

- AI model integration with Anthropic Claude
- Knowledge base management
- Conversation history and session tracking
- Market data retrieval and processing

## Key Files

- `joule-api-server.js`: Main server implementation
- `services/jouleFinanceData.js`: Market data service
- `services/knowledgeBase.js`: Knowledge management
- `services/conversationService.js`: Conversation tracking

## Features

### AI Integration

The API integrates with Anthropic's Claude models to process natural language queries and generate accurate, helpful responses about Joule Finance.

### Knowledge Management

The API maintains and updates structured knowledge about Joule Finance, including protocol details, market data, and product information.

### Session Management

User sessions are tracked to maintain conversation context and provide personalized responses based on conversation history.

### Real-Time Data

The API periodically fetches updated market data to ensure responses contain the most current information about Joule Finance markets.
