import { ChartVisualizationTool } from './visualization.js';

// Add visualization methods to XProfessionalPostTool
export class XProfessionalPostTool {
  constructor(public visualizationTool: ChartVisualizationTool) {}
  
  // Add visualization methods
  async createChart(data: any, title: string, type: string): Promise<string> {
    const result = await this.visualizationTool._call({
      chart_type: type,
      title: title,
      data: data,
      width: 600,
      height: 400
    });
    
    return result.path;
  }
  
  async visualize(data: any): Promise<string> {
    return this.createChart(data, "Joule Finance Data", "line");
  }
}