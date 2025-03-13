# Joule Finance Agent API

This document outlines the API endpoints for interacting with the Joule Finance Agent chatbot.

## Base URL

```
https://your-api-server.com/api
```

## Endpoints

### Chat with Agent

Send a message to the agent and get a response.

**URL**: `/chat`

**Method**: `POST`

**Auth Required**: No (Add JWT authentication for production)

**Request Body**:

```json
{
  "message": "What is Joule Finance's TVL?",
  "sessionId": "optional-session-id-for-continued-conversations"
}
```

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "text": "Joule Finance currently has a Total Value Locked (TVL) of $9,504,135.67. This represents the total value of assets deposited in the protocol's smart contracts across various markets including USDC, USDT, APT, WETH, stAPT, WBTC, and eAPT.",
  "sessionId": "session-id-to-use-for-follow-up-messages",
  "usage": {
    "promptTokens": 435,
    "completionTokens": 157,
    "totalTokens": 592
  }
}
```

**Error Response**:

- **Code**: 400 Bad Request
- **Content**:

```json
{
  "error": "Invalid message format. Message must be a non-empty string."
}
```

OR

- **Code**: 500 Internal Server Error
- **Content**:

```json
{
  "error": "Failed to process message"
}
```

### Health Check

Check if the API is operational.

**URL**: `/health`

**Method**: `GET`

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

## Conversation Management

To maintain conversation context across multiple messages, include the `sessionId` returned from your first request in all subsequent requests. The server will maintain conversation history for 24 hours of inactivity before cleaning up the session.

## Example Usage

### JavaScript/Fetch

```javascript
// Initial message
async function chatWithAgent(message, sessionId = null) {
  const response = await fetch("https://your-api-server.com/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      sessionId,
    }),
  });

  return await response.json();
}

// Example conversation flow
async function conversation() {
  // First message
  const response1 = await chatWithAgent("What is Joule Finance?");
  console.log("Agent:", response1.text);

  // Follow-up question using the same session
  const response2 = await chatWithAgent(
    "What APR does it offer?",
    response1.sessionId
  );
  console.log("Agent:", response2.text);
}
```
