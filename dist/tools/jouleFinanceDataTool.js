import axios from "axios";
import chalk from "chalk";
import config from "../config.js";
export class JouleFinanceDataTool {
    runtime;
    endpoint;
    contractAddress = "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6";
    // Hardcoded values (moved from scraper.ts)
    FALLBACK_TVL = 8442656.94;
    FALLBACK_MARKET_SIZE = 20276452.75;
    FALLBACK_BORROWED = 11833795.80;
    FALLBACK_APR = 5.21;
    FALLBACK_USERS = 3200;
    constructor(runtime) {
        this.runtime = runtime;
        this.endpoint = config.APTOS_ENDPOINT || "https://fullnode.mainnet.aptoslabs.com/v1";
        console.log(`Initialized Joule Finance data tool with endpoint: ${this.endpoint}`);
    }
    async getData() {
        console.log(chalk.blue("🔍 Fetching Joule Finance data..."));
        // Skip blockchain query and go straight to fallback data
        console.log(chalk.yellow("⚠️ Using hardcoded data for Joule Finance (blockchain query disabled)"));
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
            console.log(chalk.blue("🔍 Querying Aptos blockchain..."));
            // Get resources from the contract
            const resourcesUrl = `${this.endpoint}/accounts/${this.contractAddress}/resources`;
            const response = await axios.get(resourcesUrl, {
                timeout: 10000 // 10 second timeout
            });
            if (response.data && Array.isArray(response.data)) {
                const resources = response.data;
                console.log(chalk.green(`✅ Found ${resources.length} resources on chain`));
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
                    const blockchainInfo = await axios.get(this.endpoint);
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
            console.error(chalk.red("❌ Error processing blockchain data:"), error);
            return null;
        }
    }
    /**
     * Provides fallback data based on current Joule Finance metrics
     * Updated with real data from the website
     */
    getFallbackData() {
        // Updated TVL from website: $8,442,656.94
        const tvl = this.FALLBACK_TVL;
        // Asset data updated directly from the Joule Finance website
        const assets = {
            'USDC': {
                tvl: 5400000,
                apr: 6.02
            },
            'USDt': {
                tvl: 4880000,
                apr: 6.22
            },
            'TruAPT': {
                tvl: 3740000,
                apr: 0.00
            },
            'APT': {
                tvl: 2120000,
                apr: 3.52
            },
            'WETH': {
                tvl: 816210,
                apr: 1.87
            },
            'amAPT': {
                tvl: 1270,
                apr: 3.12
            },
            'stAPT': {
                tvl: 3130000,
                apr: 0.72
            },
            'WBTC': {
                tvl: 22220,
                apr: 2.00
            },
            'aBTC': {
                tvl: 198.29,
                apr: 37.73
            },
            'eAPT': {
                tvl: 128220,
                apr: 0.12
            },
            'sthAPT': {
                tvl: 107.67,
                apr: 0.00
            },
            'USDC_LZ': {
                tvl: 27130,
                apr: 6.04
            },
            'USDT_LZ': {
                tvl: 6710,
                apr: 5.24
            }
        };
        // Calculate weighted average APR
        let totalValue = 0;
        let weightedApr = 0;
        Object.values(assets).forEach(asset => {
            totalValue += asset.tvl;
            weightedApr += asset.tvl * asset.apr;
        });
        const avgApr = weightedApr / totalValue;
        // Total protocol stats from website
        return {
            tvl: tvl,
            apr: avgApr,
            assets: assets,
            users: 4200, // Estimated active users
            volume24h: 1250000, // Estimated 24h volume
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
