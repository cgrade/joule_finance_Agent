import { BaseChart } from "./BaseChart.js";
import { MarketData } from "../tools/jouleFinanceDataTool.js";
import { Canvas } from "canvas";

export class RiskAdjustedReturnChart extends BaseChart {
  constructor(data: MarketData) {
    super(data, "Joule Finance Risk/Return Analysis");
  }
  
  async draw(): Promise<Canvas> {
    // Setup canvas
    this.setupCanvas();
    
    // Draw title
    this.drawTitle();
    
    // Draw "Coming Soon" message for now
    this.ctx.fillStyle = '#555';
    this.ctx.font = '30px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Risk/Return Analysis - Coming Soon', 
      this.width / 2, this.height / 2);
    
    this.ctx.font = '20px Arial';
    this.ctx.fillText('Will display risk-adjusted returns for each asset', 
      this.width / 2, this.height / 2 + 40);
    
    // Draw footer
    this.drawFooter();
    
    return this.canvas;
  }
} 