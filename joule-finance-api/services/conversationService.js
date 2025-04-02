const { User, Conversation, Message } = require('../models');
const { v4: uuidv4 } = require('uuid');

/**
 * Service for managing conversations and messages
 */
class ConversationService {
  /**
   * Get or create a conversation by session ID
   */
  async getOrCreateConversationBySessionId(sessionId, ipAddress = null) {
    try {
      // Find or create a user by sessionId
      let [user] = await User.findOrCreate({
        where: { sessionId },
        defaults: {
          ipAddress,
          lastActive: new Date()
        }
      });

      // Update last active time
      if (user) {
        user.lastActive = new Date();
        await user.save();
      }

      // Find the most recent conversation for this user
      let conversation = await Conversation.findOne({
        where: { userId: user.id },
        order: [['lastMessageAt', 'DESC']]
      });

      // Create a new conversation if one doesn't exist or the last one is older than 24 hours
      if (!conversation || isConversationExpired(conversation)) {
        conversation = await Conversation.create({
          userId: user.id,
          title: 'New Conversation',
          lastMessageAt: new Date()
        });
      }

      return conversation;
    } catch (error) {
      console.error('Error in getOrCreateConversationBySessionId:', error);
      throw error;
    }
  }

  /**
   * Save a message to a conversation
   */
  async saveMessage(conversationId, role, content, tokenCount = 0) {
    try {
      // Validate content is not null
      if (content === null || content === undefined) {
        content = "Error: No response generated";
      }
      
      const message = await Message.create({
        conversationId,
        role,
        content,
        tokenCount
      });
      
      // Update conversation's lastMessageAt
      await Conversation.update(
        { lastMessageAt: new Date() },
        { where: { id: conversationId }}
      );
      
      return message;
    } catch (error) {
      console.error('Error in saveMessage:', error);
      throw error;
    }
  }

  /**
   * Get recent messages from a conversation
   */
  async getRecentMessages(conversationId, limit = 10) {
    try {
      return await Message.findAll({
        where: { conversationId },
        order: [['createdAt', 'ASC']],
        limit
      });
    } catch (error) {
      console.error('Error in getRecentMessages:', error);
      throw error;
    }
  }

  /**
   * Generate a title for a conversation based on the first user message
   */
  async generateConversationTitle(conversationId, firstMessage) {
    try {
      // Truncate first message to create a title
      const title = firstMessage.length > 50
        ? `${firstMessage.substring(0, 47)}...`
        : firstMessage;

      await Conversation.update(
        { title },
        { where: { id: conversationId } }
      );
      
      return title;
    } catch (error) {
      console.error('Error in generateConversationTitle:', error);
      throw error;
    }
  }

  /**
   * Add a message to a conversation (alias for saveMessage)
   * This method is called by the server code
   */
  async addMessage(conversationId, role, content, tokenCount = null) {
    return this.saveMessage(conversationId, role, content, tokenCount);
  }
}

/**
 * Check if a conversation is expired (older than 24 hours)
 */
function isConversationExpired(conversation) {
  const now = new Date();
  const lastMessageTime = new Date(conversation.lastMessageAt);
  const hoursDifference = (now - lastMessageTime) / (1000 * 60 * 60);
  
  return hoursDifference > 24;
}

module.exports = new ConversationService(); 