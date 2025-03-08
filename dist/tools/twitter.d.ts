import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
/**
 * Tool for social media interactions (like, reply, retweet)
 */
export declare class XInteractionTool extends StructuredTool {
    name: string;
    description: string;
    schema: z.ZodObject<{
        action: z.ZodEnum<["like", "reply", "retweet"]>;
        tweet_id: z.ZodString;
        reply_content: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        tweet_id: string;
        action: "reply" | "like" | "retweet";
        reply_content?: string | undefined;
    }, {
        tweet_id: string;
        action: "reply" | "like" | "retweet";
        reply_content?: string | undefined;
    }>;
    _call(args: {
        action: string;
        tweet_id: string;
        reply_content?: string;
    }): Promise<{
        success: boolean;
        development_mode: boolean;
        action?: undefined;
        tweet_id?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        action: string;
        tweet_id: string;
        development_mode?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        development_mode?: undefined;
        action?: undefined;
        tweet_id?: undefined;
    }>;
}
