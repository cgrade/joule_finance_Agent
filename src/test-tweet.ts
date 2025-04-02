import { TwitterClient } from './clients/twitterClient.js';

async function testTweet() {
  try {
    console.log('Testing Twitter posting in production mode...');
    
    // Create Twitter client
    const twitterClient = new TwitterClient();
    
    // Try posting a test tweet
    const result = await twitterClient.tweet('This is a test tweet from Joule Finance Agent. ' + 
      'Testing production mode on ' + new Date().toISOString());
    
    if (result) {
      console.log('Test tweet posted successfully!');
    } else {
      console.log('Failed to post test tweet.');
    }
  } catch (error) {
    console.error('Error testing Twitter posting:', error);
  }
}

// Run the test
testTweet().catch(console.error); 