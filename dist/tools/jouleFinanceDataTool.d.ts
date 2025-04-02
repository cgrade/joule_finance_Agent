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
export interface AssetData {
    tvl: number;
    apr: number;
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
     * Provides fallback data based on current Joule Finance metrics
     * Updated with real data from the website
     */
    private getFallbackData;
    /**
     * Generate realistic asset distribution based on TVL
     */
    private generateAssetDistribution;
}
