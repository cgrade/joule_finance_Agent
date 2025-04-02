import { BaseChart } from "./BaseChart.js";
export class RiskAdjustedReturnChart extends BaseChart {
    constructor(data) {
        super(data, "Joule Finance Risk/Return Analysis");
    }
    async draw() {
        // Setup canvas
        this.setupCanvas();
        // Draw title
        this.drawTitle();
        // Draw "Coming Soon" message for now
        this.ctx.fillStyle = '#555';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Risk/Return Analysis - Coming Soon', this.width / 2, this.height / 2);
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Will display risk-adjusted returns for each asset', this.width / 2, this.height / 2 + 40);
        // Draw footer
        this.drawFooter();
        return this.canvas;
    }
}
