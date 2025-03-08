"use strict";
/**
 * Aptos Tools for Move Agent Kit
 *
 * This module provides standard tools for interacting with the Aptos blockchain
 * through the Move Agent Kit.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JouleKnowledgeBase = exports.XProfessionalPostTool = exports.ChartVisualizationTool = exports.JouleFinanceDataTool = exports.z = exports.createAptosTools = exports.createContractReadTool = exports.createContractCallTool = exports.createBalanceCheckTool = exports.createTokenTransferTool = void 0;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
Object.defineProperty(exports, "z", { enumerable: true, get: function () { return zod_1.z; } });
const logger_1 = require("../utils/logger");
const jouleFinance_1 = __importDefault(require("./jouleFinance"));
exports.JouleFinanceDataTool = jouleFinance_1.default;
const visualization_1 = __importDefault(require("./visualization"));
exports.ChartVisualizationTool = visualization_1.default;
const socialMedia_1 = __importDefault(require("./socialMedia"));
exports.XProfessionalPostTool = socialMedia_1.default;
const knowledgeBase_1 = __importDefault(require("./knowledgeBase"));
exports.JouleKnowledgeBase = knowledgeBase_1.default;
/**
 * Creates a token transfer tool for Aptos
 *
 * @param agent - The agent runtime
 * @returns The token transfer tool
 */
const createTokenTransferTool = (agent) => {
    return new (class extends tools_1.StructuredTool {
        constructor() {
            super(...arguments);
            this.name = "aptos_transfer_token";
            this.description = `
    This tool can be used to transfer APT or other tokens to a recipient.
    
    Inputs:
    to: string, the recipient address (required)
    amount: number, the amount to transfer (required)
    asset: string, the asset type (optional, defaults to "APT")
    `;
            this.schema = zod_1.z.object({
                to: zod_1.z.string(),
                amount: zod_1.z.number().positive(),
                asset: zod_1.z.string().optional()
            });
        }
        async _call({ to, amount, asset = "APT" }) {
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
            }
            catch (error) {
                logger_1.logger.error('Error transferring tokens:', error);
                return JSON.stringify({
                    success: false,
                    error: error.message
                });
            }
        }
    })();
};
exports.createTokenTransferTool = createTokenTransferTool;
/**
 * Creates a balance check tool for Aptos
 *
 * @param agent - The agent runtime
 * @returns The balance check tool
 */
const createBalanceCheckTool = (agent) => {
    return new (class extends tools_1.StructuredTool {
        constructor() {
            super(...arguments);
            this.name = "aptos_get_balance";
            this.description = `
    This tool can be used to check the balance of an address.
    
    Inputs:
    address: string, the address to check (optional, defaults to own address)
    asset: string, the asset type (optional, defaults to "APT")
    `;
            this.schema = zod_1.z.object({
                address: zod_1.z.string().optional(),
                asset: zod_1.z.string().optional()
            });
        }
        async _call({ address, asset = "APT" }) {
            try {
                const balance = await agent.getBalance(address);
                return JSON.stringify({
                    success: true,
                    address: address || await agent.getAddress(),
                    balance,
                    asset
                });
            }
            catch (error) {
                return JSON.stringify({
                    success: false,
                    error: error.message
                });
            }
        }
    });
};
exports.createBalanceCheckTool = createBalanceCheckTool;
/**
 * Creates a contract call tool for Aptos
 *
 * @param agent - The agent runtime
 * @returns The contract call tool
 */
const createContractCallTool = (agent) => {
    return new (class extends tools_1.StructuredTool {
        constructor() {
            super(...arguments);
            this.name = "aptos_execute_call";
            this.description = `
    This tool can be used to execute a smart contract call on Aptos.
    
    Inputs:
    function: string, the function to call (required)
    typeArgs: array, the type arguments to pass (optional)
    args: array, the arguments to pass (optional)
    `;
            this.schema = zod_1.z.object({
                function: zod_1.z.string(),
                typeArgs: zod_1.z.array(zod_1.z.string()).optional(),
                args: zod_1.z.array(zod_1.z.any()).optional()
            });
        }
        async _call({ function: func, typeArgs = [], args = [] }) {
            try {
                // First simulate to check for errors
                const simulation = await agent.simulateCall(func, typeArgs, args);
                // Check for simulation errors
                if (simulation[0].vm_status !== 'Executed successfully') {
                    return JSON.stringify({
                        success: false,
                        error: `Simulation failed: ${simulation[0].vm_status}`,
                        simulation: simulation[0]
                    });
                }
                // If simulation succeeds, execute the transaction
                const pendingTx = await agent.executeCall(func, typeArgs, args);
                // Wait for transaction confirmation
                const result = await agent.waitForTransaction(pendingTx.hash);
                return JSON.stringify({
                    success: true,
                    hash: result.hash,
                    sender: await agent.getAddress(),
                    function: func,
                    status: result.vm_status
                });
            }
            catch (error) {
                return JSON.stringify({
                    success: false,
                    error: error.message
                });
            }
        }
    });
};
exports.createContractCallTool = createContractCallTool;
/**
 * Creates a contract read tool for Aptos
 *
 * @param agent - The agent runtime
 * @returns The contract read tool
 */
const createContractReadTool = (agent) => {
    return new (class extends tools_1.StructuredTool {
        constructor() {
            super(...arguments);
            this.name = "aptos_read_contract";
            this.description = `
    This tool can be used to read data from a contract on Aptos using a view function.
    
    Inputs:
    function: string, the view function to call (required)
    typeArguments: array, the type arguments to pass (optional)
    arguments: array, the arguments to pass (optional)
    `;
            this.schema = zod_1.z.object({
                function: zod_1.z.string(),
                typeArguments: zod_1.z.array(zod_1.z.string()).optional(),
                functionArguments: zod_1.z.array(zod_1.z.any()).optional()
            });
        }
        async _call({ function: func, typeArguments = [], functionArguments = [] }) {
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
            }
            catch (error) {
                return JSON.stringify({
                    success: false,
                    error: error.message
                });
            }
        }
    })();
};
exports.createContractReadTool = createContractReadTool;
/**
 * Creates all standard Aptos tools
 *
 * @param agent - The agent runtime
 * @returns Array of Aptos tools
 */
const createAptosTools = (agent) => {
    return [
        (0, exports.createTokenTransferTool)(agent),
        (0, exports.createBalanceCheckTool)(agent),
        (0, exports.createContractCallTool)(agent),
        (0, exports.createContractReadTool)(agent)
    ];
};
exports.createAptosTools = createAptosTools;
//# sourceMappingURL=index.js.map