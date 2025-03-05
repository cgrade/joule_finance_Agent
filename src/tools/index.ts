/**
 * Aptos Tools for Move Agent Kit
 * 
 * This module provides standard tools for interacting with the Aptos blockchain
 * through the Move Agent Kit.
 */

import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { AgentRuntime } from "../agent/runtime";
import { EntryFunctionArgumentTypes } from "@aptos-labs/ts-sdk";
import { logger } from "../utils/logger";

/**
 * Creates a token transfer tool for Aptos
 * 
 * @param agent - The agent runtime
 * @returns The token transfer tool
 */
export const createTokenTransferTool = (agent: AgentRuntime): StructuredTool => {
  return new (class extends StructuredTool {
    name = "aptos_transfer_token";
    description = `
    This tool can be used to transfer APT or other tokens to a recipient.
    
    Inputs:
    to: string, the recipient address (required)
    amount: number, the amount to transfer (required)
    asset: string, the asset type (optional, defaults to "APT")
    `;
    schema = z.object({
      to: z.string(),
      amount: z.number().positive(),
      asset: z.string().optional()
    });

    async _call({ to, amount, asset = "APT" }: z.infer<typeof this.schema>) {
      try {
        const pendingTx = await agent.transferTokens(to, amount, asset);
        
        return JSON.stringify({
          success: true,
          hash: pendingTx.hash,
          from: await agent.getAddress(),
          to,
          amount,
          asset
        });
      } catch (error) {
        logger.error('Error transferring tokens:', error);
        return JSON.stringify({ 
          success: false,
          error: (error as Error).message 
        });
      }
    }
  })();
};

/**
 * Creates a balance check tool for Aptos
 * 
 * @param agent - The agent runtime
 * @returns The balance check tool
 */
export const createBalanceCheckTool = (agent: AgentRuntime): StructuredTool => {
  return new (class extends StructuredTool {
    name = "aptos_get_balance";
    description = `
    This tool can be used to check the balance of an address.
    
    Inputs:
    address: string, the address to check (optional, defaults to own address)
    asset: string, the asset type (optional, defaults to "APT")
    `;
    schema = z.object({
      address: z.string().optional(),
      asset: z.string().optional()
    });

    async _call({ address, asset = "APT" }: z.infer<typeof this.schema>) {
      try {
        const balance = await agent.getBalance(address);
        return JSON.stringify({ 
          success: true,
          address: address || await agent.getAddress(),
          balance,
          asset
        });
      } catch (error) {
        return JSON.stringify({ 
          success: false,
          error: (error as Error).message 
        });
      }
    }
  });
};

/**
 * Creates a contract call tool for Aptos
 * 
 * @param agent - The agent runtime
 * @returns The contract call tool
 */
export const createContractCallTool = (agent: AgentRuntime): StructuredTool => {
  return new (class extends StructuredTool {
    name = "aptos_execute_call";
    description = `
    This tool can be used to execute a smart contract call on Aptos.
    
    Inputs:
    function: string, the function to call (required)
    typeArgs: array, the type arguments to pass (optional)
    args: array, the arguments to pass (optional)
    `;
    schema = z.object({
      function: z.string(),
      typeArgs: z.array(z.string()).optional(),
      args: z.array(z.any()).optional()
    });

    async _call({ function: func, typeArgs = [], args = [] }: z.infer<typeof this.schema>) {
      try {
        // First simulate to check for errors
        const simulation = await agent.simulateCall(
          func, 
          typeArgs, 
          args as EntryFunctionArgumentTypes[]
        );
        
        // Check for simulation errors
        if (simulation[0].vm_status !== 'Executed successfully') {
          return JSON.stringify({
            success: false,
            error: `Simulation failed: ${simulation[0].vm_status}`,
            simulation: simulation[0]
          });
        }
        
        // If simulation succeeds, execute the transaction
        const pendingTx = await agent.executeCall(
          func, 
          typeArgs, 
          args as EntryFunctionArgumentTypes[]
        );
        
        // Wait for transaction confirmation
        const result = await agent.waitForTransaction(pendingTx.hash);
        
        return JSON.stringify({
          success: true,
          hash: result.hash,
          sender: await agent.getAddress(),
          function: func,
          status: result.vm_status
        });
      } catch (error) {
        return JSON.stringify({ 
          success: false,
          error: (error as Error).message 
        });
      }
    }
  });
};

/**
 * Creates a contract read tool for Aptos
 * 
 * @param agent - The agent runtime
 * @returns The contract read tool
 */
export const createContractReadTool = (agent: AgentRuntime): StructuredTool => {
  return new (class extends StructuredTool {
    name = "aptos_read_contract";
    description = `
    This tool can be used to read data from a contract on Aptos using a view function.
    
    Inputs:
    function: string, the view function to call (required)
    typeArguments: array, the type arguments to pass (optional)
    arguments: array, the arguments to pass (optional)
    `;
    schema = z.object({
      function: z.string(),
      typeArguments: z.array(z.string()).optional(),
      functionArguments: z.array(z.any()).optional()
    });

    async _call({ function: func, typeArguments = [], functionArguments = [] }: z.infer<typeof this.schema>) {
      try {
        const result = await agent.readContract({
          function: func,
          typeArguments: typeArguments,
          arguments: functionArguments
        });
        
        return JSON.stringify({
          success: true,
          result
        });
      } catch (error) {
        return JSON.stringify({ 
          success: false,
          error: (error as Error).message 
        });
      }
    }
  })();
};

/**
 * Creates all standard Aptos tools
 * 
 * @param agent - The agent runtime
 * @returns Array of Aptos tools
 */
export const createAptosTools = (agent: AgentRuntime): StructuredTool[] => {
  return [
    createTokenTransferTool(agent),
    createBalanceCheckTool(agent),
    createContractCallTool(agent),
    createContractReadTool(agent)
  ];
};

export { z };