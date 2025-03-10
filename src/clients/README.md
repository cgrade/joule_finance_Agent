# Clients Module

This folder contains client wrappers for external APIs and services.

## Components

- **twitterClient.ts**: Wrapper for the Twitter API
  - Handles authentication and token management
  - Provides methods for posting with and without media
  - Implements development mode for testing

## Twitter Client Features

- Production/development mode toggle
- Media upload support
- Error handling and logging
- Authentication management

## Usage

```typescript
import { TwitterClient } from "./clients/twitterClient";

// Create a client
const twitterClient = new TwitterClient();

// Post a simple tweet
await twitterClient.tweet("This is a test tweet");

// Post with an image
await twitterClient.tweetWithMedia("Tweet with chart", "/path/to/chart.png");
```

## Environment Variables

The Twitter client requires the following environment variables:

- TWITTER_API_KEY
- TWITTER_API_SECRET
- TWITTER_ACCESS_TOKEN
- TWITTER_ACCESS_TOKEN_SECRET

## Development Mode

When not in production mode, the client logs what would be posted but doesn't actually post to Twitter.
