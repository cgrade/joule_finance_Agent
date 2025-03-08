import { MarketData } from "../tools/jouleFinanceDataTool";
/**
 * Generates a post using pre-defined analytical templates and market data
 * No LLM involvement to ensure reliability
 */
declare function generatePostWithData(_: any, // Unused openai client
prompt: string, marketData: MarketData): Promise<string>;
export { generatePostWithData };
