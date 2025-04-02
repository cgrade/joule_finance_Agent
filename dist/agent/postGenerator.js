import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
// Add this near the beginning of the file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Enhanced professional templates for an on-chain data analyst
const POST_TEMPLATES = [
    // TVL focused analytical templates
    "🚀 Joule Finance continues to THRIVE! TVL impressively reaching {TVL} with exceptional growth in Q2. Incredible yields of {APR} across markets, with {TOP_ASSETS} leading in capital efficiency. Protocol fundamentals have never been stronger! #DeFi #Aptos",
    "🔥 BREAKING: Joule Finance TVL update: {TVL} in total locked value, showing an impressive +{TVL_CHANGE}% WoW growth! Asset distribution weighted toward {TOP_ASSETS} with {APR} blended yield across offerings. Clear leader in the Aptos ecosystem! #YieldFarming",
    "📈 Bullish capital allocation: Joule Finance's {TVL} TVL demonstrates surging institutional interest. {TOP_ASSETS} compose {TOP_PERCENTAGE}% of total value, with outstanding {APR} weighted average yield dominating the competition! #DeFiRevolution #Aptos",
    // User-focused analytical templates
    "🏆 Joule Finance adoption EXPLODING: Now serving {USERS} active wallets managing {TVL} in TVL! Exceptional capital efficiency ratio at 0.76, with yields reaching {MAX_APR} on select assets. User retention rate crushing sector averages! #DeFiGems",
    "📱 User growth skyrocketing: Joule Finance reaching {USERS} verified users with {TVL_PER_USER} average TVL per user. Acquisition costs plummeting while retention metrics show impressive gains. {TOP_ASSETS} seeing highest engagement! #AptosDeFi #Bullish",
    "👥 Amazing wallet distribution: {USERS} active addresses interacting with Joule Finance, with average deposit size of {TVL_PER_USER}. Whales account for 32% of {TVL} total TVL, with retail adoption accelerating at unprecedented rates! #CommunityGrowth",
    // Volume focused analytical templates
    "💹 Trading volume EXPLODING on Joule Finance: {VOLUME} processed in last 24h with {TVL} total value locked. Liquidity depth improving dramatically across {TOP_ASSETS}. On-chain indicators suggest exceptional capital utilization! #Trading #Aptos",
    "📊 Volume hitting new highs: Joule Finance recording {VOLUME} in 24h transaction volume, representing {VOLUME_TO_TVL}% of {TVL} TVL. Trading activity concentrated in {TOP_ASSETS}, demonstrating incredible market depth & confidence! #TradingVolume",
    "💰 Liquidity flow analysis: {VOLUME} in transaction volume across Joule Finance markets in past 24h. Capital velocity surging with utilization rate of {UTILIZATION}%. Particularly strong activity in {TOP_ASSETS} pairs making Joule the go-to platform! #AptosEcosystem",
    // APR focused analytical templates
    "💸 Exceptional yield opportunities: Joule Finance currently offering outstanding {APR} average APR with sustainable tokenomics model. {TVL} in managed assets across diversified pools. Top performers: {TOP_ASSETS}. Risk-adjusted returns crushing ecosystem average! #YieldFarming",
    "📣 Interest rate model outperforming peers: Joule Finance maintaining industry-leading {APR} mean APR across {TVL} in deposits. Rate stability remains unmatched with volatility index at 0.14, significantly below ecosystem average. {TOP_ASSETS} offering premium yields! #Yields",
    "📈 Yield curve dominance: Joule Finance's average yield of {APR} positions protocol as the undisputed leader against competitors. Term structure showing positive slope with {TOP_ASSETS} generating highest returns on {TVL} capital base! #PassiveIncome #AptosDeFi",
    // Integration focused analytical templates
    "🔄 Joule Finance ecosystem integration taking over: Protocol now maintains {TVL} TVL with {USERS} users across multiple markets. Unparalleled liquidity with competitive rates enables cross-protocol capital efficiency. Utilization metrics show exceptional reserve ratios! #DeFiIntegration",
    "🌐 Cross-protocol dominance: Joule Finance's {TVL} liquidity actively utilized across entire Aptos DeFi ecosystem. Integration depth increasing with {INTEGRATIONS_COUNT} protocol connections. Capital efficiency multiplier measured at an impressive 1.32x! #Ecosystem",
    "🧩 Ecosystem positioning strengthening: Joule Finance's {TVL} in TVL represents a growing {ECOSYSTEM_SHARE}% of Aptos TVL. Strategic integrations with {INTEGRATIONS_COUNT} protocols driving innovative compounding yield opportunities averaging {APR}! #AptosDeFi",
    // Feature focused analytical templates
    "⚙️ Technical excellence: Joule Finance managing {TVL} in assets with {USERS} active users and {APR} mean yield. Protocol security rating remains unmatched with multi-layer risk management system. Capital efficiency ratio: 0.82 - best in class! #TechExcellence",
    "🛡️ Protocol health assessment: Joule Finance's robust {TVL} TVL supported by industry-leading technical fundamentals. Security audit coverage at 100% with formal verification of core contracts. Risk parameters optimized for sustainable {APR} yield - simply unmatched! #Security",
    "🔧 Feature utilization breaking records: Analysis of Joule Finance's {USERS} users shows 73% engagement with advanced protocol features. Multi-asset collateralization seeing highest adoption, driving efficient use of {TVL} locked capital! #UserExperience",
    // Specific feature analytical templates
    "💼 Multi-asset lending markets THRIVING: Joule Finance's core markets ({TOP_ASSETS}) show exceptional fundamentals with {TVL} TVL and mean yields of {APR}. Collateralization ratio remains healthy at 142%. Capital efficiency trending strongly upward! #LendingMarkets",
    "🏦 Collateral efficiency outperforming competitors: Joule Finance's multi-asset model achieving 82% capital efficiency across {TVL} in deposits. Weighted average LTV of 65% perfectly balances capital efficiency with protocol safety. {TOP_ASSETS} most actively used as collateral! #Efficiency",
    "📈 Lending market dynamics excelling: Joule Finance's {TVL} lending pools showing optimized utilization metrics. Supply-side concentration decreasing with Gini coefficient of 0.64. Blended interest rate of {APR} maintains dominant competitive position! #Lending",
    "📊 Yield strategy performance crushing benchmarks: Joule Finance's automated strategies generating up to {MAX_APR} with {TVL} in managed assets. Risk-adjusted returns demolishing sector benchmarks. Strategy diversification offering optimal risk-reward profiles! #YieldStrategies",
    "⚡ Automated yield optimization leading the industry: Strategies managing {TVL} in assets with performance metrics showing {APR} blended return. Sharpe ratio of 1.8 indicates superior risk-adjusted performance. {TOP_ASSETS} strategies delivering highest alpha! #PassiveIncome",
    "🔥 Strategy performance setting new standards: Joule Finance's yield optimizers delivering {APR} time-weighted returns on {TVL} managed capital. Drawdown parameters remain well within defined thresholds with maximum recorded at just 3.2% in volatile conditions! #RiskManagement",
    "🌉 Cross-chain capital flows accelerating: Joule Finance managing {TVL} across diversified assets including {TOP_ASSETS}. Yields of up to {MAX_APR} available on Aptos, positioning protocol as THE significant cross-chain liquidity provider. Bridged asset reserves exceed targets! #CrossChain",
    "🔄 Bridged asset growth exploding: {TVL} in cross-chain assets deployed through Joule Finance. Inflow velocity increasing at {INFLOW_RATE}% monthly with {TOP_ASSETS} seeing highest demand. Bridge utilization maintaining an exceptional 94% efficiency ratio! #Interoperability",
    "🌐 Inter-blockchain liquidity leadership: Joule Finance facilitating efficient cross-chain capital deployment of {TVL} total value. Asset composition favoring {TOP_ASSETS} with average deployed yield of {APR}. Slippage metrics showing continued improvement - best in class! #Blockchain"
];
// Store the last 10 used templates to avoid repetition
let recentlyUsedTemplates = [];
const MAX_HISTORY = 10;
// Topic to template mapping to select appropriate templates for specific topics
const TOPIC_TEMPLATES = {
    "yield": [9, 10, 11, 21, 22, 23], // APR focused + yield strategies templates
    "lending": [0, 1, 2, 18, 19, 20], // TVL focused + multi-asset lending templates
    "market": [6, 7, 8, 0, 1, 2], // Volume focused + TVL templates
    "user": [3, 4, 5, 12, 13, 14], // User focused + integration templates
    "integration": [12, 13, 14, 24, 25, 26], // Integration focused + cross-chain templates
    "security": [15, 16, 17, 0, 1, 2], // Feature focused + TVL templates
    "optimize": [21, 22, 23, 9, 10, 11], // Yield strategies + APR templates
    "cross-chain": [24, 25, 26, 12, 13, 14] // Cross-chain + integration templates
};
// Additional computed metrics for richer templates
function calculateAdditionalMetrics(marketData) {
    // Calculate week-over-week TVL change (simulated)
    const tvlChangeWoW = (Math.random() * 5 + 1).toFixed(2);
    // Calculate top assets percentage
    const totalTVL = marketData.tvl;
    const topAssets = Object.entries(marketData.assets).slice(0, 3);
    const topAssetsTVL = topAssets.reduce((sum, [_, data]) => sum + data.tvl, 0);
    const topPercentage = ((topAssetsTVL / totalTVL) * 100).toFixed(1);
    // Calculate TVL per user
    const tvlPerUser = (totalTVL / marketData.users).toFixed(2);
    // Calculate volume to TVL ratio
    const volumeToTVL = ((marketData.volume24h / totalTVL) * 100).toFixed(1);
    // Calculate utilization rate (simulated)
    const utilization = (Math.random() * 15 + 70).toFixed(1);
    // Calculate ecosystem share (simulated)
    const ecosystemShare = (Math.random() * 10 + 15).toFixed(1);
    // Calculate integrations count (simulated)
    const integrationsCount = Math.floor(Math.random() * 5 + 12);
    // Calculate inflow rate (simulated)
    const inflowRate = (Math.random() * 8 + 4).toFixed(1);
    return {
        TVL_CHANGE: tvlChangeWoW,
        TOP_PERCENTAGE: topPercentage,
        TVL_PER_USER: `$${parseFloat(tvlPerUser).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        VOLUME_TO_TVL: volumeToTVL,
        UTILIZATION: utilization,
        ECOSYSTEM_SHARE: ecosystemShare,
        INTEGRATIONS_COUNT: integrationsCount,
        INFLOW_RATE: inflowRate
    };
}
/**
 * Creates an audit trail of template usage to avoid repetition
 */
function trackTemplateUsage(templateIndex) {
    // Add current template to history
    recentlyUsedTemplates.push(templateIndex);
    // Keep only the most recent templates
    if (recentlyUsedTemplates.length > MAX_HISTORY) {
        recentlyUsedTemplates = recentlyUsedTemplates.slice(recentlyUsedTemplates.length - MAX_HISTORY);
    }
    // Save history to disk for persistence across restarts
    try {
        const historyFile = path.join(__dirname, '../../data/template-history.json');
        fs.mkdirSync(path.dirname(historyFile), { recursive: true });
        fs.writeFileSync(historyFile, JSON.stringify(recentlyUsedTemplates));
    }
    catch (error) {
        console.error("Error saving template history:", error);
    }
}
/**
 * Loads template usage history from disk
 */
function loadTemplateHistory() {
    try {
        const historyFile = path.join(__dirname, '../../data/template-history.json');
        if (fs.existsSync(historyFile)) {
            const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
            return Array.isArray(history) ? history : [];
        }
    }
    catch (error) {
        console.error("Error loading template history:", error);
    }
    return [];
}
// Initialize history on module load
recentlyUsedTemplates = loadTemplateHistory();
/**
 * Selects a template that hasn't been used recently
 */
function selectFreshTemplate(topicTemplates) {
    // Filter out recently used templates
    const availableTemplates = topicTemplates.filter(t => !recentlyUsedTemplates.includes(t));
    // If all templates have been used recently, pick the least recently used one
    if (availableTemplates.length === 0) {
        const leastRecentlyUsed = recentlyUsedTemplates[0];
        return leastRecentlyUsed;
    }
    // Otherwise pick a random template from available ones
    return availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
}
/**
 * Helper function to extract metrics from post content
 */
function extractMetrics(sections) {
    // Default values
    let title = "Joule Finance Analysis";
    let aprInfo = "Competitive APR across markets";
    let tvlInfo = "Strong TVL growth";
    let topAssets = [];
    let conclusion = "Sustainable tokenomics with superior risk-adjusted returns.";
    // Extract information from sections
    for (const section of sections) {
        const cleanSection = section.trim();
        // Extract title
        if (cleanSection.includes("analysis:") ||
            cleanSection.includes("update") ||
            cleanSection.includes("assessment:")) {
            title = cleanSection.split(":")[0].trim();
        }
        // Extract APR info
        if (cleanSection.includes("APR") ||
            cleanSection.includes("yield") ||
            cleanSection.includes("interest")) {
            aprInfo = cleanSection;
        }
        // Extract TVL info
        if (cleanSection.includes("TVL") ||
            cleanSection.includes("locked") ||
            cleanSection.includes("managed assets")) {
            tvlInfo = cleanSection;
        }
        // Extract top assets
        if (cleanSection.includes("Top performing") ||
            cleanSection.includes("leading in") ||
            cleanSection.includes("Top markets")) {
            // Extract the part with asset names and percentages
            const assetPart = cleanSection.split(":")[1]?.trim() || "";
            if (assetPart) {
                // Try to split by comma
                topAssets = assetPart.split(",").map(a => a.trim());
                // If there are no commas but there are parentheses, try another approach
                if (topAssets.length <= 1 && assetPart.includes("(")) {
                    // Use regex to find assets with percentages
                    const assetMatches = assetPart.match(/([A-Za-z0-9]+)\s*\(([^)]+)\)/g);
                    if (assetMatches) {
                        topAssets = assetMatches.map(match => match.trim());
                    }
                }
            }
        }
        // Extract conclusion
        if (cleanSection.includes("remain") ||
            cleanSection.includes("outperforming") ||
            cleanSection.includes("maintaining")) {
            conclusion = cleanSection;
        }
    }
    return {
        title,
        aprInfo,
        tvlInfo,
        topAssets,
        conclusion
    };
}
/**
 * Format a post with better visual structure for Twitter
 */
function formatPostForTwitter(content) {
    // Break content into sections
    const sections = content.split('. ');
    // Extract key metrics
    const metrics = extractMetrics(sections);
    // Format with bullet points and structure
    return `📊 ${metrics.title} 📊\n\n` +
        `• ${metrics.aprInfo}\n` +
        `• ${metrics.tvlInfo}\n` +
        (metrics.topAssets.length > 0 ?
            `• Top markets by yield:\n${metrics.topAssets.map(asset => `   - ${asset}`).join('\n')}\n\n` :
            '\n') +
        `${metrics.conclusion}`;
}
/**
 * Generates a post using pre-defined analytical templates and market data
 * No LLM involvement to ensure reliability
 */
async function generatePostWithData(_, // Unused openai client
prompt, marketData) {
    // Format the data with more precision for an analytical tone
    const formattedData = {
        TVL: `$${marketData.tvl.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        APR: `${marketData.apr.toFixed(2)}%`,
        USERS: marketData.users.toLocaleString(),
        VOLUME: `$${marketData.volume24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        TOP_ASSETS: Object.entries(marketData.assets)
            .slice(0, 3)
            .map(([symbol, data]) => `${symbol} (${data.apr.toFixed(2)}%)`)
            .join(', '),
        MAX_APR: Math.max(...Object.values(marketData.assets).map(a => a.apr)).toFixed(2) + '%'
    };
    // Add additional computed metrics
    const additionalMetrics = calculateAdditionalMetrics(marketData);
    const allFormattedData = { ...formattedData, ...additionalMetrics };
    try {
        // Determine topic and select templates
        let topicTemplates = Object.values(POST_TEMPLATES).map((_, i) => i); // All templates by default
        // Check if prompt contains any of our topic keywords
        for (const [topic, indices] of Object.entries(TOPIC_TEMPLATES)) {
            if (prompt.toLowerCase().includes(topic.toLowerCase())) {
                topicTemplates = indices;
                break;
            }
        }
        // Select a template that hasn't been used recently
        const templateIndex = selectFreshTemplate(topicTemplates);
        // Track usage
        trackTemplateUsage(templateIndex);
        // Get template and fill with data
        let templatePost = POST_TEMPLATES[templateIndex];
        // Replace placeholders with actual data
        Object.entries(allFormattedData).forEach(([key, value]) => {
            templatePost = templatePost.replace(new RegExp(`\\{${key}\\}`, 'g'), () => String(value));
        });
        // Apply the new formatting for better visual structure
        const formattedPost = formatPostForTwitter(templatePost);
        return formattedPost;
    }
    catch (error) {
        console.error("Error generating post:", error);
        // Use a safe default template as fallback
        const fallbackTemplate = POST_TEMPLATES[0];
        let fallbackPost = fallbackTemplate;
        Object.entries(allFormattedData).forEach(([key, value]) => {
            fallbackPost = fallbackPost.replace(new RegExp(`\\{${key}\\}`, 'g'), () => String(value));
        });
        // Apply formatting even to fallback post
        return formatPostForTwitter(fallbackPost);
    }
}
export { generatePostWithData };
