/**
 * Blockchain data fetcher for Joule Finance
 */
export declare class JouleBlockchainData {
    private client;
    private readonly JOULE_CONFIG_ADDRESS;
    private readonly JOULE_POOL_MODULE;
    private readonly JOULE_LENDING_MODULE;
    constructor();
    /**
     * Fetch TVL data from the blockchain
     */
    fetchTVL(): Promise<{
        total_tvl: number;
        change_percent: number;
        by_asset: Record<string, number>;
    }>;
    /**
     * Fetch APY rates from the blockchain
     */
    fetchAPYRates(): Promise<{
        lending_rates: Record<string, number>;
        borrowing_rates: Record<string, number>;
    }>;
    /**
     * Extract asset type from resource type
     */
    private extractAssetTypeFromResource;
    /**
     * Convert asset amount to USD value
     */
    private convertToUSD;
}
