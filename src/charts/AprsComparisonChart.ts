import { BaseChart } from "./BaseChart";
import { MarketData } from "../tools/jouleFinanceDataTool";
import { Canvas } from "canvas";

export class AprsComparisonChart extends BaseChart {
  constructor(data: MarketData) {
    super(data, "Joule Finance APR Comparison");
  }
  
  async draw(): Promise<Canvas> {
    // Setup canvas
    this.setupCanvas();
    
    // Draw title
    this.drawTitle();
    
    // Draw subtitle
    this.ctx.fillStyle = '#555';
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Average Lending APR: ${this.data.apr.toFixed(2)}%`, this.width / 2, 90);
    
    // Prepare data - sort by APR descending
    const assets = Object.entries(this.data.assets)
      .sort((a, b) => b[1].apr - a[1].apr);
    
    // Bar chart dimensions
    const chartX = 150;
    const chartY = 150;
    const chartWidth = this.width - 300;
    const chartHeight = 350;
    const barSpacing = 40;
    const barWidth = Math.min(60, (chartWidth / assets.length) - barSpacing);
    
    // Find max APR for scaling
    const maxAPR = Math.max(...assets.map(([_, asset]) => asset.apr)) * 1.2; // 20% padding
    
    // Draw chart background
    this.ctx.fillStyle = '#f5f5f5';
    this.ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
    
    // Draw horizontal grid lines
    const gridLines = 5;
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i <= gridLines; i++) {
      const y = chartY + (i * (chartHeight / gridLines));
      this.ctx.beginPath();
      this.ctx.moveTo(chartX, y);
      this.ctx.lineTo(chartX + chartWidth, y);
      this.ctx.stroke();
      
      // Draw APR labels
      const apr = maxAPR - (i * (maxAPR / gridLines));
      this.ctx.fillStyle = '#666';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`${apr.toFixed(1)}%`, chartX - 10, y + 5);
    }
    
    // Draw bars
    assets.forEach(([symbol, asset], index) => {
      const barHeight = (asset.apr / maxAPR) * chartHeight;
      const barX = chartX + (index * (barWidth + barSpacing)) + barSpacing;
      const barY = chartY + chartHeight - barHeight;
      
      // Create gradient for bar
      const gradient = this.ctx.createLinearGradient(barX, barY, barX, chartY + chartHeight);
      gradient.addColorStop(0, '#36A2EB');
      gradient.addColorStop(1, '#4BC0C0');
      
      // Draw bar
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Draw border
      this.ctx.strokeStyle = '#2980b9';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(barX, barY, barWidth, barHeight);
      
      // Draw asset symbol
      this.ctx.fillStyle = '#333';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(symbol, barX + barWidth / 2, chartY + chartHeight + 25);
      
      // Draw APR value above bar
      this.ctx.fillStyle = '#333';
      this.ctx.fillText(`${asset.apr.toFixed(2)}%`, barX + barWidth / 2, barY - 10);
    });
    
    // Draw Y-axis title
    this.ctx.save();
    this.ctx.translate(50, chartY + chartHeight / 2);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('APR (%)', 0, 0);
    this.ctx.restore();
    
    // Draw X-axis title
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Assets', chartX + chartWidth / 2, chartY + chartHeight + 60);
    
    // Draw extra note
    this.ctx.fillStyle = '#555';
    this.ctx.font = 'italic 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Standard lending rates shown. Boosted APRs may be higher.', 
      this.width / 2, this.height - 60);
    
    // Draw footer
    this.drawFooter();
    
    return this.canvas;
  }
} 