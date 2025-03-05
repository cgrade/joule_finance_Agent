// Add the method to the class definition
import { AgentRuntime } from "../agent/runtime";

// Rather than redefining the class, add the method to the prototype
JouleFinanceDataTool.prototype.getData = async function() {
  console.log("Mock getData called");
  return {
    tvl: 10500000,
    apr: 8.4,
    users: 1250,
    volume24h: 750000,
    assets: {
      "APT": { price: 3.14, tvl: 3500000, apr: 7.2 },
      "USDC": { price: 1.00, tvl: 4200000, apr: 5.8 },
      "ETH": { price: 1850, tvl: 2800000, apr: 9.1 }
    }
  };
};

export class JouleFinanceDataTool {
  // Existing class properties and methods
  
  // Add this method to the class
  async getData() {
    try {
      // For development, return mock data
      return {
        tvl: 10500000,
        apr: 8.4,
        users: 1250,
        volume24h: 750000,
        assets: {
          "APT": { price: 3.14, tvl: 3500000, apr: 7.2 },
          "USDC": { price: 1.00, tvl: 4200000, apr: 5.8 },
          "ETH": { price: 1850, tvl: 2800000, apr: 9.1 }
        }
      };
    } catch (error) {
      console.error("Error in getData:", error);
      return null;
    }
  }
} 