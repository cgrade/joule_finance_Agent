/**
 * LocalSigner implementation for Move Agent Kit
 *
 * This module provides a signer implementation for the Aptos blockchain
 * that can be used with the Move Agent Kit.
 */
import { Account, Aptos, Network, InputEntryFunctionData, TransactionResponse } from '@aptos-labs/ts-sdk';
/**
 * LocalSigner for signing Aptos transactions
 */
export declare class LocalSigner {
    private account;
    private aptosClient;
    /**
     * Creates a new LocalSigner instance
     *
     * @param privateKey - The private key as a string
     * @param network - The network to use
     * @param nodeUrl - Optional node URL
     */
    constructor(privateKey: string, network: Network, nodeUrl?: string);
    /**
     * Get the account address
     *
     * @returns The account address
     */
    getAddress(): string;
    /**
     * Get the Aptos client
     *
     * @returns The Aptos client
     */
    getAptosClient(): Aptos;
    /**
     * Get the account
     *
     * @returns The account
     */
    getAccount(): Account;
    /**
     * Sign and submit a transaction
     *
     * @param payload - The transaction payload
     * @returns The transaction response
     */
    signAndSubmitTransaction(payload: InputEntryFunctionData): Promise<TransactionResponse>;
    /**
     * Sign a message
     *
     * @param message - The message to sign
     * @returns The signature and public key
     */
    signMessage(message: string): {
        signature: string;
        publicKey: string;
    };
}
