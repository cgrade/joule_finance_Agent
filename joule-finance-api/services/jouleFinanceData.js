// Joule Finance Data Service
// Fetches real-time data from Joule Finance blockchain
const axios = require('axios');

// Cache mechanism to avoid excessive API calls
const cache = {
  data: null,
  lastUpdated: 0,
  TTL: 5 * 60 * 1000 // 5 minutes cache TTL
};

class JouleFinanceDataService {
  constructor() {
    // Base URLs for different endpoints
    this.apiBaseUrl = 'https://api.joule.finance';
    this.aptosScanBaseUrl = 'https://aptosscan.com/api';
  }

  // Get latest protocol stats including TVL and user count
  async getProtocolStats() {
    try {
      if (this.isCacheValid('protocolStats')) {
        return cache.data.protocolStats;
      }
      
      const response = await axios.get(`${this.apiBaseUrl}/v1/protocol/stats`);
      this.updateCache('protocolStats', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching protocol stats:', error.message);
      return this.getFallbackProtocolStats();
    }
  }

  // Get current APR rates for all supported tokens
  async getCurrentRates() {
    try {
      if (this.isCacheValid('rates')) {
        return cache.data.rates;
      }
      
      const response = await axios.get(`${this.apiBaseUrl}/v1/markets/rates`);
      this.updateCache('rates', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching current rates:', error.message);
      return this.getFallbackRates();
    }
  }

  // Get total value locked across all markets
  async getTVL() {
    try {
      if (this.isCacheValid('tvl')) {
        return cache.data.tvl;
      }
      
      const response = await axios.get(`${this.apiBaseUrl}/v1/protocol/tvl`);
      this.updateCache('tvl', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching TVL:', error.message);
      return this.getFallbackTVL();
    }
  }

  // Get supported tokens and their info
  async getSupportedTokens() {
    try {
      if (this.isCacheValid('tokens')) {
        return cache.data.tokens;
      }
      
      const response = await axios.get(`${this.apiBaseUrl}/v1/markets/tokens`);
      this.updateCache('tokens', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching supported tokens:', error.message);
      return this.getFallbackTokens();
    }
  }

  // Get all data at once (for system prompt)
  async getAllData() {
    const [stats, rates, tvl, tokens] = await Promise.all([
      this.getProtocolStats(),
      this.getCurrentRates(),
      this.getTVL(),
      this.getSupportedTokens()
    ]);
    
    return {
      stats,
      rates,
      tvl,
      tokens,
      lastUpdated: new Date().toISOString()
    };
  }

  // Cache validation
  isCacheValid(dataType) {
    const now = Date.now();
    return (
      cache.data && 
      cache.data[dataType] && 
      (now - cache.lastUpdated) < cache.TTL
    );
  }

  // Update cache
  updateCache(dataType, data) {
    if (!cache.data) {
      cache.data = {};
    }
    cache.data[dataType] = data;
    cache.lastUpdated = Date.now();
  }

  // Fallback data if API calls fail
  getFallbackProtocolStats() {
    return {
      totalUsers: 12500,
      dailyActiveUsers: 1850,
      totalTransactions: 145700,
      totalValueLocked: "$42.5M"
    };
  }

  getFallbackRates() {
    return {
      lendingRates: {
        USDC: 8.73,
        USDT: 8.67,
        APT: 2.15,
        TruAPT: 0.00,
        WETH: 5.47,
        amAPT: 1.73,
        stAPT: 12.88,
        WBTC: 19.92,
        aBTC: 15.05,
        eAPT: 0.00,
        sthAPT: 7.27
      },
      borrowingRates: {
        USDC: 6.02,
        USDT: 6.22,
        APT: 3.51,
        TruAPT: 0.00,
        WETH: 1.87,
        amAPT: 3.14,
        stAPT: 0.72,
        WBTC: 2.01,
        aBTC: 37.73,
        eAPT: 0.12,
        sthAPT: 0.00
      }
    };
  }

  getFallbackTVL() {
    return {
      totalTVL: 8526021.43,
      byToken: {
        USDC: 5370000,
        USDT: 4870000,
        APT: 2150000,
        TruAPT: 3800000,
        WETH: 820710,
        stAPT: 3160000,
        WBTC: 22480
      }
    };
  }

  getFallbackTokens() {
    return [
      { symbol: "USDC", name: "USD Coin", decimals: 6 },
      { symbol: "USDT", name: "Tether", decimals: 6 },
      { symbol: "ETH", name: "Ethereum", decimals: 18 },
      { symbol: "APT", name: "Aptos", decimals: 8 },
      { symbol: "BTC", name: "Bitcoin", decimals: 8 }
    ];
  }
}

module.exports = new JouleFinanceDataService(); 