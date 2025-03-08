"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JouleFinanceDataTool = void 0;
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const config_1 = __importDefault(require("../config"));
class JouleFinanceDataTool {
    constructor(runtime) {
        this.runtime = runtime;
        this.contractAddress = "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6";
        // Hardcoded values (moved from scraper.ts)
        this.FALLBACK_TVL = 9949126.35;
        this.FALLBACK_MARKET_SIZE = 12500000;
        this.FALLBACK_BORROWED = 2550873.65;
        this.FALLBACK_APR = 3.87;
        this.FALLBACK_USERS = 2800;
        this.endpoint = config_1.default.APTOS_ENDPOINT || "https://fullnode.mainnet.aptoslabs.com/v1";
        console.log(`Initialized Joule Finance data tool with endpoint: ${this.endpoint}`);
    }
    async getData() {
        console.log(chalk_1.default.blue("🔍 Fetching Joule Finance data..."));
        // Skip blockchain query and go straight to fallback data
        console.log(chalk_1.default.yellow("⚠️ Using hardcoded data for Joule Finance (blockchain query disabled)"));
        return this.getFallbackData();
        /*
        // Original blockchain query code (commented out as requested)
        try {
          console.log("Attempting to fetch blockchain data...");
          const blockchainData = await this.fetchBlockchainData();
          
          if (blockchainData) {
            console.log(chalk.green("✅ Successfully retrieved blockchain data"));
            return blockchainData;
          }
        } catch (error: unknown) {
          console.error(chalk.red("❌ Error fetching blockchain data:"),
            error instanceof Error ? error.message : String(error));
        }
    
        // Step 2: Fall back to reliable hardcoded values
        console.log(chalk.yellow("⚠️ Using fallback data for Joule Finance"));
        return this.getFallbackData();
        */
    }
    /**
     * Attempt to fetch data directly from the Aptos blockchain
     * (Keeping this method for future use but not calling it)
     */
    async fetchBlockchainData() {
        // Original blockchain query code (unchanged)
        try {
            console.log(chalk_1.default.blue("🔍 Querying Aptos blockchain..."));
            // Get resources from the contract
            const resourcesUrl = `${this.endpoint}/accounts/${this.contractAddress}/resources`;
            const response = await axios_1.default.get(resourcesUrl, {
                timeout: 10000 // 10 second timeout
            });
            if (response.data && Array.isArray(response.data)) {
                const resources = response.data;
                console.log(chalk_1.default.green(`✅ Found ${resources.length} resources on chain`));
                // Process resources to extract TVL, users, etc.
                // This is a simplified version that extracts what we can from the blockchain
                // Extract coin resources for TVL calculation
                const coinResources = resources.filter((r) => r.type.includes("::coin::CoinStore<"));
                // Calculate total TVL from coin resources
                let totalTVL = 0;
                const assets = {};
                // Simplified token price mapping (in production, you'd get this from an oracle)
                const tokenPrices = {
                    "AptosCoin": 6.02,
                    "USDC": 1.0,
                    "USDT": 1.0,
                    "WETH": 3400.0,
                    "BTC": 62000.0
                };
                // Process each coin resource
                for (const coin of coinResources) {
                    const match = coin.type.match(/<([^>]+)>/);
                    const fullPath = match ? match[1] : 'unknown';
                    const pathParts = fullPath.split('::');
                    const symbol = pathParts.length > 2 ? pathParts[2] : 'unknown';
                    const value = parseInt(coin.data?.coin?.value || '0') / 100000000; // Convert from 8 decimals
                    // Skip assets with zero balance
                    if (value <= 0)
                        continue;
                    const price = tokenPrices[symbol] || 1.0; // Default to 1.0 if unknown
                    const tvl = value * price;
                    // Generate realistic APR based on token type
                    let apr = 0;
                    if (symbol === "AptosCoin")
                        apr = 5.5;
                    else if (symbol === "USDC" || symbol === "USDT")
                        apr = 4.0;
                    else if (symbol === "WETH")
                        apr = 2.8;
                    else if (symbol === "BTC")
                        apr = 2.5;
                    else
                        apr = 3.2;
                    totalTVL += tvl;
                    assets[symbol] = {
                        symbol,
                        tvl,
                        apr
                    };
                }
                // If we found a reasonable TVL value on chain, create a MarketData object
                if (totalTVL > 0) {
                    // Get blockchain timestamp for proof
                    const blockchainInfo = await axios_1.default.get(this.endpoint);
                    const ledgerVersion = blockchainInfo.data?.ledger_version || "unknown";
                    // Calculate weighted average APR
                    let totalWeightedAPR = 0;
                    let totalWeight = 0;
                    for (const asset of Object.values(assets)) {
                        totalWeightedAPR += asset.apr * asset.tvl;
                        totalWeight += asset.tvl;
                    }
                    const averageAPR = totalWeight > 0 ? totalWeightedAPR / totalWeight : this.FALLBACK_APR;
                    // Estimate users and volume based on TVL
                    const estimatedUsers = Math.floor(totalTVL / 10000); // Assume average $10k per user
                    const dailyVolumeEstimate = totalTVL * 0.08; // Assume 8% daily volume
                    return {
                        tvl: totalTVL,
                        apr: averageAPR,
                        users: estimatedUsers,
                        volume24h: dailyVolumeEstimate,
                        assets,
                        dataSource: "blockchain",
                        lastUpdated: new Date().toISOString(),
                        blockchainProof: `Ledger Version: ${ledgerVersion}`
                    };
                }
            }
            return null;
        }
        catch (error) {
            console.error(chalk_1.default.red("❌ Error processing blockchain data:"), error);
            return null;
        }
    }
    /**
     * Get reliable fallback data directly from hardcoded values
     */
    getFallbackData() {
        // Calculate some derived values from our hardcoded constants
        const tvl = this.FALLBACK_TVL;
        const apr = this.FALLBACK_APR;
        const users = this.FALLBACK_USERS;
        const volume24h = tvl * 0.08; // Estimated daily volume as 8% of TVL
        // Generate asset breakdown with realistic distribution
        const assets = this.generateAssetDistribution(tvl);
        return {
            tvl,
            apr,
            users,
            volume24h,
            assets,
            dataSource: "fallback",
            lastUpdated: new Date().toISOString()
        };
    }
    /**
     * Generate realistic asset distribution based on TVL
     */
    generateAssetDistribution(tvl) {
        // Realistic distribution based on market research
        const distribution = {
            "USDC": { share: 42, apr: 4.2 },
            "USDT": { share: 26, apr: 4.0 },
            "WETH": { share: 15, apr: 2.8 },
            "BTC": { share: 8, apr: 2.5 },
            "APT": { share: 7, apr: 5.5 },
            "Other": { share: 2, apr: 3.2 }
        };
        const assets = {};
        // Calculate TVL for each asset based on its share
        for (const [symbol, data] of Object.entries(distribution)) {
            const assetTvl = tvl * (data.share / 100);
            assets[symbol] = {
                tvl: assetTvl,
                apr: data.apr
            };
        }
        return assets;
    }
}
exports.JouleFinanceDataTool = JouleFinanceDataTool;
//# sourceMappingURL=jouleFinanceDataTool.js.map