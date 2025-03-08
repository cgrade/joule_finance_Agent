"use strict";
/**
 * Agent Runtime for Move Agent Kit
 *
 * This module provides the core runtime for the Move Agent Kit,
 * encapsulating signer, Aptos client, and agent operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRuntime = void 0;
const logger_1 = require("../utils/logger");
/**
 * AgentRuntime class for Move Agent Kit
 */
class AgentRuntime {
    /**
     * Creates a new AgentRuntime instance
     *
     * @param signer - The signer implementation
     * @param options - Additional options
     */
    constructor(signer, options = {}) {
        this.signer = signer;
        this.aptos = signer.getAptosClient();
        this.options = options;
    }
    /**
     * Get the account address
     *
     * @returns The account address
     */
    async getAddress() {
        return this.signer.getAddress();
    }
    /**
     * Get balance of an address
     *
     * @param address - The address to check (defaults to own address)
     * @returns The balance in APT
     */
    async getBalance(address) {
        try {
            const targetAddress = address || await this.getAddress();
            // Get account resources
            const accountResource = await this.aptos.getAccountResource({
                accountAddress: targetAddress,
                resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
            });
            // Extract balance from resource
            const balance = accountResource.data.coin.value;
            // Convert from octas to APT (1 APT = 10^8 octas)
            return Number(balance) / 1e8;
        }
        catch (error) {
            logger_1.logger.error('Error getting balance:', error);
            throw new Error(`Failed to get balance: ${error.message}`);
        }
    }
    /**
     * Transfer tokens to another address
     *
     * @param toAddress - The recipient address
     * @param amount - The amount to transfer
     * @param assetType - The asset type (default: APT)
     * @returns The transaction result
     */
    async transferTokens(toAddress, amount, assetType = 'APT') {
        try {
            // Convert amount to octas (1 APT = 10^8 octas)
            const amountInOctas = BigInt(Math.floor(amount * 1e8));
            // Prepare the transfer payload
            const inputData = {
                function: '0x1::coin::transfer',
                typeArguments: ['0x1::aptos_coin::AptosCoin'],
                functionArguments: [toAddress, amountInOctas.toString()]
            };
            // Sign and submit the transaction
            const pendingTx = await this.signer.signAndSubmitTransaction(inputData);
            return pendingTx;
        }
        catch (error) {
            console.error('Error transferring tokens:', error);
            throw new Error(`Failed to transfer tokens: ${error.message}`);
        }
    }
    /**
     * Execute a smart contract call
     *
     * @param functionName - The function to call
     * @param typeArgs - The type arguments
     * @param args - The function arguments
     * @returns The transaction result
     */
    async executeCall(functionName, typeArgs = [], args = []) {
        try {
            // Prepare the payload
            const inputData = {
                function: functionName,
                typeArguments: typeArgs,
                functionArguments: args
            };
            // Sign and submit the transaction
            return await this.signer.signAndSubmitTransaction(inputData);
        }
        catch (error) {
            console.error('Error executing call:', error);
            throw new Error(`Failed to execute call: ${error.message}`);
        }
    }
    /**
     * Simulate a transaction to estimate gas and check for errors
     *
     * @param functionName - The function to call
     * @param typeArgs - The type arguments
     * @param args - The function arguments
     * @returns The simulation result
     */
    async simulateCall(functionName, typeArgs = [], args = []) {
        try {
            // Prepare the payload
            const inputData = {
                function: functionName,
                typeArguments: typeArgs,
                functionArguments: args
            };
            // Build the transaction
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.signer.getAccount().accountAddress,
                data: inputData
            });
            // Simulate the transaction
            const result = await this.aptos.transaction.simulate.simple({
                signerPublicKey: this.signer.getAccount().publicKey,
                transaction
            });
            return result;
        }
        catch (error) {
            console.error('Error simulating call:', error);
            throw new Error(`Failed to simulate call: ${error.message}`);
        }
    }
    /**
     * Read data from a contract using a view function
     *
     * @param params - The view function parameters
     * @returns The view function result
     */
    async readContract(params) {
        try {
            const { function: func, typeArguments = [], arguments: args = [] } = params;
            // Validate function format
            if (!func.match(/^0x[a-zA-Z0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/)) {
                throw new Error(`Invalid function format: ${func}. Expected format: 0x{address}::{module}::{function}`);
            }
            // Call view function with properly typed function name
            const result = await this.aptos.view({
                payload: {
                    function: func,
                    typeArguments,
                    functionArguments: args
                }
            });
            return result;
        }
        catch (error) {
            console.error('Error reading contract:', error);
            throw new Error(`Failed to read contract: ${error.message}`);
        }
    }
    /**
     * Wait for a transaction to be confirmed
     *
     * @param txHash - The transaction hash
     * @returns The transaction response
     */
    async waitForTransaction(txHash) {
        return await this.aptos.waitForTransaction({ transactionHash: txHash });
    }
}
exports.AgentRuntime = AgentRuntime;
//# sourceMappingURL=runtime.js.map