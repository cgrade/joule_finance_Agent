/**
 * Joule Finance X/Twitter Professional Posting Agent
 *
 * This module creates an AI-powered agent that automatically generates
 * professional, data-driven posts about Joule Finance on Aptos blockchain.
 *
 * Built for the Aptos/Move hackathon using Move Agent Kit.
 */
/**
 * Initialize the Joule Finance poster system
 */
export declare const createBullishPostSystem: () => Promise<(userInput: string) => Promise<any>>;
/**
 * Script for running the system as a standalone process
 */
export declare const runAsBullishPoster: (userInput?: string) => Promise<void>;
declare const _default: {
    createBullishPostSystem: () => Promise<(userInput: string) => Promise<any>>;
    runAsBullishPoster: (userInput?: string) => Promise<void>;
};
export default _default;
