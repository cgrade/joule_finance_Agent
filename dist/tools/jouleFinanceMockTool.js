"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JouleFinanceDataTool = void 0;
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const config_1 = __importDefault(require("../config"));
const aptos_client_1 = __importDefault(require("../utils/aptos-client"));
class JouleFinanceDataTool {
    constructor(agentRuntime, options = {}) {
        this.agentRuntime = agentRuntime;
        // Use options to determine if mock data is allowed
        this.allowMockData = options.allowMockData ?? false;
        // Prioritize environment variable, then config, then default mainnet endpoint
        this.apiEndpoint = process.env.APTOS_NODE_URL ||
            config_1.default.aptos?.nodeUrl ||
            "https://fullnode.mainnet.aptoslabs.com/v1";
        this.aptosClient = new aptos_client_1.default(this.apiEndpoint);
        // Show which network we're connecting to
        const isTestnet = this.apiEndpoint.includes('testnet');
        console.log(chalk_1.default.cyan(`Initialized Joule Finance data tool with ${isTestnet ? 'TESTNET' : 'MAINNET'} endpoint: ${this.apiEndpoint}`));
        // Log if mock data is allowed
        if (this.allowMockData) {
            console.log(chalk_1.default.yellow("⚠️ Mock data is enabled - will use simulated data if blockchain data is unavailable"));
        }
        else {
            console.log(chalk_1.default.green("✅ Mock data is disabled - will only return real blockchain data or error state"));
        }
    }
    /**
     * Get finance data from Joule Finance on Aptos blockchain
     */
    async getData() {
        try {
            console.log(chalk_1.default.blue("🔍 Fetching Joule Finance data from blockchain..."));
            // Get contract addresses from config
            const contractAddress = config_1.default.joule?.contracts?.main;
            console.log(chalk_1.default.yellow(`Using contract address: ${contractAddress}`));
            // Try to contact the blockchain
            try {
                const response = await axios_1.default.get(this.apiEndpoint);
                console.log(chalk_1.default.green("✅ Successfully connected to Aptos blockchain"));
                // Store blockchain ledger version as proof
                const ledgerVersion = response.data?.ledger_version || "unknown";
                console.log(chalk_1.default.green(`Current ledger version: ${ledgerVersion}`));
            }
            catch (error) {
                console.error(chalk_1.default.red("❌ Failed to connect to Aptos blockchain"));
                throw new Error("Blockchain connection failed");
            }
            // ... the rest of the getData method implementation ...
            // For demonstration, we'll throw an error here to simulate failure
            throw new Error("Could not find Joule Finance contract data");
        }
        catch (error) {
            console.error(chalk_1.default.red("❌ Error fetching blockchain data:"), error);
            if (this.allowMockData) {
                // Return clearly labeled simulated data
                console.log(chalk_1.default.yellow("⚠️ Using simulated data (CLEARLY LABELED AS SIMULATED)"));
                const simulatedData = {
                    tvl: 10500000,
                    apr: 8.4,
                    users: 1250,
                    volume24h: 750000,
                    assets: {
                        "APT": { price: 3.14, tvl: 3500000, apr: 7.2 },
                        "USDC": { price: 1.00, tvl: 4200000, apr: 5.8 },
                        "ETH": { price: 1850, tvl: 2800000, apr: 9.1 }
                    },
                    dataSource: "simulated", // Clearly labeled
                    lastUpdated: new Date().toISOString()
                };
                return simulatedData;
            }
            else {
                // Return error data with specific message
                return {
                    tvl: 0,
                    apr: 0,
                    users: 0,
                    volume24h: 0,
                    assets: {},
                    dataSource: "error",
                    error: "Joule Finance contract not found on blockchain, or contract address is incorrect",
                    lastUpdated: new Date().toISOString()
                };
            }
        }
    }
}
exports.JouleFinanceDataTool = JouleFinanceDataTool;
//# sourceMappingURL=jouleFinanceMockTool.js.map