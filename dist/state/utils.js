/**
 * Prunes message history to prevent state bloat while preserving important context
 * @param messages Array of messages to prune
 * @param maxMessages Maximum number of messages to retain
 * @param preserveTypes Message types that should be prioritized for preservation
 * @returns Pruned array of messages
 */
export const pruneMessages = (messages, maxMessages = 10, preserveTypes = ['user_input', 'reader_agent', 'writer_agent', 'posting_agent']) => {
    if (!messages || !Array.isArray(messages))
        return [];
    if (messages.length <= maxMessages)
        return messages;
    // First, extract important messages we want to preserve
    const importantMessages = messages.filter(msg => msg.name && preserveTypes.includes(msg.name));
    // If we already have too many important messages, keep the most recent ones
    if (importantMessages.length >= maxMessages) {
        return importantMessages.slice(-maxMessages);
    }
    // Fill remaining slots with the most recent messages
    const remainingSlots = maxMessages - importantMessages.length;
    const recentMessages = messages.slice(-remainingSlots);
    // Combine important messages with recent ones, avoiding duplicates
    const importantIds = new Set(importantMessages.map(m => JSON.stringify(m)));
    const uniqueRecent = recentMessages.filter(m => !importantIds.has(JSON.stringify(m)));
    return [...importantMessages, ...uniqueRecent].slice(-maxMessages);
};
/**
 * Logs state size and composition for debugging
 */
export const logStateSize = (state, location) => {
    if (!state || !state.messages)
        return;
    const messageCount = state.messages.length;
    const messageTypes = state.messages
        .map(m => m.name || 'unnamed')
        .reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
    console.debug(`[${location}] State size: ${messageCount} messages | Types: ${JSON.stringify(messageTypes)}`);
};
