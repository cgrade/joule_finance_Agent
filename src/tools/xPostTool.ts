// Add visualization methods to XProfessionalPostTool
export class XProfessionalPostTool {
  constructor(public visualizationTool: ChartVisualizationTool) {}
  
  // Add visualization methods
  async createChart(data: any, title: string, type: string): Promise<string> {
    return this.visualizationTool.createChart(data, title, type);
  }
  
  async visualize(data: any): Promise<string> {
    return this.createChart(data, "Joule Finance Data", "line");
  }
} 