/**
 * LocalSigner implementation for Move Agent Kit
 * 
 * This module provides a signer implementation for the Aptos blockchain
 * that can be used with the Move Agent Kit.
 */

import { 
    Account, 
    Aptos, 
    AptosConfig, 
    Network,
    SigningSchemeInput,
    Hex,
    Ed25519PrivateKey,
    TransactionPayload,
    InputEntryFunctionData,
    TransactionResponse
  } from '@aptos-labs/ts-sdk';
import { logger } from './logger.js';
  
  /**
   * LocalSigner for signing Aptos transactions
   */
  export class LocalSigner {
    private account: Account;
    private aptosClient: Aptos;
    
    /**
     * Creates a new LocalSigner instance
     * 
     * @param privateKey - The private key as a string
     * @param network - The network to use
     * @param nodeUrl - Optional node URL
     */
    constructor(privateKey: string, network: Network, nodeUrl?: string) {
      // Create Aptos config
      const aptosConfig = new AptosConfig({ 
        network,
        ...(nodeUrl && { fullnodeUrl: nodeUrl })
      });
      
      // Create Aptos client
      this.aptosClient = new Aptos(aptosConfig);
      
      // Create private key instance
      const privKey = new Ed25519PrivateKey(privateKey);
      
      // Create account from private key
      this.account = Account.fromPrivateKey({ privateKey: privKey });
    }
  
    /**
     * Get the account address
     * 
     * @returns The account address
     */
    public getAddress(): string {
      return this.account.accountAddress.toString();
    }
  
    /**
     * Get the Aptos client
     * 
     * @returns The Aptos client
     */
    public getAptosClient(): Aptos {
      return this.aptosClient;
    }
  
    /**
     * Get the account
     * 
     * @returns The account
     */
    public getAccount(): Account {
      return this.account;
    }
  
    /**
     * Sign and submit a transaction
     * 
     * @param payload - The transaction payload
     * @returns The transaction response
     */
    public async signAndSubmitTransaction(payload: InputEntryFunctionData): Promise<TransactionResponse> {
      try {
        // Build the transaction
        const transaction = await this.aptosClient.transaction.build.simple({
          sender: this.account.accountAddress,
          data: payload
        });
        
        // Sign the transaction
        const senderAuthenticator = this.aptosClient.transaction.sign({
          signer: this.account,
          transaction
        });
        
        // Submit the transaction
        const pendingTx = await this.aptosClient.transaction.submit.simple({
          transaction,
          senderAuthenticator
        });
        
        return pendingTx;
      } catch (error) {
        logger.error('Error signing and submitting transaction:', error);
        throw new Error(`Failed to sign and submit transaction: ${(error as Error).message}`);
      }
    }
  
    /**
     * Sign a message
     * 
     * @param message - The message to sign
     * @returns The signature and public key
     */
    public signMessage(message: string): { signature: string; publicKey: string } {
      try {
        const messageBytes = new TextEncoder().encode(message);
        const signature = this.account.sign(messageBytes);
        
        return {
          signature: signature.toString(),
          publicKey: this.account.publicKey.toString()
        };
      } catch (error) {
        console.error('Error signing message:', error);
        throw new Error(`Failed to sign message: ${(error as Error).message}`);
      }
    }
  }