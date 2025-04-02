// Direct Aptos blockchain client
import chalk from "chalk";
import config from "../config.js";
export class AptosClient {
    endpoint;
    constructor(endpoint) {
        this.endpoint = endpoint || config.aptos?.nodeUrl || "https://fullnode.mainnet.aptoslabs.com/v1";
    }
    /**
     * Call a view function on the blockchain
     */
    async callViewFunction(address, module, func, typeArgs = [], args = []) {
        try {
            console.log(chalk.yellow(`Calling ${module}::${func} on ${address}...`));
            const { default: axios } = await import('axios');
            const viewFunctionUrl = `${this.endpoint}/view`;
            const viewFunctionPayload = {
                function: `${address}::${module}::${func}`,
                type_arguments: typeArgs,
                arguments: args
            };
            const response = await axios.post(viewFunctionUrl, viewFunctionPayload);
            return response.data;
        }
        catch (error) {
            console.error(chalk.red(`Failed to call ${module}::${func}:`), error.message);
            if (error.response?.data) {
                console.error(chalk.red("Response data:"), error.response.data);
            }
            throw error;
        }
    }
    /**
     * Get resources for an account
     */
    async getResources(address) {
        try {
            console.log(chalk.yellow(`Fetching resources for ${address}...`));
            const { default: axios } = await import('axios');
            const url = `${this.endpoint}/accounts/${address}/resources`;
            const response = await axios.get(url);
            return response.data;
        }
        catch (error) {
            console.error(chalk.red(`Failed to get resources for ${address}:`), error.message);
            throw error;
        }
    }
}
export default AptosClient;
