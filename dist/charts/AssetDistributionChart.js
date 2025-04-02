import { BaseChart } from "./BaseChart.js";
export class AssetDistributionChart extends BaseChart {
    constructor(data) {
        super(data, "Joule Finance Asset Distribution");
    }
    async draw() {
        // Setup canvas
        this.setupCanvas();
        // Draw title
        this.drawTitle();
        // Draw subtitle with TVL and APR
        this.ctx.fillStyle = '#555';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`TVL: $${this.data.tvl.toLocaleString()} | Avg APR: ${this.data.apr.toFixed(2)}%`, this.width / 2, 90);
        // Draw asset distribution
        const assets = Object.entries(this.data.assets)
            .sort((a, b) => b[1].tvl - a[1].tvl)
            .slice(0, 7); // Show top 7 assets
        const totalTVL = assets.reduce((sum, [_, asset]) => sum + asset.tvl, 0);
        // Pie chart dimensions
        const centerX = this.width / 2;
        const centerY = this.height / 2 + 30;
        const radius = 180;
        // Define colors
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#97BBCD', '#DCDCDC'
        ];
        // Draw pie chart
        let startAngle = 0;
        let endAngle = 0;
        // First pass to draw slices
        assets.forEach(([symbol, asset], index) => {
            const percentage = asset.tvl / totalTVL;
            endAngle = startAngle + (Math.PI * 2 * percentage);
            // Draw slice
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            // Fill with color
            this.ctx.fillStyle = colors[index % colors.length];
            this.ctx.fill();
            // Store the mid-angle for the label
            const midAngle = startAngle + (endAngle - startAngle) / 2;
            // Draw label line
            const labelRadius = radius + 30;
            const labelX = centerX + Math.cos(midAngle) * labelRadius;
            const labelY = centerY + Math.sin(midAngle) * labelRadius;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + Math.cos(midAngle) * radius, centerY + Math.sin(midAngle) * radius);
            this.ctx.lineTo(labelX, labelY);
            this.ctx.strokeStyle = colors[index % colors.length];
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            // Draw label
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = midAngle < Math.PI ? 'left' : 'right';
            this.ctx.fillText(`${symbol}: ${(percentage * 100).toFixed(1)}%`, labelX + (midAngle < Math.PI ? 5 : -5), labelY);
            // Draw APR below
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`APR: ${asset.apr.toFixed(2)}%`, labelX + (midAngle < Math.PI ? 5 : -5), labelY + 20);
            // Update start angle for next slice
            startAngle = endAngle;
        });
        // Draw legend at the bottom
        this.drawLegend(assets, colors);
        // Draw footer
        this.drawFooter();
        return this.canvas;
    }
    drawLegend(assets, colors) {
        const legendX = 50;
        const legendY = this.height - 100;
        const itemHeight = 25;
        assets.forEach(([symbol, asset], index) => {
            const y = legendY + (index * itemHeight);
            // Draw color box
            this.ctx.fillStyle = colors[index % colors.length];
            this.ctx.fillRect(legendX, y, 20, 15);
            // Draw text
            this.ctx.fillStyle = '#333';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`${symbol}: $${asset.tvl.toLocaleString()} (${asset.apr.toFixed(2)}%)`, legendX + 30, y + 12);
        });
    }
}
