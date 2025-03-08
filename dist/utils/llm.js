"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLLM = void 0;
const anthropic_1 = require("langchain/chat_models/anthropic");
const config_1 = __importDefault(require("../config"));
/**
 * Get configured LLM instance for the agent
 */
const getLLM = () => {
    try {
        return new anthropic_1.ChatAnthropic({
            temperature: config_1.default.llm.temperature,
            model: config_1.default.llm.model,
            apiKey: config_1.default.llm.apiKey,
        });
    }
    catch (error) {
        console.error('Failed to initialize LLM:', error);
        throw new Error(`LLM initialization failed: ${error.message}`);
    }
};
exports.getLLM = getLLM;
exports.default = exports.getLLM;
//# sourceMappingURL=llm.js.map