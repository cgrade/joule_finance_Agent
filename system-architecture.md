# System Architecture

The Joule Finance Assistant follows a modern microservices architecture with the following layers:

## Frontend Layer

- React-based web chat interface
- Twitter API integration for the Twitter agent

## API Layer

- Express.js server
- RESTful API endpoints
- WebSocket connections for real-time chat

## AI Processing Layer

- Anthropic Claude integration
- Knowledge base processing
- Context management

## Data Layer

- PostgreSQL database for conversation history
- JSON-based knowledge repositories
- Real-time market data integration

{% hint style="success" %}
This architecture enables both real-time chat and Twitter interactions to use the same knowledge base and AI capabilities.
{% endhint %}

## Architecture Diagram

![System Architecture Diagram]

The system is designed for scalability, with the ability to add new frontend channels while leveraging the same backend knowledge and AI processing.
