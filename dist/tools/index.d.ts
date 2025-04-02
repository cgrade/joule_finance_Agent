/**
 * Aptos Tools for Move Agent Kit
 *
 * This module provides standard tools for interacting with the Aptos blockchain
 * through the Move Agent Kit.
 */
import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { AgentRuntime } from "../agent/runtime.js";
import JouleFinanceDataTool from "./jouleFinance.js";
import ChartVisualizationTool from "./visualization.js";
import XProfessionalPostTool from "./socialMedia.js";
import JouleKnowledgeBase from "./knowledgeBase.js";
/**
 * Creates a token transfer tool for Aptos
 *
 * @param agent - The agent runtime
 * @returns The token transfer tool
 */
export declare const createTokenTransferTool: (agent: AgentRuntime) => StructuredTool;
/**
 * Creates a balance check tool for Aptos
 *
 * @param agent - The agent runtime
 * @returns The balance check tool
 */
export declare const createBalanceCheckTool: (agent: AgentRuntime) => StructuredTool;
/**
 * Creates a contract call tool for Aptos
 *
 * @param agent - The agent runtime
 * @returns The contract call tool
 */
export declare const createContractCallTool: (agent: AgentRuntime) => StructuredTool;
/**
 * Creates a contract read tool for Aptos
 *
 * @param agent - The agent runtime
 * @returns The contract read tool
 */
export declare const createContractReadTool: (agent: AgentRuntime) => StructuredTool;
/**
 * Creates all standard Aptos tools
 *
 * @param agent - The agent runtime
 * @returns Array of Aptos tools
 */
export declare const createAptosTools: (agent: AgentRuntime) => StructuredTool[];
export { z };
export { JouleFinanceDataTool, ChartVisualizationTool, XProfessionalPostTool, JouleKnowledgeBase };
