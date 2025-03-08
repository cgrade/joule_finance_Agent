"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAssetDistributionChart = generateAssetDistributionChart;
const canvas_1 = require("canvas");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Generates a simple asset distribution chart for Joule Finance
 */
async function generateAssetDistributionChart(marketData) {
    console.log('Generating asset distribution chart...');
    // Create canvas and context
    const width = 800;
    const height = 400;
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const ctx = canvas.getContext('2d');
    // Fill background
    ctx.fillStyle = '#151e2e';
    ctx.fillRect(0, 0, width, height);
    // Add title
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Joule Finance Asset Distribution', width / 2, 30);
    // Sort assets by TVL
    const assets = Object.entries(marketData.assets)
        .sort((a, b) => b[1].tvl - a[1].tvl);
    // Calculate chart dimensions
    const chartX = 100;
    const chartY = 60;
    const chartWidth = width - 150;
    const chartHeight = height - 120;
    // Draw chart
    const barWidth = Math.min(50, chartWidth / assets.length - 10);
    let x = chartX;
    assets.forEach(([symbol, data]) => {
        const barHeight = (data.tvl / marketData.tvl) * chartHeight;
        const y = chartY + chartHeight - barHeight;
        // Draw bar
        ctx.fillStyle = getColorForAsset(symbol);
        ctx.fillRect(x, y, barWidth, barHeight);
        // Draw label
        ctx.font = '14px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(symbol, x + barWidth / 2, y - 10);
        // Draw percentage
        const percentage = ((data.tvl / marketData.tvl) * 100).toFixed(1);
        ctx.fillText(`${percentage}%`, x + barWidth / 2, y + 20);
        x += barWidth + 20;
    });
    // Add TVL total
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(`Total TVL: $${marketData.tvl.toLocaleString()}`, chartX, height - 20);
    // Save to file
    const outputDir = path.join(__dirname, '../../data/charts');
    fs.mkdirSync(outputDir, { recursive: true });
    const filename = `asset-distribution-${Date.now()}.png`;
    const outputPath = path.join(outputDir, filename);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Chart saved to ${outputPath}`);
    return outputPath;
}
// Helper to get color based on asset symbol
function getColorForAsset(symbol) {
    const colorMap = {
        'USDC': '#2775CA',
        'USDT': '#26A17B',
        'WETH': '#627EEA',
        'BTC': '#F7931A',
        'APT': '#4C5BDA',
        'Other': '#8A92B2'
    };
    return colorMap[symbol] || '#8A92B2';
}
//# sourceMappingURL=chartGenerator.js.map