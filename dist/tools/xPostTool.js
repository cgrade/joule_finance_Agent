// Add visualization methods to XProfessionalPostTool
export class XProfessionalPostTool {
    visualizationTool;
    constructor(visualizationTool) {
        this.visualizationTool = visualizationTool;
    }
    // Add visualization methods
    async createChart(data, title, type) {
        const result = await this.visualizationTool._call({
            chart_type: type,
            title: title,
            data: data,
            width: 600,
            height: 400
        });
        return result.path;
    }
    async visualize(data) {
        return this.createChart(data, "Joule Finance Data", "line");
    }
}
