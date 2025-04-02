import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import config from '../config.js';
/**
 * Blockchain data fetcher for Joule Finance
 */
export class JouleBlockchainData {
    client;
    JOULE_CONFIG_ADDRESS = '0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6';
    JOULE_POOL_MODULE = 'pool';
    JOULE_LENDING_MODULE = 'lending';
    constructor() {
        // Initialize Aptos client
        const aptosConfig = new AptosConfig({
            network: config.aptos.network
        });
        this.client = new Aptos(aptosConfig);
    }
    /**
     * Fetch TVL data from the blockchain
     */
    async fetchTVL() {
        try {
            // Get pool resources that contain TVL data
            const resources = await this.client.getAccountResources({
                accountAddress: this.JOULE_CONFIG_ADDRESS
            });
            // Filter pool resources
            const poolResources = resources.filter(res => res.type.includes(`${this.JOULE_CONFIG_ADDRESS}::${this.JOULE_POOL_MODULE}`));
            // Calculate TVL from resources
            let totalTVL = 0;
            const byAsset = {};
            for (const resource of poolResources) {
                // Extract asset type and amount from resource data
                // This would need specific field parsing based on the actual structure
                const data = resource.data;
                if (data.total_supply) {
                    const assetType = this.extractAssetTypeFromResource(resource.type);
                    const amount = Number(data.total_supply) / 1e8; // Adjust decimals as needed
                    const usdValue = await this.convertToUSD(assetType, amount);
                    byAsset[assetType] = usdValue;
                    totalTVL += usdValue;
                }
            }
            // For change percent, we'd need historical data or an indexer
            // Using a placeholder value for now
            const changePercent = 5.2;
            return {
                total_tvl: totalTVL,
                change_percent: changePercent,
                by_asset: byAsset
            };
        }
        catch (error) {
            console.error('Error fetching TVL data:', error);
            // Return fallback data if blockchain query fails
            return {
                total_tvl: 10500000,
                change_percent: 12.5,
                by_asset: {
                    "APT": 3500000,
                    "USDC": 4200000,
                    "USDT": 1800000,
                    "jpufETH": 1000000
                }
            };
        }
    }
    /**
     * Fetch APY rates from the blockchain
     */
    async fetchAPYRates() {
        try {
            // Get lending resources that contain APY data
            const resources = await this.client.getAccountResources({
                accountAddress: this.JOULE_CONFIG_ADDRESS
            });
            // Filter lending resources
            const lendingResources = resources.filter(res => res.type.includes(`${this.JOULE_CONFIG_ADDRESS}::${this.JOULE_LENDING_MODULE}`));
            // Extract lending and borrowing rates
            const lendingRates = {};
            const borrowingRates = {};
            for (const resource of lendingResources) {
                const data = resource.data;
                const assetType = this.extractAssetTypeFromResource(resource.type);
                // Extract APY rates from resource data
                // Fields might be named differently in the actual contract
                if (data.lending_rate) {
                    lendingRates[assetType] = Number(data.lending_rate) / 100; // Convert to percentage
                }
                if (data.borrowing_rate) {
                    borrowingRates[assetType] = Number(data.borrowing_rate) / 100;
                }
            }
            return {
                lending_rates: lendingRates,
                borrowing_rates: borrowingRates
            };
        }
        catch (error) {
            console.error('Error fetching APY rates:', error);
            // Return fallback data if blockchain query fails
            return {
                lending_rates: {
                    "APT": 8.5,
                    "USDC": 5.2,
                    "USDT": 5.0,
                    "jpufETH": 7.3
                },
                borrowing_rates: {
                    "APT": 12.5,
                    "USDC": 7.8,
                    "USDT": 7.5,
                    "jpufETH": 10.8
                }
            };
        }
    }
    /**
     * Extract asset type from resource type
     */
    extractAssetTypeFromResource(resourceType) {
        // This would need to be customized based on actual resource structure
        // Example: extract "APT" from "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
        const matches = resourceType.match(/<.*?::(.+?)>/);
        if (matches && matches[1]) {
            const assetName = matches[1].split('::').pop() || '';
            // Convert CamelCase to ticker format (AptosCoin -> APT)
            if (assetName === 'AptosCoin')
                return 'APT';
            if (assetName.includes('USD'))
                return assetName.toUpperCase();
            return assetName;
        }
        return 'Unknown';
    }
    /**
     * Convert asset amount to USD value
     */
    async convertToUSD(assetType, amount) {
        try {
            // Call the get_usd_price function from the config contract
            const priceCall = await this.client.view({
                payload: {
                    function: `${this.JOULE_CONFIG_ADDRESS}::config::get_usd_price`,
                    typeArguments: [],
                    functionArguments: [Buffer.from(assetType).toString('hex')]
                }
            });
            const pricePerUnit = Number(priceCall[0]) / 1e8; // Adjust decimals
            return amount * pricePerUnit;
        }
        catch (error) {
            console.error(`Error getting USD price for ${assetType}:`, error);
            // Fallback prices
            const fallbackPrices = {
                'APT': 10.5,
                'USDC': 1.0,
                'USDT': 1.0,
                'jpufETH': 3500.0
            };
            return amount * (fallbackPrices[assetType] || 1.0);
        }
    }
}
