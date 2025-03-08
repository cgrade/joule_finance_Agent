export interface MarketData {
    tvl: number;
    apr: number;
    users: number;
    volume24h: number;
    assets: Record<string, any>;
    dataSource: "blockchain" | "fallback";
    lastUpdated: string;
    blockchainProof?: string;
}
export interface BlockchainDataTool {
    getData(): Promise<MarketData>;
}
export declare class JouleFinanceDataTool implements BlockchainDataTool {
    private runtime?;
    private endpoint;
    private contractAddress;
    private readonly FALLBACK_TVL;
    private readonly FALLBACK_MARKET_SIZE;
    private readonly FALLBACK_BORROWED;
    private readonly FALLBACK_APR;
    private readonly FALLBACK_USERS;
    constructor(runtime?: any | undefined);
    getData(): Promise<MarketData>;
    /**
     * Attempt to fetch data directly from the Aptos blockchain
     * (Keeping this method for future use but not calling it)
     */
    private fetchBlockchainData;
    /**
     * Get reliable fallback data directly from hardcoded values
     */
    private getFallbackData;
    /**
     * Generate realistic asset distribution based on TVL
     */
    private generateAssetDistribution;
}
