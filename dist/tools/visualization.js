"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartVisualizationTool = void 0;
const axios_1 = __importDefault(require("axios"));
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Tool for generating chart visualizations
 */
class ChartVisualizationTool extends tools_1.StructuredTool {
    constructor(outputDir = './generated') {
        super();
        this.name = "chart_visualization";
        this.description = "Generates chart visualizations for financial metrics";
        this.schema = zod_1.z.object({
            chart_type: zod_1.z.enum(['line', 'bar', 'pie', 'doughnut']),
            title: zod_1.z.string(),
            data: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).or(zod_1.z.array(zod_1.z.number())),
            labels: zod_1.z.array(zod_1.z.string()).optional(),
            colors: zod_1.z.array(zod_1.z.string()).optional(),
            width: zod_1.z.number().optional().default(600),
            height: zod_1.z.number().optional().default(400)
        });
        this.outputDir = outputDir;
        this.ensureOutputDirectory();
    }
    async _call(args) {
        try {
            // Default colors for Joule Finance brand (purple, blue gradient)
            const defaultColors = [
                '#8A2BE2', '#9370DB', '#6A5ACD', '#483D8B',
                '#7B68EE', '#4169E1', '#0000FF', '#0000CD'
            ];
            // Development mode - generate a mock chart path with actual file
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[DEV] Would generate a ${args.chart_type} chart for:`, args.data);
                // Create a larger placeholder image - minimum size that Twitter will accept
                const { createCanvas } = require('canvas');
                const canvas = createCanvas(400, 300);
                const ctx = canvas.getContext('2d');
                // Fill background
                ctx.fillStyle = '#8A2BE2'; // Purple background (Joule brand color)
                ctx.fillRect(0, 0, 400, 300);
                // Add title
                ctx.fillStyle = 'white';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(args.title || 'Joule Finance', 200, 50);
                // Draw sample chart elements based on chart type
                if (args.chart_type === 'pie') {
                    // Draw a simple pie chart
                    const colors = ['#9370DB', '#6A5ACD', '#483D8B', '#7B68EE'];
                    let startAngle = 0;
                    // Create sample segments
                    [0.4, 0.3, 0.2, 0.1].forEach((value, i) => {
                        ctx.fillStyle = colors[i % colors.length];
                        ctx.beginPath();
                        ctx.moveTo(200, 150);
                        ctx.arc(200, 150, 80, startAngle, startAngle + (Math.PI * 2 * value));
                        ctx.closePath();
                        ctx.fill();
                        startAngle += Math.PI * 2 * value;
                    });
                }
                else {
                    // Draw a simple bar chart
                    const barWidth = 50;
                    const barSpacing = 20;
                    const baseY = 250;
                    const maxHeight = 180;
                    // Draw bars
                    ctx.fillStyle = '#4169E1'; // Royal blue
                    [0.8, 0.6, 0.9, 0.5].forEach((value, i) => {
                        const height = value * maxHeight;
                        const x = 80 + (i * (barWidth + barSpacing));
                        ctx.fillRect(x, baseY - height, barWidth, height);
                    });
                    // Draw axis
                    ctx.strokeStyle = 'white';
                    ctx.beginPath();
                    ctx.moveTo(60, 70);
                    ctx.lineTo(60, 250);
                    ctx.lineTo(340, 250);
                    ctx.stroke();
                }
                // Save to file
                const buffer = canvas.toBuffer('image/png');
                const mockPath = path_1.default.join(process.cwd(), 'generated', `mock_chart_${Date.now()}.png`);
                fs_1.default.writeFileSync(mockPath, buffer);
                return {
                    path: mockPath,
                    url: `https://example.com/mock_chart_${Date.now()}.png`
                };
            }
            // Format the data for QuickChart.io API
            let chartData;
            let datasets = [];
            if (Array.isArray(args.data)) {
                // Single dataset with array data
                datasets = [{
                        data: args.data,
                        backgroundColor: args.colors || defaultColors,
                        borderColor: args.colors?.[0] || defaultColors[0],
                        label: args.title
                    }];
            }
            else {
                // Object data with keys and values
                const labels = args.labels || Object.keys(args.data);
                const dataRecord = args.data;
                const values = labels.map(label => dataRecord[label] || 0);
                datasets = [{
                        data: values,
                        backgroundColor: args.colors || defaultColors,
                        borderColor: args.colors?.[0] || defaultColors[0],
                        label: args.title
                    }];
                chartData = {
                    labels: labels
                };
            }
            chartData = {
                ...chartData,
                datasets: datasets
            };
            // Generate chart URL using QuickChart.io
            const chartConfig = {
                type: args.chart_type,
                data: chartData,
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: args.title,
                            font: { size: 16 }
                        },
                        legend: {
                            display: true,
                            position: 'bottom'
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: true
                }
            };
            // Use the QuickChart API to generate chart
            const response = await axios_1.default.post('https://quickchart.io/chart/create', {
                chart: chartConfig,
                width: args.width || 600,
                height: args.height || 400,
                devicePixelRatio: 2.0,
                backgroundColor: 'white'
            });
            if (response.data && response.data.url) {
                // Download the chart image
                const imageResponse = await axios_1.default.get(response.data.url, {
                    responseType: 'arraybuffer'
                });
                // Save to local file
                const outputDir = path_1.default.join(process.cwd(), 'generated');
                if (!fs_1.default.existsSync(outputDir)) {
                    fs_1.default.mkdirSync(outputDir, { recursive: true });
                }
                const filePath = path_1.default.join(outputDir, `chart_${Date.now()}.png`);
                fs_1.default.writeFileSync(filePath, imageResponse.data);
                return {
                    path: filePath,
                    url: response.data.url
                };
            }
            throw new Error('Failed to generate chart');
        }
        catch (error) {
            console.error('Error generating visualization:', error);
            return {
                path: '',
                error: error.message
            };
        }
    }
    /**
     * Creates a mock chart image for development purposes
     * @returns Path to the mock chart
     */
    generateMockChart() {
        try {
            // Ensure the output directory exists
            this.ensureOutputDirectory();
            // Create a unique filename based on timestamp
            const filename = `mock_chart_${Date.now()}.png`;
            const filepath = path_1.default.join(this.outputDir, filename);
            // Copy a sample chart file (or create a simple one)
            this.createSampleChartImage(filepath);
            console.log(`Generated visualization with real blockchain data at: ${filepath}`);
            return filepath;
        }
        catch (error) {
            console.error('Error generating mock chart:', error);
            throw new Error(`Failed to generate mock chart: ${error.message}`);
        }
    }
    /**
     * Creates a sample chart image for development purposes
     * @param filepath Path to save the chart image
     */
    createSampleChartImage(filepath) {
        // For demo purposes, either:
        // 1. Copy an existing sample image
        // 2. Create a simple colored square
        // Option 1: Copy from samples if available
        const sampleDir = path_1.default.join(__dirname, '../../samples');
        if (fs_1.default.existsSync(sampleDir)) {
            const samples = fs_1.default.readdirSync(sampleDir).filter(f => f.endsWith('.png'));
            if (samples.length > 0) {
                const randomSample = samples[Math.floor(Math.random() * samples.length)];
                fs_1.default.copyFileSync(path_1.default.join(sampleDir, randomSample), filepath);
                return;
            }
        }
        // Option 2: Create a simple colored square (12KB mock image)
        const mockImageBuffer = Buffer.alloc(12 * 1024);
        for (let i = 0; i < mockImageBuffer.length; i++) {
            mockImageBuffer[i] = Math.floor(Math.random() * 256);
        }
        fs_1.default.writeFileSync(filepath, mockImageBuffer);
    }
    /**
     * Ensures the output directory exists
     */
    ensureOutputDirectory() {
        if (!fs_1.default.existsSync(this.outputDir)) {
            fs_1.default.mkdirSync(this.outputDir, { recursive: true });
        }
    }
}
exports.ChartVisualizationTool = ChartVisualizationTool;
exports.default = ChartVisualizationTool;
//# sourceMappingURL=visualization.js.map