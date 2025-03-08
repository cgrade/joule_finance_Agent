"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AptosClient = void 0;
// Direct Aptos blockchain client
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const config_1 = __importDefault(require("../config"));
class AptosClient {
    constructor(endpoint) {
        this.endpoint = endpoint || config_1.default.aptos?.nodeUrl || "https://fullnode.mainnet.aptoslabs.com/v1";
    }
    /**
     * Call a view function on the blockchain
     */
    async callViewFunction(address, module, func, typeArgs = [], args = []) {
        try {
            console.log(chalk_1.default.yellow(`Calling ${module}::${func} on ${address}...`));
            const viewFunctionUrl = `${this.endpoint}/view`;
            const viewFunctionPayload = {
                function: `${address}::${module}::${func}`,
                type_arguments: typeArgs,
                arguments: args
            };
            const response = await axios_1.default.post(viewFunctionUrl, viewFunctionPayload);
            return response.data;
        }
        catch (error) {
            console.error(chalk_1.default.red(`Failed to call ${module}::${func}:`), error.message);
            if (error.response?.data) {
                console.error(chalk_1.default.red("Response data:"), error.response.data);
            }
            throw error;
        }
    }
    /**
     * Get resources for an account
     */
    async getResources(address) {
        try {
            console.log(chalk_1.default.yellow(`Fetching resources for ${address}...`));
            const url = `${this.endpoint}/accounts/${address}/resources`;
            const response = await axios_1.default.get(url);
            return response.data;
        }
        catch (error) {
            console.error(chalk_1.default.red(`Failed to get resources for ${address}:`), error.message);
            throw error;
        }
    }
}
exports.AptosClient = AptosClient;
exports.default = AptosClient;
//# sourceMappingURL=aptos-client.js.map