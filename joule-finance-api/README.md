# Joule Finance API

An API server for the Joule Finance chat agent powered by Claude AI.

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Configure environment variables:

   - Copy `.env.example` to `.env` (if not already done)
   - Add your Anthropic API key to the `.env` file

3. Run the server:
   ```
   npm start
   ```

## API Endpoints

- `POST /api/chat` - Send a message to the chat agent

  - Request body: `{ "message": "your message", "sessionId": "optional-session-id" }`
  - Response: `{ "text": "AI response", "sessionId": "session-id" }`

- `GET /api/health` - Check API health
- `GET /api/debug` - Get debug information

## Environment Variables

- `ANTHROPIC_API_KEY` - API key for Anthropic Claude
- `PORT` - Port to run the server on (default: 3000)
