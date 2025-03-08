import axios from "axios";
import chalk from "chalk";
import config from "../config";

// Define interfaces locally
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

export class JouleFinanceDataTool implements BlockchainDataTool {
  private endpoint: string;
  private contractAddress: string = "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6";

  // Hardcoded values (moved from scraper.ts)
  private readonly FALLBACK_TVL = 9949126.35;
  private readonly FALLBACK_MARKET_SIZE = 12500000;
  private readonly FALLBACK_BORROWED = 2550873.65;
  private readonly FALLBACK_APR = 3.87;
  private readonly FALLBACK_USERS = 2800;

  constructor(private runtime?: any) {
    this.endpoint = config.APTOS_ENDPOINT || "https://fullnode.mainnet.aptoslabs.com/v1";
    console.log(`Initialized Joule Finance data tool with endpoint: ${this.endpoint}`);
  }

  async getData(): Promise<MarketData> {
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
  private async fetchBlockchainData(): Promise<MarketData | null> {
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
        const coinResources = resources.filter((r: any) => 
          r.type.includes("::coin::CoinStore<")
        );
        
        // Calculate total TVL from coin resources
        let totalTVL = 0;
        const assets: Record<string, any> = {};
        
        // Simplified token price mapping (in production, you'd get this from an oracle)
        const tokenPrices: Record<string, number> = {
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
          if (value <= 0) continue;
          
          const price = tokenPrices[symbol] || 1.0; // Default to 1.0 if unknown
          const tvl = value * price;
          
          // Generate realistic APR based on token type
          let apr = 0;
          if (symbol === "AptosCoin") apr = 5.5;
          else if (symbol === "USDC" || symbol === "USDT") apr = 4.0;
          else if (symbol === "WETH") apr = 2.8;
          else if (symbol === "BTC") apr = 2.5;
          else apr = 3.2;
          
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
    } catch (error) {
      console.error(chalk.red("❌ Error processing blockchain data:"), error);
      return null;
    }
  }

  /**
   * Provides fallback data based on current Joule Finance metrics
   * Updated with real data from the website
   */
  private getFallbackData(): MarketData {
    // Updated TVL from website: $9,504,135.67
    const tvl = 9504135.67;
    
    // Calculate blended APR from the asset data
    // Use the regular lending APR, not the boosted values
    const assets: Record<string, AssetData> = {
      'USDC': {
        tvl: 4900000,
        apr: 5.99
      },
      'USDT': {
        tvl: 4880000,
        apr: 6.22
      },
      'APT': {
        tvl: 2440000, 
        apr: 5.74
      },
      'WETH': {
        tvl: 987930, 
        apr: 1.73
      },
      'stAPT': {
        tvl: 3340000, 
        apr: 0.73
      },
      'WBTC': {
        tvl: 22960, 
        apr: 2.02
      },
      'eAPT': {
        tvl: 153400, 
        apr: 0.12
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
  private generateAssetDistribution(tvl: number): Record<string, any> {
    // Realistic distribution based on market research
    const distribution = {
      "USDC": { share: 42, apr: 4.2 },
      "USDT": { share: 26, apr: 4.0 },
      "WETH": { share: 15, apr: 2.8 },
      "BTC": { share: 8, apr: 2.5 },
      "APT": { share: 7, apr: 5.5 },
      "Other": { share: 2, apr: 3.2 }
    };
    
    const assets: Record<string, any> = {};
    
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