export declare class ChartVisualizationTool {
    private chartDir;
    constructor();
    /**
     * Create a chart visualization from market data
     */
    createChart(data: any, title: string, type?: string): Promise<string>;
    /**
     * Draw a bar chart with the provided data
     */
    private drawBarChart;
    /**
     * Draw a line chart with the provided data
     */
    private drawLineChart;
    /**
     * Draw a pie chart with the provided data
     */
    private drawPieChart;
    /**
     * Draw a leverage chart with the provided data
     */
    private drawLeverageChart;
}
