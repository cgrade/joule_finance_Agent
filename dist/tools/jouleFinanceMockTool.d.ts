import { AgentRuntime } from "../agent/runtime.js";
interface AssetData {
    price: number;
    tvl: number;
    apr: number;
}
interface MarketData {
    tvl: number;
    apr: number;
    users: number;
    volume24h: number;
    assets: Record<string, AssetData>;
    dataSource: "blockchain" | "error" | "simulated";
    error?: string;
    lastUpdated?: string;
    blockchainProof?: string;
}
export declare class JouleFinanceDataTool {
    private agentRuntime?;
    private readonly apiEndpoint;
    private aptosClient;
    private readonly allowMockData;
    constructor(agentRuntime?: AgentRuntime | undefined, options?: {
        allowMockData?: boolean;
    });
    /**
     * Get finance data from Joule Finance on Aptos blockchain
     */
    getData(): Promise<MarketData>;
}
export {};
