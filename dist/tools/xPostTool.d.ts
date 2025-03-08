export declare class XProfessionalPostTool {
    visualizationTool: ChartVisualizationTool;
    constructor(visualizationTool: ChartVisualizationTool);
    createChart(data: any, title: string, type: string): Promise<string>;
    visualize(data: any): Promise<string>;
}
