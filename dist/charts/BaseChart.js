import { createCanvas } from "canvas";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
// Add this to the top of your file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Base abstract chart class
export class BaseChart {
    title;
    width;
    height;
    data;
    canvas;
    ctx;
    constructor(data, title, width = 1200, height = 630) {
        this.data = data;
        this.title = title;
        this.width = width;
        this.height = height;
        // Create canvas
        this.canvas = createCanvas(width, height);
        this.ctx = this.canvas.getContext('2d');
    }
    // Common chart setup actions
    setupCanvas() {
        // Clear canvas
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.width, this.height);
        // Draw border
        this.ctx.strokeStyle = '#d3d3d3';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(5, 5, this.width - 10, this.height - 10);
    }
    // Draw chart title
    drawTitle() {
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.title, this.width / 2, 50);
    }
    // Draw footer with data source
    drawFooter() {
        this.ctx.fillStyle = '#666';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('Data: Joule Finance | ' + new Date().toISOString().split('T')[0], this.width - 30, this.height - 20);
    }
    // Save chart to file
    async save(filename) {
        // Ensure the output directory exists
        const chartDir = path.join(__dirname, '../../data/charts');
        fs.mkdirSync(chartDir, { recursive: true });
        // Generate filename if not provided
        if (!filename) {
            const timestamp = Date.now();
            const chartType = this.constructor.name.toLowerCase().replace('chart', '');
            filename = `joule-finance-${chartType}-${timestamp}.png`;
        }
        const filePath = path.join(chartDir, filename);
        // Draw the chart and save to file
        await this.draw();
        const buffer = this.canvas.toBuffer('image/png');
        fs.writeFileSync(filePath, buffer);
        console.log(`Chart saved to ${filePath}`);
        return filePath;
    }
    // Get chart as base64 encoded string
    async getBase64() {
        await this.draw();
        const buffer = this.canvas.toBuffer('image/png');
        return buffer.toString('base64');
    }
}
