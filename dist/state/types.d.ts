import { BaseMessage } from "@langchain/core/messages";
/**
 * Core state interface for the poster agent system
 */
export interface PosterState {
    messages: BaseMessage[];
    lastPostTime: Date;
    metrics: {
        tvl?: number;
        apy?: number;
    };
}
