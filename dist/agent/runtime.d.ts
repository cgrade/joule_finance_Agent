/**
 * Agent Runtime for Move Agent Kit
 *
 * This module provides the core runtime for the Move Agent Kit,
 * encapsulating signer, Aptos client, and agent operations.
 */
import { Aptos, EntryFunctionArgumentTypes, TransactionResponse, UserTransactionResponse, CommittedTransactionResponse } from '@aptos-labs/ts-sdk';
import { LocalSigner } from '../utils/signer';
/**
 * Agent options interface
 */
export interface AgentOptions {
    ANTHROPIC_API_KEY?: string;
    OPENAI_API_KEY?: string;
    PANORA_API_KEY?: string;
    [key: string]: string | undefined;
}
/**
 * View function parameters interface
 */
export interface ViewFunctionParams {
    function: string;
    typeArguments?: string[];
    arguments?: any[];
}
/**
 * AgentRuntime class for Move Agent Kit
 */
export declare class AgentRuntime {
    readonly signer: LocalSigner;
    readonly aptos: Aptos;
    private readonly options;
    /**
     * Creates a new AgentRuntime instance
     *
     * @param signer - The signer implementation
     * @param options - Additional options
     */
    constructor(signer: LocalSigner, options?: AgentOptions);
    /**
     * Get the account address
     *
     * @returns The account address
     */
    getAddress(): Promise<string>;
    /**
     * Get balance of an address
     *
     * @param address - The address to check (defaults to own address)
     * @returns The balance in APT
     */
    getBalance(address?: string): Promise<number>;
    /**
     * Transfer tokens to another address
     *
     * @param toAddress - The recipient address
     * @param amount - The amount to transfer
     * @param assetType - The asset type (default: APT)
     * @returns The transaction result
     */
    transferTokens(toAddress: string, amount: number, assetType?: string): Promise<TransactionResponse>;
    /**
     * Execute a smart contract call
     *
     * @param functionName - The function to call
     * @param typeArgs - The type arguments
     * @param args - The function arguments
     * @returns The transaction result
     */
    executeCall(functionName: string, typeArgs?: string[], args?: EntryFunctionArgumentTypes[]): Promise<TransactionResponse>;
    /**
     * Simulate a transaction to estimate gas and check for errors
     *
     * @param functionName - The function to call
     * @param typeArgs - The type arguments
     * @param args - The function arguments
     * @returns The simulation result
     */
    simulateCall(functionName: string, typeArgs?: string[], args?: EntryFunctionArgumentTypes[]): Promise<UserTransactionResponse[]>;
    /**
     * Read data from a contract using a view function
     *
     * @param params - The view function parameters
     * @returns The view function result
     */
    readContract(params: ViewFunctionParams): Promise<any>;
    /**
     * Wait for a transaction to be confirmed
     *
     * @param txHash - The transaction hash
     * @returns The transaction response
     */
    waitForTransaction(txHash: string): Promise<CommittedTransactionResponse>;
}
