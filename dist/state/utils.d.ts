import { BaseMessage } from "langchain/schema";
import { PosterState } from "./types";
/**
 * Prunes message history to prevent state bloat while preserving important context
 * @param messages Array of messages to prune
 * @param maxMessages Maximum number of messages to retain
 * @param preserveTypes Message types that should be prioritized for preservation
 * @returns Pruned array of messages
 */
export declare const pruneMessages: (messages: BaseMessage[], maxMessages?: number, preserveTypes?: string[]) => BaseMessage[];
/**
 * Logs state size and composition for debugging
 */
export declare const logStateSize: (state: PosterState, location: string) => void;
