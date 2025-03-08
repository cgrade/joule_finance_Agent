// Direct Aptos blockchain client
import axios from "axios";
import chalk from "chalk";
import config from "../config";

export class AptosClient {
  private readonly endpoint: string;
  
  constructor(endpoint?: string) {
    this.endpoint = endpoint || config.aptos?.nodeUrl || "https://fullnode.mainnet.aptoslabs.com/v1";
  }
  
  /**
   * Call a view function on the blockchain
   */
  async callViewFunction(address: string, module: string, func: string, typeArgs: string[] = [], args: any[] = []): Promise<any> {
    try {
      console.log(chalk.yellow(`Calling ${module}::${func} on ${address}...`));
      
      const viewFunctionUrl = `${this.endpoint}/view`;
      const viewFunctionPayload = {
        function: `${address}::${module}::${func}`,
        type_arguments: typeArgs,
        arguments: args
      };
      
      const response = await axios.post(viewFunctionUrl, viewFunctionPayload);
      return response.data;
    } catch (error: any) {
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
  async getResources(address: string): Promise<any[]> {
    try {
      console.log(chalk.yellow(`Fetching resources for ${address}...`));
      
      const url = `${this.endpoint}/accounts/${address}/resources`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: any) {
      console.error(chalk.red(`Failed to get resources for ${address}:`), error.message);
      throw error;
    }
  }
}

export default AptosClient; 