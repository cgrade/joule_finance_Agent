import { MarketData } from "../tools/jouleFinanceDataTool.js";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Add this near the beginning of the file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced professional templates for an on-chain data analyst
const POST_TEMPLATES = [
  // TVL focused analytical templates
  "🚀 JOULE FINANCE IS MOONING! 📈\n\nTVL EXPLOSION: {TVL} 💰\nYield Chads eating good with {APR} APR 🤑\n\nWhales loading up on:\n{TOP_ASSETS} 🐋\n\nStill early anon... #DeFi #Aptos $APT",
  
  "🔥 BREAKING: JOULE FINANCE TAKING OVER! 🏦\n\nMassive TVL pump: {TVL}\nGiga brain yields: {APR}\nTop money makers:\n{TOP_ASSETS}\n\nNGMI if you're not in... 📈 #YieldFarming #Aptos",
  
  "📈 ULTRA BULLISH JOULE FINANCE UPDATE 🐂\n\n- TVL mooning: {TVL} 🚀\n- Degen APRs: up to {MAX_APR} 💸\n- Top assets printing: {TOP_ASSETS} 💎\n\nLFG! #DeFiSeason #Aptos",
  
  // Volume focused templates
  "💎 JOULE FINANCE VOLUME GOING PARABOLIC!\n\n24h Volume: {VOLUME} 📊\nTVL: {TVL} 💰\nTop yield farms:\n{TOP_ASSETS}\n\nPump it! 🚀 #DeFi #Aptos",
  
  "🌊 MASSIVE LIQUIDITY FLOWING INTO JOULE!\n\nVolume exploding: {VOLUME}/24h\nChads depositing: {TVL} TVL\nBest plays:\n{TOP_ASSETS}\n\nWen moon? NOW! 🌕 #Aptos #DeFi",
  
  // Yield focused templates
  "🤑 JOULE FINANCE YIELD ALERT! 💸\n\nBest degen plays:\n{TOP_ASSETS}\n\nAvg APR: {APR}\nTVL: {TVL}\n\nStill sleeping on these gains? NGMI 😴 #PassiveIncome #Aptos",
  
  "💰 JOULE FINANCE MONEY PRINTER GO BRRR!\n\nTop yields:\n{TOP_ASSETS}\n\nTVL locked: {TVL}\nMean APR: {APR}\n\nFree money glitch? 🎮 #DeFiYields #Aptos",
  
  // Market dominance templates
  "👑 JOULE FINANCE DOMINATING APTOS DEFI!\n\nTVL: {TVL} 📈\nMarket share: {MARKET_SHARE}%\nTop assets:\n{TOP_ASSETS}\n\nNumber go up technology 🚀 #Aptos #DeFi",
  
  "🏆 JOULE FINANCE SUPREMACY!\n\nTVL ATH incoming: {TVL}\nGiga chad yields: {MAX_APR}\nBullish on:\n{TOP_ASSETS}\n\nImagine not aping in 🤡 #Aptos #DeFi"
];

// Store the last 10 used templates to avoid repetition
let recentlyUsedTemplates: number[] = [];
const MAX_HISTORY = 10;

// Topic to template mapping to select appropriate templates for specific topics
const TOPIC_TEMPLATES = {
  "yield": [5, 6, 7, 8],        // Yield focused templates
  "lending": [0, 1, 2, 3],        // TVL focused templates
  "market": [3, 4, 0, 1],            // Volume focused + TVL templates
  "user": [0, 1, 2, 3],           // TVL focused templates
  "integration": [0, 1, 2, 3],  // TVL focused templates
  "security": [0, 1, 2, 3],       // TVL focused templates
  "optimize": [5, 6, 7, 8],     // Yield focused templates
  "cross-chain": [0, 1, 2, 3]  // TVL focused templates
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
 * Enhanced formatting function
 */
function formatPostForTwitter(content: string): string {
  // Remove any duplicate lines
  const lines = content.split('\n');
  const uniqueLines = [...new Set(lines)];
  
  // Add some degen flair with emojis
  const degenEmojis = ['🚀', '💎', '🐂', '🤑', '💰', '📈', '🔥'];
  const randomEmoji = () => degenEmojis[Math.floor(Math.random() * degenEmojis.length)];
  
  // Format numbers with K/M suffixes
  const formatNumber = (num: string) => {
    const n = parseFloat(num.replace(/[^0-9.]/g, ''));
    if (n >= 1e6) return `${(n/1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`;
    return num;
  };
  
  // Process each line
  const enhancedLines = uniqueLines.map(line => {
    // Add emojis to key metrics
    if (line.includes('TVL')) return `${randomEmoji()} ${line}`;
    if (line.includes('APR')) return `${randomEmoji()} ${line}`;
    if (line.includes('Volume')) return `${randomEmoji()} ${line}`;
    
    // Format numbers
    if (/\$[\d,]+/.test(line)) {
      return line.replace(/\$[\d,]+(\.\d+)?/g, match => `$${formatNumber(match)}`);
    }
    
    return line;
  });
  
  return enhancedLines.join('\n');
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