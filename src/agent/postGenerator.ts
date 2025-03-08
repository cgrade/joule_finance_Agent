import { MarketData } from "../tools/jouleFinanceDataTool";
import * as fs from 'fs';
import * as path from 'path';

// Enhanced professional templates for an on-chain data analyst
const POST_TEMPLATES = [
  // TVL focused analytical templates
  "Joule Finance analysis: TVL now at {TVL} with consistent growth in Q2. Average yields of {APR} across markets, with {TOP_ASSETS} leading in capital efficiency. Protocol fundamentals remain strong.",
  "TVL update for Joule Finance: {TVL} in total locked value, showing +{TVL_CHANGE}% WoW growth. Asset distribution weighted toward {TOP_ASSETS} with {APR} blended yield across offerings.",
  "Capital allocation analysis: Joule Finance's {TVL} TVL shows increasing institutional interest. {TOP_ASSETS} compose {TOP_PERCENTAGE}% of total value, with {APR} weighted average yield maintaining competitive position.",
  
  // User-focused analytical templates
  "User adoption metrics: Joule Finance now serving {USERS} active wallets managing {TVL} in TVL. Capital efficiency ratio at 0.76, with yields reaching {MAX_APR} on select assets. Retention rate remains above sector average.",
  "User growth trajectory: Joule Finance reaching {USERS} verified users with {TVL_PER_USER} average TVL per user. New user acquisition cost declining while retention metrics show improvement. {TOP_ASSETS} seeing highest engagement.",
  "Wallet distribution analysis: {USERS} active addresses interacting with Joule Finance, with average deposit size of {TVL_PER_USER}. Whales account for 32% of {TVL} total TVL, with retail adoption accelerating.",
  
  // Volume focused analytical templates
  "Trading volume analysis for Joule Finance: {VOLUME} processed in last 24h with {TVL} total value locked. Liquidity depth improving across {TOP_ASSETS}. On-chain indicators suggest healthy capital utilization.",
  "Volume metrics: Joule Finance recording {VOLUME} in 24h transaction volume, representing {VOLUME_TO_TVL}% of {TVL} TVL. Trading activity concentrated in {TOP_ASSETS}, suggesting increasing market depth.",
  "Liquidity flow analysis: {VOLUME} in transaction volume across Joule Finance markets in past 24h. Capital velocity increasing with utilization rate of {UTILIZATION}%. Particularly strong activity in {TOP_ASSETS} pairs.",
  
  // APR focused analytical templates
  "Yield analysis: Joule Finance currently offering {APR} average APR with sustainable tokenomics model. {TVL} in managed assets across diversified pools. Top performing markets: {TOP_ASSETS}. Risk-adjusted returns outperforming ecosystem average.",
  "Interest rate model assessment: Joule Finance maintaining {APR} mean APR across {TVL} in deposits. Rate stability remains high with volatility index at 0.14, significantly below ecosystem average. {TOP_ASSETS} offering premium yields.",
  "Yield curve analysis: Joule Finance's average yield of {APR} positions protocol favorably against competitors. Term structure showing positive slope with {TOP_ASSETS} generating highest returns on {TVL} capital base.",
  
  // Integration focused analytical templates
  "Joule Finance ecosystem integration report: Protocol now maintains {TVL} TVL with {USERS} users across multiple markets. Deep liquidity with competitive rates enables cross-protocol capital efficiency. Utilization metrics show healthy reserve ratios.",
  "Cross-protocol interaction data: Joule Finance's {TVL} liquidity actively utilized across Aptos DeFi ecosystem. Integration depth increasing with {INTEGRATIONS_COUNT} protocol connections. Capital efficiency multiplier measured at 1.32x.",
  "Ecosystem positioning analysis: Joule Finance's {TVL} in TVL represents {ECOSYSTEM_SHARE}% of Aptos TVL. Strategic integrations with {INTEGRATIONS_COUNT} protocols driving compounding yield opportunities averaging {APR}.",
  
  // Feature focused analytical templates
  "Technical analysis of Joule Finance: {TVL} in managed assets with {USERS} active users and {APR} mean yield. Protocol security rating remains high with multi-layer risk management system. Capital efficiency ratio: 0.82.",
  "Protocol health assessment: Joule Finance's {TVL} TVL supported by robust technical fundamentals. Security audit coverage at 100% with formal verification of core contracts. Risk parameters optimized for {APR} sustainable yield.",
  "Feature utilization metrics: Analysis of Joule Finance's {USERS} users shows 73% engagement with advanced protocol features. Multi-asset collateralization seeing highest adoption, driving efficient use of {TVL} locked capital.",
  
  // Specific feature analytical templates
  "Multi-asset lending market analysis: Joule Finance's core markets ({TOP_ASSETS}) show strong fundamentals with {TVL} TVL and mean yields of {APR}. Collateralization ratio remains healthy at 142%. Capital efficiency trending upward.",
  "Collateral efficiency report: Joule Finance's multi-asset model achieving 82% capital efficiency across {TVL} in deposits. Weighted average LTV of 65% balances capital efficiency with protocol safety. {TOP_ASSETS} most actively used as collateral.",
  "Lending market dynamics: Joule Finance's {TVL} lending pools showing balanced utilization metrics. Supply-side concentration decreasing with Gini coefficient of 0.64. Blended interest rate of {APR} maintains competitive position.",
  
  "Yield strategy performance data: Joule Finance's automated strategies generating up to {MAX_APR} with {TVL} in managed assets. Risk-adjusted returns outperforming sector benchmarks. Strategy diversification offering optimal risk-reward profiles.",
  "Automated yield optimization assessment: Strategies managing {TVL} in assets with performance metrics showing {APR} blended return. Sharpe ratio of 1.8 indicates superior risk-adjusted performance. {TOP_ASSETS} strategies delivering highest alpha.",
  "Strategy performance metrics: Joule Finance's yield optimizers delivering {APR} time-weighted returns on {TVL} managed capital. Drawdown parameters remain within defined thresholds with maximum recorded at 3.2% in volatile conditions.",
  
  "Cross-chain capital flows: Joule Finance managing {TVL} across diversified assets including {TOP_ASSETS}. Yields of up to {MAX_APR} available on Aptos, positioning protocol as a significant cross-chain liquidity provider. Bridged asset reserves above target.",
  "Bridged asset analysis: {TVL} in cross-chain assets deployed through Joule Finance. Inflow velocity increasing at {INFLOW_RATE}% monthly with {TOP_ASSETS} seeing highest demand. Bridge utilization maintaining 94% efficiency ratio.",
  "Inter-blockchain liquidity report: Joule Finance facilitating efficient cross-chain capital deployment of {TVL} total value. Asset composition favoring {TOP_ASSETS} with average deployed yield of {APR}. Slippage metrics showing continued improvement."
];

// Store the last 10 used templates to avoid repetition
let recentlyUsedTemplates: number[] = [];
const MAX_HISTORY = 10;

// Topic to template mapping to select appropriate templates for specific topics
const TOPIC_TEMPLATES = {
  "yield": [9, 10, 11, 21, 22, 23],        // APR focused + yield strategies templates
  "lending": [0, 1, 2, 18, 19, 20],        // TVL focused + multi-asset lending templates
  "market": [6, 7, 8, 0, 1, 2],            // Volume focused + TVL templates
  "user": [3, 4, 5, 12, 13, 14],           // User focused + integration templates
  "integration": [12, 13, 14, 24, 25, 26], // Integration focused + cross-chain templates
  "security": [15, 16, 17, 0, 1, 2],       // Feature focused + TVL templates
  "optimize": [21, 22, 23, 9, 10, 11],     // Yield strategies + APR templates
  "cross-chain": [24, 25, 26, 12, 13, 14]  // Cross-chain + integration templates
};

// Additional computed metrics for richer templates
function calculateAdditionalMetrics(marketData: MarketData) {
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
function trackTemplateUsage(templateIndex: number) {
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
  } catch (error) {
    console.error("Error saving template history:", error);
  }
}

/**
 * Loads template usage history from disk
 */
function loadTemplateHistory(): number[] {
  try {
    const historyFile = path.join(__dirname, '../../data/template-history.json');
    if (fs.existsSync(historyFile)) {
      const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      return Array.isArray(history) ? history : [];
    }
  } catch (error) {
    console.error("Error loading template history:", error);
  }
  return [];
}

// Initialize history on module load
recentlyUsedTemplates = loadTemplateHistory();

/**
 * Selects a template that hasn't been used recently
 */
function selectFreshTemplate(topicTemplates: number[]): number {
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
function extractMetrics(sections: string[]): {
  title: string;
  aprInfo: string;
  tvlInfo: string;
  topAssets: string[];
  conclusion: string;
} {
  // Default values
  let title = "Joule Finance Analysis";
  let aprInfo = "Competitive APR across markets";
  let tvlInfo = "Strong TVL growth";
  let topAssets: string[] = [];
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
function formatPostForTwitter(content: string): string {
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
async function generatePostWithData(
  _: any, // Unused openai client
  prompt: string,
  marketData: MarketData
): Promise<string> {
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
  const allFormattedData = {...formattedData, ...additionalMetrics};

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
      templatePost = templatePost.replace(
        new RegExp(`\\{${key}\\}`, 'g'), 
        () => String(value)
      );
    });
    
    // Apply the new formatting for better visual structure
    const formattedPost = formatPostForTwitter(templatePost);
    
    return formattedPost;
  } catch (error) {
    console.error("Error generating post:", error);
    
    // Use a safe default template as fallback
    const fallbackTemplate = POST_TEMPLATES[0]; 
    let fallbackPost = fallbackTemplate;
    
    Object.entries(allFormattedData).forEach(([key, value]) => {
      fallbackPost = fallbackPost.replace(
        new RegExp(`\\{${key}\\}`, 'g'), 
        () => String(value)
      );
    });
    
    // Apply formatting even to fallback post
    return formatPostForTwitter(fallbackPost);
  }
}

export { generatePostWithData }; 