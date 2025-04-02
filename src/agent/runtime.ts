/**
 * Agent Runtime for Move Agent Kit
 * 
 * This module provides the core runtime for the Move Agent Kit,
 * encapsulating signer, Aptos client, and agent operations.
 */

import { 
    Aptos,
    MoveResource,
    TransactionPayload,
    EntryFunctionABI,
    EntryFunctionArgumentTypes,
    TypeTag,
    TransactionResponse,
    UserTransactionResponse,
    CommittedTransactionResponse,
    InputEntryFunctionData
  } from '@aptos-labs/ts-sdk';
import { LocalSigner } from '../utils/signer.js';
import { logger } from '../utils/logger.js';
  
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
  export class AgentRuntime {
    public readonly signer: LocalSigner;
    public readonly aptos: Aptos;
    private readonly options: AgentOptions;
  
    /**
     * Creates a new AgentRuntime instance
     * 
     * @param signer - The signer implementation
     * @param options - Additional options
     */
    constructor(signer: LocalSigner, options: AgentOptions = {}) {
      this.signer = signer;
      this.aptos = signer.getAptosClient();
      this.options = options;
    }
  
    /**
     * Get the account address
     * 
     * @returns The account address
     */
    public async getAddress(): Promise<string> {
      return this.signer.getAddress();
    }
  
    /**
     * Get balance of an address
     * 
     * @param address - The address to check (defaults to own address)
     * @returns The balance in APT
     */
    public async getBalance(address?: string): Promise<number> {
      try {
        const targetAddress = address || await this.getAddress();
        
        // Get account resources
        const accountResource = await this.aptos.getAccountResource({
          accountAddress: targetAddress,
          resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
        });
        
        // Extract balance from resource
        const balance = (accountResource as {
          data: { coin: { value: string } }
        }).data.coin.value;
        
        // Convert from octas to APT (1 APT = 10^8 octas)
        return Number(balance) / 1e8;
      } catch (error) {
        logger.error('Error getting balance:', error);
        throw new Error(`Failed to get balance: ${(error as Error).message}`);
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
    public async transferTokens(
      toAddress: string, 
      amount: number, 
      assetType: string = 'APT'
    ): Promise<TransactionResponse> {
      try {
        // Convert amount to octas (1 APT = 10^8 octas)
        const amountInOctas = BigInt(Math.floor(amount * 1e8));
        
        // Prepare the transfer payload
        const inputData: InputEntryFunctionData = {
          function: '0x1::coin::transfer' as `${string}::${string}::${string}`,
          typeArguments: ['0x1::aptos_coin::AptosCoin'],
          functionArguments: [toAddress, amountInOctas.toString()]
        };
        
        // Sign and submit the transaction
        const pendingTx = await this.signer.signAndSubmitTransaction(inputData);
        
        return pendingTx;
      } catch (error) {
        console.error('Error transferring tokens:', error);
        throw new Error(`Failed to transfer tokens: ${(error as Error).message}`);
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
    public async executeCall(
      functionName: string,
      typeArgs: string[] = [],
      args: EntryFunctionArgumentTypes[] = []
    ): Promise<TransactionResponse> {
      try {
        // Prepare the payload
        const inputData: InputEntryFunctionData = {
          function: functionName as `${string}::${string}::${string}`,
          typeArguments: typeArgs,
          functionArguments: args
        };
        
        // Sign and submit the transaction
        return await this.signer.signAndSubmitTransaction(inputData);
      } catch (error) {
        console.error('Error executing call:', error);
        throw new Error(`Failed to execute call: ${(error as Error).message}`);
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
    public async simulateCall(
      functionName: string,
      typeArgs: string[] = [],
      args: EntryFunctionArgumentTypes[] = []
    ): Promise<UserTransactionResponse[]> {
      try {
        // Prepare the payload
        const inputData: InputEntryFunctionData = {
          function: functionName as `${string}::${string}::${string}`,
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
      } catch (error) {
        console.error('Error simulating call:', error);
        throw new Error(`Failed to simulate call: ${(error as Error).message}`);
      }
    }
  
    /**
     * Read data from a contract using a view function
     * 
     * @param params - The view function parameters
     * @returns The view function result
     */
    public async readContract(params: ViewFunctionParams): Promise<any> {
      try {
        const { function: func, typeArguments = [], arguments: args = [] } = params;
        
        // Validate function format
        if (!func.match(/^0x[a-zA-Z0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/)) {
          throw new Error(`Invalid function format: ${func}. Expected format: 0x{address}::{module}::{function}`);
        }
        
        // Call view function with properly typed function name
        const result = await this.aptos.view({
          payload: {
            function: func as `${string}::${string}::${string}`,
            typeArguments,
            functionArguments: args
          }
        });
        
        return result;
      } catch (error) {
        console.error('Error reading contract:', error);
        throw new Error(`Failed to read contract: ${(error as Error).message}`);
      }
    }
    
    /**
     * Wait for a transaction to be confirmed
     * 
     * @param txHash - The transaction hash
     * @returns The transaction response
     */
    public async waitForTransaction(txHash: string): Promise<CommittedTransactionResponse> {
      return await this.aptos.waitForTransaction({ transactionHash: txHash });
    }
  }