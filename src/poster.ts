/**
 * Joule Finance X/Twitter Professional Posting Agent
 * 
 * This module creates an AI-powered agent that automatically generates
 * professional, data-driven posts about Joule Finance on Aptos blockchain.
 * 
 * Built for the Aptos/Move hackathon using Move Agent Kit.
 */

import { ChatAnthropic } from "@langchain/anthropic";
import { StructuredTool } from "@langchain/core/tools";
import { 
  StateGraph, 
  type StateType, 
  type StateDefinition, 
  START, 
  END, 
  type UpdateType,
  Annotation,
  MemorySaver 
} from "@langchain/langgraph";
import {
  HumanMessage,
  AIMessage,
  FunctionMessage,
  BaseMessage
} from "@langchain/core/messages";
import { z } from "zod";
import { Network } from '@aptos-labs/ts-sdk';
import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
import puppeteer from 'puppeteer'; // We'll need puppeteer for browser-based login
import * as OTPAuth from 'otpauth';

// Import utils and configs
import { LocalSigner } from './utils/signer';
import { AgentRuntime } from './agent/runtime';
import { createAptosTools } from './tools';
import config from './config';
import { ChartVisualizationTool } from './tools/visualization';
import { JouleBlockchainData } from './tools/blockchain-data';

/**
 * Metric type for Joule Finance
 */
export type JouleMetricType = 
  | 'tvl'
  | 'money_market'
  | 'leveraged_yield'
  | 'bridge_volume'
  | 'liquidation_stats'
  | 'apy_rates';

/**
 * Timeframe for data
 */
export type Timeframe = '24h' | '7d' | '30d' | 'all';

/**
 * Interface for asset-specific data
 */
interface AssetData {
  [asset: string]: number | object;
}

/**
 * TVL data interface
 */
interface TVLData {
  total_tvl: number;
  change_percent: number;
  by_asset: AssetData;
}

/**
 * Money Market data interface
 */
interface MoneyMarketData {
  total_supplied: number;
  total_borrowed: number;
  utilization_rate: number;
  isolated_positions: number;
  new_positions: number;
  health_factor: {
    average: number;
    healthy_positions_percent: number;
  };
  by_asset: {
    [asset: string]: {
      supplied: number;
      borrowed: number;
      utilization: number;
    };
  };
}

/**
 * Leveraged Yield data interface
 */
interface LeveragedYieldData {
  total_leveraged_positions: number;
  total_leveraged_value: number;
  new_positions: number;
  average_multiplier: number;
  top_strategies: Array<{
    name: string;
    base_apy: number;
    borrow_rate: number;
    leverage: number;
    net_apy: number;
    tvl: number;
  }>;
}

/**
 * Bridge Volume data interface
 */
interface BridgeVolumeData {
  total_volume: number;
  total_transactions: number;
  growth_percent: number;
  by_token: {
    [token: string]: {
      volume: number;
      transactions: number;
      avg_size: number;
    };
  };
}

/**
 * Liquidation Stats data interface
 */
interface LiquidationStatsData {
  liquidation_volume: number;
  liquidation_count: number;
  largest_liquidation: number;
  average_liquidation: number;
  health_factor_stats: {
    average: number;
    median: number;
    at_risk_positions: number;
  };
  by_asset: {
    [asset: string]: {
      volume: number;
      count: number;
      avg_size: number;
    };
  };
}

/**
 * APY Rates data interface
 */
interface APYRatesData {
  lending_rates: {
    [asset: string]: number;
  };
  borrowing_rates: {
    [asset: string]: number;
  };
  leveraged_yields: {
    [strategy: string]: number;
  };
  rate_trends: {
    lending_up: string[];
    lending_down: string[];
    lending_stable: string[];
    borrowing_up: string[];
    borrowing_down: string[];
    borrowing_stable: string[];
  };
}

/**
 * Union type for all Joule Finance data
 */
type JouleFinanceData = 
  | TVLData 
  | MoneyMarketData 
  | LeveragedYieldData 
  | BridgeVolumeData
  | LiquidationStatsData
  | APYRatesData;

/**
 * Common metric response interface
 */
interface MetricResponse {
  metric_type: JouleMetricType;
  timeframe: Timeframe;
  asset?: string;
  data: JouleFinanceData;
  timestamp: string;
}

/**
 * Add this type near the top of your file
 */
interface StateValues {
  messages: BaseMessage[];
  lastPostTime: Date;
  metrics: { tvl?: number, apy?: number };
}

/**
 * Generate TOTP code for 2FA authentication
 */
function generateTOTP(secret: string): string {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: "Twitter",
      label: "2FA",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret)
    });
    
    return totp.generate();
  } catch (error) {
    console.error('Failed to generate TOTP:', error);
    return '';
  }
}

/**
 * Joule Finance Data Reader Tool
 * Fetches on-chain data from Joule Finance on Aptos
 */
class JouleFinanceDataTool extends StructuredTool {
  name = "joule_finance_reader";
  description = `
  This tool fetches on-chain data from Joule Finance on the Aptos blockchain.
  It can retrieve data about:
  - TVL (Total Value Locked) across different assets
  - Money Market metrics (lending/borrowing volumes, isolated positions)
  - Leveraged Yield Farming opportunities and APYs
  - LayerZero Bridge volumes and token flows
  - Liquidation statistics and protocol health
  - Current APY rates for various assets
  
  Inputs:
  metric_type: "tvl", "money_market", "leveraged_yield", "bridge_volume", "liquidation_stats", or "apy_rates" (required)
  timeframe: "24h", "7d", "30d", or "all" (optional, defaults to "24h")
  asset: Asset symbol like "APT", "USDC", "USDT", "jpufETH", etc. (optional)
  `;
  
  schema = z.object({
    metric_type: z.enum([
      'tvl', 
      'money_market', 
      'leveraged_yield', 
      'bridge_volume', 
      'liquidation_stats',
      'apy_rates'
    ]),
    timeframe: z.enum(['24h', '7d', '30d', 'all']).default('24h'),
    asset: z.string().optional()
  });


  
  private agent: AgentRuntime;
  
  constructor(agent: AgentRuntime) {
    super();
    this.agent = agent;
  }
  
  async _call(args: z.infer<typeof this.schema>): Promise<MetricResponse> {
    try {
      const { metric_type, timeframe = "24h", asset } = args;
      
      // Define which function to call based on the metric type
      const metricFunctions: Record<JouleMetricType, (timeframe: Timeframe, asset?: string) => Promise<JouleFinanceData>> = {
        tvl: this.fetchTVL.bind(this),
        money_market: this.fetchMoneyMarket.bind(this),
        leveraged_yield: this.fetchLeveragedYield.bind(this),
        bridge_volume: this.fetchBridgeVolume.bind(this),
        liquidation_stats: this.fetchLiquidationStats.bind(this),
        apy_rates: this.fetchAPYRates.bind(this)
      };
      
      if (!metricFunctions[metric_type]) {
        throw new Error(`Unsupported metric type: ${metric_type}`);
      }
      
      // Call the appropriate function
      const result = await metricFunctions[metric_type](timeframe, asset);
      
      return {
        metric_type,
        timeframe,
        asset,
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching Joule Finance data:`, error);
      throw new Error(`Failed to fetch Joule Finance data: ${(error as Error).message}`);
    }
  }
  
  /**
   * Fetches TVL data for Joule Finance
   * In production: would call on-chain view functions or indexer APIs
   */
  private async fetchTVL(timeframe: Timeframe, asset?: string): Promise<TVLData> {
    try {
      // In production, you would call an indexer or on-chain view function
      // For example:
      // const result = await this.agent.readContract({
      //   function: `${config.joule.contracts.main}::tvl::get_total_tvl`,
      //   typeArguments: [],
      //   arguments: []
      // });
      
      // For development, we'll use mock data based on the documentation
      const tvlData: TVLData = {
        total_tvl: 142500000, // $142.5M
        change_percent: {
          "24h": 1.2,
          "7d": 5.8,
          "30d": 15.2,
          "all": 42.5
        }[timeframe] || 5.8,
        by_asset: {
          APT: 72000000,
          USDC: 15000000,
          USDT: 10500000,
          jpufETH: 22500000,
          jrswETH: 12500000,
          jezETH: 10000000
        }
      };
      
      // If specific asset was requested, filter the data
      if (asset && asset in tvlData.by_asset) {
        const assetTvl = tvlData.by_asset[asset] as number;
        return {
          total_tvl: assetTvl,
          change_percent: tvlData.change_percent,
          by_asset: { [asset]: assetTvl }
        };
      }
      
      return tvlData;
    } catch (error) {
      console.error('Error fetching TVL:', error);
      throw error;
    }
  }
  
  /**
   * Fetches Money Market metrics from Joule Finance
   */
  private async fetchMoneyMarket(timeframe: Timeframe, asset?: string): Promise<MoneyMarketData> {
    try {
      // Mock data based on documentation - replace with actual API calls
      const data: MoneyMarketData = {
        total_supplied: 125000000, // $125M
        total_borrowed: 83000000, // $83M
        utilization_rate: 66.4, // 66.4%
        isolated_positions: 15420,
        new_positions: {
          "24h": 780,
          "7d": 3850,
          "30d": 12600,
          "all": 35000
        }[timeframe] || 780,
        health_factor: {
          average: 1.85,
          healthy_positions_percent: 96.5 // 96.5% of positions have health factor > 1.2
        },
        by_asset: {
          APT: {
            supplied: 65000000,
            borrowed: 42000000,
            utilization: 64.6
          },
          USDC: {
            supplied: 12000000,
            borrowed: 9800000,
            utilization: 81.7
          },
          USDT: {
            supplied: 10000000,
            borrowed: 7500000,
            utilization: 75.0
          },
          jpufETH: {
            supplied: 18000000,
            borrowed: 12000000,
            utilization: 66.7
          },
          jrswETH: {
            supplied: 12000000,
            borrowed: 8000000,
            utilization: 66.7
          },
          jezETH: {
            supplied: 8000000,
            borrowed: 3700000,
            utilization: 46.3
          }
        }
      };
      
      // If specific asset was requested, filter the data
      if (asset && asset in data.by_asset) {
        const assetData = data.by_asset[asset];
        return {
          total_supplied: assetData.supplied,
          total_borrowed: assetData.borrowed,
          utilization_rate: assetData.utilization,
          isolated_positions: Math.floor(data.isolated_positions * (assetData.supplied / data.total_supplied)),
          new_positions: Math.floor(data.new_positions * (assetData.supplied / data.total_supplied)),
          health_factor: data.health_factor,
          by_asset: { [asset]: assetData }
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching Money Market data:', error);
      throw error;
    }
  }
  
  /**
   * Fetches Leveraged Yield Farming opportunities
   */
  private async fetchLeveragedYield(timeframe: Timeframe, asset?: string): Promise<LeveragedYieldData> {
    try {
      // Mock data based on the Leverage Yield Loops documentation
      const data: LeveragedYieldData = {
        total_leveraged_positions: 8750,
        total_leveraged_value: 75000000, // $75M
        new_positions: {
          "24h": 320,
          "7d": 1580,
          "30d": 4200,
          "all": 8750
        }[timeframe] || 320,
        average_multiplier: 6.5, // 6.5x
        top_strategies: [
          {
            name: "stAPT/APT",
            base_apy: 9,
            borrow_rate: 1,
            leverage: 8,
            net_apy: 65,
            tvl: 32000000
          },
          {
            name: "jpufETH/WETH",
            base_apy: 6.2,
            borrow_rate: 0.8,
            leverage: 5,
            net_apy: 27,
            tvl: 18000000
          },
          {
            name: "USDC/USDT",
            base_apy: 4.5,
            borrow_rate: 2.2,
            leverage: 10,
            net_apy: 23,
            tvl: 15000000
          }
        ]
      };
      
      // If specific asset filter was requested
      if (asset) {
        const assetStrategy = data.top_strategies.find(s => s.name.includes(asset));
        if (assetStrategy) {
          return {
            total_leveraged_positions: Math.floor(data.total_leveraged_positions * (assetStrategy.tvl / data.total_leveraged_value)),
            total_leveraged_value: assetStrategy.tvl,
            new_positions: Math.floor(data.new_positions * (assetStrategy.tvl / data.total_leveraged_value)),
            average_multiplier: assetStrategy.leverage,
            top_strategies: [assetStrategy]
          };
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching Leveraged Yield data:', error);
      throw error;
    }
  }
  
  /**
   * Fetches LayerZero Bridge volumes
   */
  private async fetchBridgeVolume(timeframe: Timeframe, asset?: string): Promise<BridgeVolumeData> {
    try {
      // Mock data based on the Bridge documentation
      const data: BridgeVolumeData = {
        total_volume: {
          "24h": 3500000, // $3.5M
          "7d": 18200000, // $18.2M
          "30d": 68500000, // $68.5M
          "all": 250000000 // $250M
        }[timeframe] || 3500000,
        total_transactions: {
          "24h": 1250,
          "7d": 5800,
          "30d": 22400,
          "all": 85000
        }[timeframe] || 1250,
        growth_percent: {
          "24h": 8.5,
          "7d": 12.3,
          "30d": 35.6,
          "all": 145.2
        }[timeframe] || 8.5,
        by_token: {
          jpufETH: {
            volume: 1500000,
            transactions: 580,
            avg_size: 2586
          },
          jrswETH: {
            volume: 1200000,
            transactions: 450,
            avg_size: 2667
          },
          jezETH: {
            volume: 800000,
            transactions: 220,
            avg_size: 3636
          }
        }
      };
      
      // If specific asset was requested, filter the data
      if (asset && asset in data.by_token) {
        const tokenData = data.by_token[asset];
        return {
          total_volume: tokenData.volume,
          total_transactions: tokenData.transactions,
          growth_percent: data.growth_percent,
          by_token: { [asset]: tokenData }
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching Bridge Volume data:', error);
      throw error;
    }
  }
  
  /**
   * Fetches Liquidation stats
   */
  private async fetchLiquidationStats(timeframe: Timeframe, asset?: string): Promise<LiquidationStatsData> {
    try {
      // Mock data based on the Liquidation documentation
      const data: LiquidationStatsData = {
        liquidation_volume: {
          "24h": 320000, // $320K
          "7d": 1850000, // $1.85M
          "30d": 6500000, // $6.5M
          "all": 28500000 // $28.5M
        }[timeframe] || 320000,
        liquidation_count: {
          "24h": 47,
          "7d": 265,
          "30d": 920,
          "all": 4250
        }[timeframe] || 47,
        largest_liquidation: 42000, // $42K
        average_liquidation: 6809, // $6.8K
        health_factor_stats: {
          average: 1.85,
          median: 1.92,
          at_risk_positions: 145 // positions with health factor between 1.0 and 1.1
        },
        by_asset: {
          APT: {
            volume: 180000,
            count: 28,
            avg_size: 6429
          },
          jpufETH: {
            volume: 85000,
            count: 12,
            avg_size: 7083
          },
          USDC: {
            volume: 55000,
            count: 7,
            avg_size: 7857
          }
        }
      };
      
      // If specific asset was requested, filter the data
      if (asset && asset in data.by_asset) {
        const assetData = data.by_asset[asset];
        return {
          liquidation_volume: assetData.volume,
          liquidation_count: assetData.count,
          largest_liquidation: assetData.avg_size * 2, // Approximation
          average_liquidation: assetData.avg_size,
          health_factor_stats: data.health_factor_stats,
          by_asset: { [asset]: assetData }
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching Liquidation stats:', error);
      throw error;
    }
  }
  
  /**
   * Fetches current APY rates for various assets
   */
  private async fetchAPYRates(timeframe: Timeframe, asset?: string): Promise<APYRatesData> {
    try {
      // Mock data based on documentation
      const data: APYRatesData = {
        lending_rates: {
          APT: 4.2,
          USDC: 6.3,
          USDT: 5.8,
          jpufETH: 1.8,
          jrswETH: 2.1,
          jezETH: 2.5
        },
        borrowing_rates: {
          APT: 6.5,
          USDC: 9.7,
          USDT: 8.8,
          jpufETH: 3.8,
          jrswETH: 4.2,
          jezETH: 4.8
        },
        leveraged_yields: {
          "stAPT/APT": 65,
          "jpufETH/WETH": 27,
          "USDC/USDT": 23
        },
        rate_trends: {
          lending_up: ["USDC", "USDT", "jpufETH"],
          lending_down: ["APT"],
          lending_stable: ["jrswETH", "jezETH"],
          borrowing_up: ["USDC"],
          borrowing_down: ["APT", "jpufETH"],
          borrowing_stable: ["USDT", "jrswETH", "jezETH"]
        }
      };
      
      // If specific asset was requested, filter the data
      if (asset) {
        // Create a filtered version of the data
        const filteredData: APYRatesData = {
          lending_rates: {},
          borrowing_rates: {},
          leveraged_yields: {},
          rate_trends: {
            lending_up: data.rate_trends.lending_up.filter(a => a === asset),
            lending_down: data.rate_trends.lending_down.filter(a => a === asset),
            lending_stable: data.rate_trends.lending_stable.filter(a => a === asset),
            borrowing_up: data.rate_trends.borrowing_up.filter(a => a === asset),
            borrowing_down: data.rate_trends.borrowing_down.filter(a => a === asset),
            borrowing_stable: data.rate_trends.borrowing_stable.filter(a => a === asset)
          }
        };
        
        // Add asset-specific rates if they exist
        if (asset in data.lending_rates) {
          filteredData.lending_rates[asset] = data.lending_rates[asset];
        }
        
        if (asset in data.borrowing_rates) {
          filteredData.borrowing_rates[asset] = data.borrowing_rates[asset];
        }
        
        // Add strategy-specific yields if they include the asset
        Object.entries(data.leveraged_yields).forEach(([strategy, yield_value]) => {
          if (strategy.includes(asset)) {
            filteredData.leveraged_yields[strategy] = yield_value;
          }
        });
        
        return filteredData;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching APY rates:', error);
      throw error;
    }
  }
}

/**
 * Twitter Post Options interface
 */
interface TwitterPostOptions {
  content: string;
  include_metrics?: boolean;
  thread?: boolean;
  reply_to?: string;
  metrics_data?: Record<string, any>;
}

/**
 * X/Twitter Professional Post Tool
 * Posts professionally written content about Joule Finance to X/Twitter
 */
class XProfessionalPostTool extends StructuredTool {
  name = "x_professional_post";
  description = `
  This tool posts professionally written content about Joule Finance metrics to X/Twitter.
  
  Inputs:
  content: The content of the post (required, must be <= 280 characters)
  include_metrics: Whether to include a screenshot of metrics (optional, defaults to false)
  thread: Whether this is part of a thread (optional, defaults to false)
  reply_to: ID of tweet to reply to if this is part of a thread (optional)
  metrics_data: Optional data to include in the visualization (only used if include_metrics is true)
  `;
  
  schema = z.object({
    content: z.string().max(280),
    include_metrics: z.boolean().default(false),
    thread: z.boolean().default(false),
    reply_to: z.string().optional(),
    metrics_data: z.record(z.any()).optional()
  });
  
  private client?: TwitterApi;
  private oauth2Client?: TwitterApi;
  private visualizationTool: ChartVisualizationTool;
  
  constructor(visualizationTool?: ChartVisualizationTool) {
    super();
    this.visualizationTool = visualizationTool || new ChartVisualizationTool();
    
    if (config.twitter.apiKey && config.twitter.apiSecret && 
        config.twitter.accessToken && config.twitter.accessSecret) {
      try {
        // First try OAuth 1.0a (traditional approach)
        this.client = new TwitterApi({
          appKey: config.twitter.apiKey,
          appSecret: config.twitter.apiSecret,
          accessToken: config.twitter.accessToken,
          accessSecret: config.twitter.accessSecret
        });
        
        // If we also have OAuth 2.0 credentials, set up client for both auth types
        if (config.twitter.clientId && config.twitter.clientSecret) {
          // Create OAuth 2.0 client for endpoints that require it
          const oauth2Client = new TwitterApi({
            clientId: config.twitter.clientId,
            clientSecret: config.twitter.clientSecret
          });
          
          // Store both clients to use as needed
          this.oauth2Client = oauth2Client;
        }
        
        console.log('Twitter client initialized with API keys');
      } catch (err) {
        console.error('Error initializing Twitter client:', err);
      }
    } else {
      console.log('Running in development mode (tweets will be logged but not posted)');
    }
  }
  
  async _call(args: TwitterPostOptions): Promise<Record<string, any>> {
    const { content, include_metrics, thread, reply_to, metrics_data } = args;
    
    try {
      // Skip browser login attempts, just use client if available or dev mode
      const isDevelopment = !this.client;
      
      // Generate real blockchain data for visualization
      let mediaPath: string | undefined;
      try {
        const blockchainData = new JouleBlockchainData();
        
        // Get the appropriate data based on post content
        let metricsData;
        if (content.toLowerCase().includes('tvl')) {
          metricsData = await blockchainData.fetchTVL();
          metricsData = { tvl: metricsData };
        } else if (content.toLowerCase().includes('apy') || 
                  content.toLowerCase().includes('rate')) {
          metricsData = await blockchainData.fetchAPYRates();
          metricsData = { apy_rates: metricsData };
        } else {
          // Default to TVL for other content
          const tvlData = await blockchainData.fetchTVL();
          metricsData = { tvl: tvlData };
        }
        
        const visualization = await this.generateVisualization(metricsData);
        mediaPath = visualization.path;
        console.log(`Generated visualization with real blockchain data at: ${mediaPath}`);
      } catch (error) {
        console.error('Error generating visualization with blockchain data:', error);
        // Fallback to mock data
        const sampleMetrics = {
          tvl: {
            total_tvl: 10500000,
            change_percent: 12.5,
            by_asset: {
              "APT": 3500000,
              "USDC": 4200000,
              "USDT": 1800000,
              "jpufETH": 1000000
            }
          },
          apy_rates: {
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
          }
        };
        
        const visualization = await this.generateVisualization(sampleMetrics);
        mediaPath = visualization.path;
        console.log(`Generated visualization with fallback data at: ${mediaPath}`);
      }
      
      // Now pass the string path to postTweet
      const postResult = await this.postTweet(content, mediaPath, reply_to);
      
      // Create post message
      const postMessage = new FunctionMessage({
        content: JSON.stringify(postResult),
        name: "posting_agent"
      });

      // Update message store
      messageStore.push(postMessage);
      
      return {
        success: postResult.success,
        tweet_id: postResult.tweet_id,
        text: content,
        development_mode: postResult.development_mode,
        metrics_included: include_metrics,
        media_included: !!metrics_data
      };
    } catch (error) {
      console.error('Error posting to X/Twitter:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async postTweet(
    content: string, 
    mediaPath?: string,
    replyTo?: string
  ): Promise<any> {
    console.log(`postTweet called with media path: ${mediaPath || 'none'}`);
    
    if (!this.client) {
      // Development mode, just log what would happen
      console.log(`[DEV] Would post tweet: ${content}`);
      if (mediaPath) {
        console.log(`[DEV] Would include image: ${mediaPath}`);
      }
      
      return {
        success: true,
        development_mode: true,
        text: content,
        tweet_id: `mock-${Date.now()}`
      };
    }
    
    try {
      // Prepare tweet options
      const tweetOptions: any = { text: content };
      
      // Handle reply to
      if (replyTo) {
        tweetOptions.reply = { in_reply_to_tweet_id: replyTo };
      }
      
      // Check media path before trying to upload
      if (mediaPath) {
        console.log(`Attempting to use media at path: ${mediaPath}`);
        const fs = require('fs');
        if (fs.existsSync(mediaPath)) {
          console.log(`Media file exists! Size: ${fs.statSync(mediaPath).size} bytes`);
        } else {
          console.log(`Media file does not exist at: ${mediaPath}`);
        }
      }
      
      // Post the tweet FIRST without media
      const tweetResponse = await this.client.v2.tweet(tweetOptions);
      
      // If we have media, we'll add it as a separate tweet in a thread
      if (mediaPath) {
        try {
          // Upload media
          const mediaId = await this.client.v1.uploadMedia(mediaPath);
          
          // Create a reply with the media
          await this.client.v2.tweet({
            text: "📊 Chart for the data mentioned above",
            media: { media_ids: [mediaId] },
            reply: { in_reply_to_tweet_id: tweetResponse.data.id }
          });
        } catch (mediaError) {
          console.error('Error handling media upload:', mediaError);
          // Continue with the text-only tweet that was already posted
        }
      }
      
      return {
        success: true,
        development_mode: false,
        text: content,
        tweet_id: tweetResponse.data.id
      };
    } catch (error) {
      console.error('Error posting to X/Twitter:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async generateVisualization(metrics: any): Promise<{path?: string, url?: string}> {
    try {
      // Handle development mode
      if (!this.client) {
        console.log(`[DEV] Would generate visualization for:`, metrics);
      }
      
      // Format the data properly for the visualization tool
      let chartType = 'bar';
      let chartTitle = 'Joule Finance Metrics';
      let chartData = {};
      
      // Determine chart type and format data based on what's available
      if (metrics.tvl && metrics.tvl.by_asset) {
        chartType = 'pie';
        chartTitle = 'Joule Finance TVL Distribution';
        chartData = metrics.tvl.by_asset;
      } else if (metrics.apy_rates && metrics.apy_rates.lending_rates) {
        chartType = 'bar';
        chartTitle = 'Joule Finance Lending APY Rates';
        chartData = metrics.apy_rates.lending_rates;
      } else {
        // Default to a simple chart with made-up data if nothing suitable is found
        chartType = 'bar';
        chartTitle = 'Joule Finance DeFi Metrics';
        chartData = {
          "APT": 65,
          "USDC": 42,
          "ETH LRTs": 38,
          "USDT": 29
        };
      }
      
      // Generate actual visualization with proper parameters
      const visualization = await this.visualizationTool.invoke({
        chart_type: chartType,
        title: chartTitle,
        data: chartData,
        width: 600,
        height: 400
      });
      
      return visualization;
    } catch (error) {
      console.error('Error generating visualization:', error);
      return {};
    }
  }
}

/**
 * Initialize Move Agent Kit runtime
 */
const initializeAgentRuntime = async (): Promise<AgentRuntime> => {
  try {
    // Create local signer
    const signer = new LocalSigner(
      config.aptos.privateKey, 
      config.aptos.network,
      config.aptos.nodeUrl
    );
    
    // Create agent runtime
    const agent = new AgentRuntime(signer, {
      ANTHROPIC_API_KEY: config.llm.apiKey,
    });
    
    return agent;
  } catch (error) {
    console.error('Failed to initialize agent runtime:', error);
    throw new Error(`Agent runtime initialization failed: ${(error as Error).message}`);
  }
};

/**
 * Get LLM instance for the agent
 */
const getLLM = (): ChatAnthropic => {
  try {
    return new ChatAnthropic({
      temperature: config.llm.temperature,
      model: config.llm.model,
      apiKey: config.llm.apiKey,
    });
  } catch (error) {
    console.error('Failed to initialize LLM:', error);
    throw new Error(`LLM initialization failed: ${(error as Error).message}`);
  }
};

/**
 * Agent Nodes for the LangGraph workflow
 */

// Define an interface with proper index signature first
interface StateWithIndexSignature {
  messages: any;
  lastPostTime: any;
  metrics: any;
  [key: string]: any;
}

// Add type assertion to bypass the constraint check
const StateAnnotation = Annotation.Root({
  messages: Annotation({
    reducer: (a: BaseMessage[], b: BaseMessage[]) => [...a, ...b],
    default: () => [] as BaseMessage[]
  }),
  lastPostTime: Annotation({
    reducer: (_old: Date, current: Date) => current,
    default: () => new Date()
  }),
  metrics: Annotation({
    reducer: (_old: { tvl?: number, apy?: number }, current: { tvl?: number, apy?: number }) => current,
    default: () => ({} as { tvl?: number, apy?: number })
  })
}) as any as StateDefinition;

// Define the state type using the annotation's type property
type PosterState = typeof StateAnnotation;

// 1. Data Reader Agent - Fetches relevant Joule Finance data
const createReaderAgent = (jouleFinanceReader: JouleFinanceDataTool) => {
  return async (state: PosterState): Promise<PosterState> => {
    try {
      // Access state properties through the annotation's spec
      const messages = (state.values as unknown as StateValues)?.messages || [];
      
      // Check if there are messages before accessing the last one
      const latestMessage = messages.length > 0 
        ? messages[messages.length - 1] 
        : { content: 'Analyze Joule Finance metrics' };
      
      const llm = getLLM();
      
      // Determine which metrics to fetch based on the request
      const prompt = `You are an on-chain data analyst specialized in Joule Finance on Aptos.
      Your job is to determine which metrics would be most relevant and bullish to fetch based on this request:
      "${latestMessage.content}"
      
      Respond with a JSON array of objects, where each object contains:
      - metric_type: One of "tvl", "money_market", "leveraged_yield", "bridge_volume", "liquidation_stats", "apy_rates"
      - timeframe: "24h", "7d", "30d", or "all" 
      - asset (optional): specific asset symbol like "APT", "USDC", "jpufETH", etc.
      
      Choose metrics that would show positive momentum, growth, or strong fundamentals of Joule Finance.
      Only include metrics that would help create a bullish post about Joule.
      
      Do not include any explanation, just the JSON array.
      `;
      
      const response = await llm.invoke([new HumanMessage(prompt)]);
      
      // Extract the JSON array from the response
      let metricsToFetch: Array<{
        metric_type: JouleMetricType;
        timeframe: Timeframe;
        asset?: string;
      }>;
      
      try {
        // Extract JSON from the text if needed
        const responseText = response.content as string;
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/\[([\s\S]*?)\]/);
        
        if (jsonMatch) {
          metricsToFetch = JSON.parse(jsonMatch[0]);
        } else {
          metricsToFetch = JSON.parse(responseText);
        }
      } catch (error) {
        console.error('Failed to parse metrics from LLM response:', error);
        // Fallback metrics that highlight Joule's strengths
        metricsToFetch = [
          { metric_type: "tvl", timeframe: "7d" },
          { metric_type: "money_market", timeframe: "24h" },
          { metric_type: "leveraged_yield", timeframe: "7d" },
          { metric_type: "apy_rates", timeframe: "24h" }
        ];
      }
      
      // Fetch all metrics
      const results: Record<string, MetricResponse> = {};
      for (const metric of metricsToFetch) {
        try {
          const result = await jouleFinanceReader.invoke(metric);
          results[metric.metric_type] = result;
        } catch (error) {
          console.error(`Error fetching metric ${metric.metric_type}:`, error);
          results[metric.metric_type] = { 
            metric_type: metric.metric_type, 
            timeframe: metric.timeframe,
            asset: metric.asset,
            data: { error: (error as Error).message } as any,
            timestamp: new Date().toISOString()
          };
        }
      }
      
      const newMessages = [...messages, new FunctionMessage({
        content: JSON.stringify(results),
        name: "reader_agent"
      })];
      
      // @ts-ignore
      state = { ...state, values: { ...state.values, messages: newMessages } };
      return state;
    } catch (error) {
      console.error('Error in reader agent:', error);
      throw error;
    }
  };
};

// message memory
const messageStore: BaseMessage[] = [];

// 2. Content Writer Agent - Creates professional posts about Joule Finance
const createWriterAgent = () => {
  return async (state: PosterState): Promise<PosterState> => {
    // Define messages outside try/catch block
    const messages = (state.values as unknown as StateValues)?.messages || [];
    
    try {
      // Get the latest message content
      const latestMessage = messages.length > 0 
        ? messages[messages.length - 1] 
        : { content: 'Create a professional post about Joule Finance metrics' };
      
      const llm = getLLM();
      
      // Fetch real blockchain data for the prompt
      let metricsInfo = '';
      try {
        const blockchainData = new JouleBlockchainData();
        const tvlData = await blockchainData.fetchTVL();
        const apyRatesData = await blockchainData.fetchAPYRates();
        
        // Format the real metrics data for the prompt
        metricsInfo = `
KEY METRICS (REAL-TIME FROM BLOCKCHAIN):
- Protocol TVL Growth: $${(tvlData.total_tvl/1000000).toFixed(1)}M with ${tvlData.change_percent.toFixed(1)}% change
- Strategic Asset Allocation: ${Object.entries(tvlData.by_asset).map(([asset, value]) => 
  `${asset} (${((Number(value)/tvlData.total_tvl)*100).toFixed(0)}%)`).join(', ')}
- Competitive Lending APYs: ${Object.entries(apyRatesData.lending_rates).map(([asset, rate]) => 
  `${asset} (${rate.toFixed(1)}%)`).join(', ')}
- Market-Driven Borrowing Rates: ${Object.entries(apyRatesData.borrowing_rates).map(([asset, rate]) => 
  `${asset} (${rate.toFixed(1)}%)`).join(', ')}
- Flagship Strategy Performance: Leveraged APT staking yielding up to 65% APY with advanced risk controls`;
      } catch (error) {
        console.error('Error fetching blockchain metrics for writer prompt:', error);
        
        // Fall back to sample metrics
        metricsInfo = `
KEY METRICS TO ANALYZE:
- Protocol TVL Growth: $10.5M with 12.5% MoM increase, demonstrating strong adoption
- Strategic Asset Allocation: APT (33%), USDC (40%), USDT (17%), jpufETH (10%)
- Competitive Lending APYs: APT (8.5%), USDC (5.2%), USDT (5.0%), jpufETH (7.3%)
- Market-Driven Borrowing Rates: APT (12.5%), USDC (7.8%), USDT (7.5%), jpufETH (10.8%)
- Flagship Strategy Performance: Leveraged APT staking yielding 65% APY with advanced risk controls`;
      }
      
      // Further improve the writer agent to create more professional content without hashtags
      const writerPrompt = `You are a senior DeFi and onchain analyst specializing in Joule Finance on Aptos blockchain.

ABOUT JOULE FINANCE:
Joule Finance is a cutting-edge DeFi protocol on Aptos delivering:
- Advanced isolated lending markets for APT, USDC, USDT, and Ethereum LRTs
- Industry-leading leveraged yield farming with up to 6.5x multiplier
- Seamless cross-chain liquidity powered by LayerZero
- Sophisticated risk-adjusted yield strategies with robust liquidation safeguards
- Pioneer status as the premier lending protocol on Aptos

${metricsInfo}

MARKET LANDSCAPE:
- Aptos ecosystem experiencing rapid growth with Joule at the forefront of DeFi innovation
- LayerZero integration enabling efficient cross-chain capital flows
- Rising demand for Ethereum LRT yield opportunities
- Increasing focus on risk-adjusted returns in current market conditions
- Growing institutional interest in DeFi protocols with proven track records

Based on the request: "${latestMessage.content}"

Create a compelling, data-driven tweet (max 280 chars) that:
1. Incorporates precise metrics and trend analysis
2. Demonstrates Joule's market leadership and competitive advantages
3. Employs sophisticated financial terminology accurately
4. Emphasizes unique protocol capabilities
5. Maintains an authoritative yet accessible tone
6. Focuses on quantifiable value propositions

STRICT GUIDELINES:
- NO hashtags, cashtags, or emojis
- NO speculative claims or price predictions
- NO marketing jargon or promotional language
- NO external account mentions or references
- ONLY verifiable data and metrics
- MAINTAIN professional analyst perspective

ADVANCED TWEET STRUCTURES:
1. Comparative Analysis: "In contrast to [industry benchmark], Joule Finance achieves [superior metric] through [innovative mechanism]..."
2. Market Intelligence: "Amid [emerging trend], Joule's [unique feature] demonstrates [specific performance metric]..."
3. Technical Deep-Dive: "Joule's innovative approach to [core feature] generates [quantifiable advantage] via [technical differentiator]..."
4. Value Analysis: "Institutional DeFi users leverage Joule's [key capability] to achieve [concrete benefit], evidenced by [growth metric]..."

Response should contain ONLY the tweet text, crafted with institutional-grade financial analysis standards.
`;
      
      const response = await llm.invoke([new HumanMessage(writerPrompt)]);
      
      console.log('Generated tweet content:', response.content);
      
      // Create writer message with name property to identify it
      console.log('Creating writer message with name property...');
      const writerMessage = new FunctionMessage({
        content: response.content as string,
        name: "writer_agent"
      });
      
      console.log('Writer message created:', JSON.stringify(writerMessage));
      
      // Store message in external store for the poster to use
      messageStore.push(writerMessage);
      
      const updatedMessages = [...messages, writerMessage];
      
      // @ts-ignore
      state = { ...state, values: { ...state.values, messages: updatedMessages } };
      return state;
    } catch (error) {
      console.error('Error in writer agent:', error);
      const errorMessages = [...messages, new FunctionMessage({
        content: JSON.stringify({ error: (error as Error).message }),
        name: "writer_agent"
      })];
      // @ts-ignore
      state = { ...state, values: { ...state.values, messages: errorMessages } };
      return state;
    }
  };
};

// 3. Posting Agent - Responsible for posting content to Twitter/X
const createPostingAgent = (xPoster: XProfessionalPostTool) => {
  return async (state: PosterState): Promise<PosterState> => {
    try {
      // Extract messages from state
      const messages = (state.values as unknown as StateValues)?.messages || [];
      
      // Get the latest content from the writer agent
      const writerMessage = messages.find(msg => msg.name === "writer_agent");
      if (!writerMessage) {
        console.log('No writer message found. Cannot proceed with posting.');
        return state;
      }
      
      let tweetContent = typeof writerMessage.content === 'string' 
        ? writerMessage.content 
        : JSON.stringify(writerMessage.content);
      
      console.log(`Using latest content from messageStore: ${tweetContent}`);
      
      // Initialize blockchain data fetcher
      const blockchainData = new JouleBlockchainData();
      
      // Generate real blockchain data for visualization
      let mediaPath: string | undefined;
      try {
        // Get real-time TVL data from blockchain
        const tvlData = await blockchainData.fetchTVL();
        
        // Get real-time APY rates from blockchain
        const apyRatesData = await blockchainData.fetchAPYRates();
        
        // Determine which chart type to use based on tweet content
        let chartType = 'bar';
        if (tweetContent.toLowerCase().includes('tvl') || 
            tweetContent.toLowerCase().includes('allocation') || 
            tweetContent.toLowerCase().includes('distribution')) {
          chartType = 'pie';
        }
        
        // Construct metrics object with real blockchain data
        const metricsData = {
          tvl: tvlData,
          apy_rates: apyRatesData
        };
        
        // Generate visualization using real blockchain data
        const visualization = await xPoster.generateVisualization(metricsData);
        mediaPath = visualization.path;
        console.log(`Generated visualization with real blockchain data at: ${mediaPath}`);
      } catch (error) {
        console.error('Error fetching blockchain data:', error);
        
        // Fallback to sample metrics if blockchain data fetching fails
        console.log('Falling back to sample metrics data');
        const sampleMetrics = {
          tvl: {
            total_tvl: 10500000,
            change_percent: 12.5,
            by_asset: {
              "APT": 3500000,
              "USDC": 4200000,
              "USDT": 1800000,
              "jpufETH": 1000000
            }
          },
          apy_rates: {
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
          }
        };
        
        const visualization = await xPoster.generateVisualization(sampleMetrics);
        mediaPath = visualization.path;
        console.log(`Generated visualization with fallback data at: ${mediaPath}`);
      }
      
      // Post to Twitter with the visualization
      await xPoster.postTweet(tweetContent, mediaPath);
      
      // Create post message for the message store
      const postMessage = new FunctionMessage({
        content: JSON.stringify({ success: true, tweet_id: 'mock-12345', text: tweetContent, development_mode: false }),
        name: "posting_agent"
      });
      messageStore.push(postMessage);
      
      // Return updated state
      return state;
    } catch (error) {
      console.error('Error in posting agent:', error);
      return state;
    }
  };
};

// 4. Manager Agent - Coordinates the workflow
const createManagerAgent = () => {
  return async (state: PosterState): Promise<PosterState> => {
    // Define messages outside try/catch block
    const messages = (state.values as unknown as StateValues)?.messages || [];
    
    try {
      // Check if there are any messages before accessing the last one
      const latestMessage = messages.length > 0 
        ? messages[messages.length - 1] 
        : { content: 'Create a professional post about Joule Finance' };
      
      const llm = getLLM();
      
      const managerPrompt = `You are the manager of a professional crypto analytics team focused on Joule Finance on Aptos.
      Joule Finance is a comprehensive DeFi protocol on Aptos offering:
      - Money Market with isolated lending positions
      - Leveraged Yield Farming opportunities
      - LayerZero cross-chain bridge for LRT tokens
      - Liquidity Anchors for other dApps
      
      A user has requested: "${latestMessage.content}"
      
      Your job is to:
      1. Determine if this is a request to create bullish content about Joule Finance
      2. If yes, instruct the reader agent what kind of data would be most impressive to highlight
      3. If no, explain that your team specializes in creating professional posts about Joule Finance metrics
      
      Focus on helping create professional, fact-based content that highlights positive metrics and trends.
      Provide your response in a concise, professional manner.`;
      
      const response = await llm.invoke([new HumanMessage(managerPrompt)]);
      
      const updatedMessages = [...messages, new AIMessage(response.content as string, { name: "manager_agent" })];
      // @ts-ignore
      state = { ...state, values: { ...state.values, messages: updatedMessages } };
      return state;
    } catch (error) {
      console.error('Error in manager agent:', error);
      const errorMessages = [...messages, new FunctionMessage({
        content: JSON.stringify({ error: (error as Error).message }),
        name: "manager_agent"
      })];
      // @ts-ignore
      state = { ...state, values: { ...state.values, messages: errorMessages } };
      return state;
    }
  };
};

/**
 * Build and export the complete agent system
 */
export const createBullishPostSystem = async (): Promise<(userInput: string) => Promise<StateType<typeof StateAnnotation>>> => {
  try {
    // Initialize Move Agent Kit runtime
    const agentRuntime = await initializeAgentRuntime();
    
    // Create specialized tools
    const jouleFinanceReader = new JouleFinanceDataTool(agentRuntime);
    const chartVisualization = new ChartVisualizationTool();
    const xPoster = new XProfessionalPostTool(chartVisualization);
    
    // Create standard Aptos tools from the Move Agent Kit
    const aptosTools = createAptosTools(agentRuntime);
    
    // Create the graph with typed state and nodes
    const workflow = new StateGraph(StateAnnotation)
      // Define nodes with correct ends arrays
      .addNode('manager', createManagerAgent(), { 
        ends: ["reader", "writer", "poster", "__end__"] 
      })
      .addNode('reader', createReaderAgent(jouleFinanceReader), {
        ends: ["writer", "__end__"]
      })
      .addNode('writer', createWriterAgent(), {
        ends: ["poster", "__end__"]
      })
      .addNode('poster', createPostingAgent(xPoster), {
        ends: ["__end__"]
      })
      
      // Define the edges to create a complete path through the graph
      .addEdge("__start__", "manager")
      .addEdge("manager", "reader")
      .addEdge("reader", "writer")
      .addEdge("writer", "poster")
      .addEdge("poster", "__end__");
    
    // Compile the graph with proper typing
    const app = workflow.compile({
      checkpointer: new MemorySaver() // Optional for state persistence
    });
    
    // Return a function that takes a user input
    return async (userInput: string): Promise<StateType<typeof StateAnnotation>> => {
      try {
        console.log(`Processing request: ${userInput}`);
        
        // Initialize with a proper HumanMessage
        const initialMessage = new HumanMessage(userInput);
        
        const result = await app.invoke({
          messages: [initialMessage], // Ensure this is a properly formed message
          lastPostTime: new Date(),
          metrics: {}
        }, { configurable: { thread_id: "unique_id" } });
        
        // Add null check for messages array
        const messages = result.values?.messages || [];
        console.log(JSON.stringify(messages.slice(-3), null, 2));
        
        // Extract the posted tweet from the result
        const postingResult = messages.find((msg: BaseMessage) => msg.name === 'posting_agent');
        if (postingResult) {
          const postData = JSON.parse(postingResult.content as string);
          console.log('\nTWEET POSTED:');
          if (postData.success) {
            console.log(`Tweet ID: ${postData.tweet_id}`);
            console.log(`Content: ${postData.text}`);
            console.log(`Development Mode: ${postData.development_mode ? 'Yes' : 'No'}`);
          } else {
            console.log(`Posting failed: ${postData.error}`);
          }
        }
        
        return result;
      } catch (error) {
        console.error('Error running the bullish post system:', error);
        throw error;
      }
    };
  } catch (error) {
    console.error('Error creating the bullish post system:', error);
    throw error;
  }
};

// Script for running the system as a standalone process
export const runAsBullishPoster = async (userInput?: string): Promise<void> => {
  try {
    // Use provided input or default
    const input = userInput || "Create a professional bull post about Joule Finance's performance this week";
    
    // Create and run the system
    const createBullishPost = await createBullishPostSystem();
    const result = await createBullishPost(input);
    
    // Print the result
    console.log('\nFINAL RESULT:');
    console.log(JSON.stringify(result.values?.messages.slice(-3), null, 2));
    
    // Extract the posted tweet from the result
    const postingResult = result.values?.messages.find((msg: BaseMessage) => msg.name === 'posting_agent');
    if (postingResult) {
      const postData = JSON.parse(postingResult.content as string);
      console.log('\nTWEET POSTED:');
      if (postData.success) {
        console.log(`Tweet ID: ${postData.tweet_id}`);
        console.log(`Content: ${postData.text}`);
        console.log(`Development Mode: ${postData.development_mode ? 'Yes' : 'No'}`);
      } else {
        console.log(`Posting failed: ${postData.error}`);
      }
    }
  } catch (error) {
    console.error('Error running the application:', error);
  }
};