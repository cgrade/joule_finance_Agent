import * as fs from "fs";
import * as path from "path";
export class ChartVisualizationTool {
    chartDir;
    constructor() {
        // Create charts directory if it doesn't exist
        this.chartDir = path.join(process.cwd(), "charts");
        if (!fs.existsSync(this.chartDir)) {
            fs.mkdirSync(this.chartDir, { recursive: true });
        }
    }
    /**
     * Create a chart visualization from market data
     */
    async createChart(data, title, type = "bar") {
        try {
            console.log(`Creating ${type} chart with title: ${title}`);
            // In a full implementation, this would create a real chart
            // For now, we'll simulate it by returning a mock URL
            // Logs for debugging
            console.log("Chart Data:", JSON.stringify(data));
            console.log("Chart Type:", type);
            // Return a mock image URL
            return `https://joule-finance.io/charts/${type}_chart_${Date.now()}.png`;
        }
        catch (error) {
            console.error("Error creating chart:", error);
            return "";
        }
    }
    /**
     * Draw a bar chart with the provided data
     */
    drawBarChart(ctx, data) {
        // Extract asset data
        const assets = data.assets || {};
        const assetNames = Object.keys(assets);
        // Chart dimensions
        const chartX = 80;
        const chartY = 400;
        const chartWidth = 640;
        const chartHeight = 300;
        // Draw axes
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(chartX, chartY - chartHeight);
        ctx.lineTo(chartX, chartY);
        ctx.lineTo(chartX + chartWidth, chartY);
        ctx.stroke();
        // Draw bars
        const barWidth = chartWidth / assetNames.length / 2;
        const colors = ["#0088ff", "#ff3377", "#33cc33", "#ffaa00", "#aa44ff"];
        assetNames.forEach((asset, i) => {
            const tvl = assets[asset].tvl || 0;
            const maxTvl = 10000000; // 10M scale
            const barHeight = (tvl / maxTvl) * chartHeight;
            const barX = chartX + (i + 0.5) * (chartWidth / assetNames.length);
            // Draw bar
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(barX - barWidth / 2, chartY - barHeight, barWidth, barHeight);
            // Label bar
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.font = "12px Arial";
            ctx.fillText(asset, barX, chartY + 20);
            ctx.fillText(`$${(tvl / 1000000).toFixed(1)}M`, barX, chartY - barHeight - 10);
        });
        // Y-axis labels
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) {
            const y = chartY - (i * chartHeight / 5);
            const value = (i * 10 / 5).toFixed(0);
            ctx.fillText(`$${value}M`, chartX - 10, y + 5);
        }
        // Chart title
        ctx.textAlign = "center";
        ctx.font = "bold 16px Arial";
        ctx.fillText("TVL by Asset", chartX + chartWidth / 2, 80);
    }
    /**
     * Draw a line chart with the provided data
     */
    drawLineChart(ctx, data) {
        // This implementation is simplified - would need historical data
        // For now, we'll create a simulated line chart using the asset APR values
        // Extract asset data
        const assets = data.assets || {};
        const assetNames = Object.keys(assets);
        // Chart dimensions
        const chartX = 80;
        const chartY = 400;
        const chartWidth = 640;
        const chartHeight = 300;
        // Draw axes
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(chartX, chartY - chartHeight);
        ctx.lineTo(chartX, chartY);
        ctx.lineTo(chartX + chartWidth, chartY);
        ctx.stroke();
        // Draw lines for each asset's APR
        const colors = ["#0088ff", "#ff3377", "#33cc33", "#ffaa00", "#aa44ff"];
        assetNames.forEach((asset, i) => {
            const apr = assets[asset].apr || 0;
            const points = [];
            // Generate some fake historical points based on current APR
            for (let j = 0; j < 10; j++) {
                const x = chartX + (j * chartWidth / 9);
                // Vary the APR slightly to create a line
                const variance = (Math.random() - 0.5) * 2;
                const value = apr + variance;
                const y = chartY - (value / 15) * chartHeight; // Scale APR to fit chart
                points.push({ x, y });
            }
            // Draw the line
            ctx.strokeStyle = colors[i % colors.length];
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let j = 1; j < points.length; j++) {
                ctx.lineTo(points[j].x, points[j].y);
            }
            ctx.stroke();
            // Add a label at the end of the line
            ctx.fillStyle = colors[i % colors.length];
            ctx.textAlign = "left";
            ctx.font = "12px Arial";
            ctx.fillText(`${asset}: ${apr.toFixed(1)}%`, points[9].x + 10, points[9].y);
        });
        // Y-axis labels (APR percentages)
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) {
            const y = chartY - (i * chartHeight / 5);
            const value = (i * 15 / 5).toFixed(0);
            ctx.fillText(`${value}%`, chartX - 10, y + 5);
        }
        // X-axis labels (time periods)
        ctx.textAlign = "center";
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
        for (let i = 0; i < 10; i++) {
            const x = chartX + (i * chartWidth / 9);
            ctx.fillText(months[i], x, chartY + 20);
        }
        // Chart title
        ctx.textAlign = "center";
        ctx.font = "bold 16px Arial";
        ctx.fillText("APR Trends by Asset", chartX + chartWidth / 2, 80);
    }
    /**
     * Draw a pie chart with the provided data
     */
    drawPieChart(ctx, data) {
        // Extract asset data for TVL distribution
        const assets = data.assets || {};
        const assetNames = Object.keys(assets);
        // Calculate total TVL and percentages
        const totalTVL = assetNames.reduce((sum, asset) => sum + (assets[asset].tvl || 0), 0) || 1;
        // Prepare data for pie chart
        const pieData = assetNames.map((asset, i) => ({
            name: asset,
            value: assets[asset].tvl || 0,
            percentage: ((assets[asset].tvl || 0) / totalTVL * 100).toFixed(1),
            color: ["#0088ff", "#ff3377", "#33cc33", "#ffaa00", "#aa44ff"][i % 5]
        }));
        // Center of pie chart
        const centerX = 400;
        const centerY = 250;
        const radius = 150;
        // Draw pie slices
        let startAngle = 0;
        pieData.forEach(slice => {
            const sliceAngle = (slice.value / totalTVL) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = slice.color;
            ctx.fill();
            // Draw label line and text
            const midAngle = startAngle + sliceAngle / 2;
            const labelRadius = radius * 1.2;
            const labelX = centerX + Math.cos(midAngle) * labelRadius;
            const labelY = centerY + Math.sin(midAngle) * labelRadius;
            ctx.beginPath();
            ctx.moveTo(centerX + Math.cos(midAngle) * radius, centerY + Math.sin(midAngle) * radius);
            ctx.lineTo(labelX, labelY);
            ctx.strokeStyle = slice.color;
            ctx.lineWidth = 2;
            ctx.stroke();
            // Add text label
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2 ? "right" : "left";
            ctx.font = "12px Arial";
            ctx.fillText(`${slice.name}: ${slice.percentage}%`, labelX, labelY);
            startAngle = endAngle;
        });
        // Chart title
        ctx.textAlign = "center";
        ctx.font = "bold 16px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("TVL Distribution", centerX, 80);
    }
    /**
     * Draw a leverage chart with the provided data
     */
    drawLeverageChart(ctx, data) {
        // Use leverage data if available, otherwise use sample data
        const leverageData = data.leverage || {
            "1x": 35,
            "2x": 25,
            "3x": 20,
            "4x": 15,
            "5x+": 5
        };
        const labels = Object.keys(leverageData);
        const values = Object.values(leverageData);
        // Chart dimensions
        const chartX = 80;
        const chartY = 400;
        const chartWidth = 640;
        const chartHeight = 300;
        // Draw axes
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(chartX, chartY - chartHeight);
        ctx.lineTo(chartX, chartY);
        ctx.lineTo(chartX + chartWidth, chartY);
        ctx.stroke();
        // Draw bars
        const barWidth = chartWidth / labels.length / 2;
        const colors = ["#0088ff", "#33cc33", "#ffaa00", "#ff3377", "#aa44ff"];
        let maxValue = Math.max(...values);
        maxValue = maxValue > 0 ? maxValue : 100;
        labels.forEach((label, i) => {
            const value = values[i];
            const barHeight = (value / maxValue) * chartHeight;
            const barX = chartX + (i + 0.5) * (chartWidth / labels.length);
            // Draw bar
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(barX - barWidth / 2, chartY - barHeight, barWidth, barHeight);
            // Label bar
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.font = "14px Arial";
            ctx.fillText(label, barX, chartY + 20);
            ctx.fillText(`${value}%`, barX, chartY - barHeight - 10);
        });
        // Y-axis labels
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) {
            const y = chartY - (i * chartHeight / 5);
            const value = Math.round(i * maxValue / 5);
            ctx.fillText(`${value}%`, chartX - 10, y + 5);
        }
        // Chart title
        ctx.textAlign = "center";
        ctx.font = "bold 16px Arial";
        ctx.fillText("User Leverage Distribution", chartX + chartWidth / 2, 80);
        // Add note
        ctx.font = "italic 12px Arial";
        ctx.fillText("Data shows % of users at each leverage level", chartX + chartWidth / 2, 105);
    }
}
