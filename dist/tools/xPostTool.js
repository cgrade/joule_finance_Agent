"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XProfessionalPostTool = void 0;
// Add visualization methods to XProfessionalPostTool
class XProfessionalPostTool {
    constructor(visualizationTool) {
        this.visualizationTool = visualizationTool;
    }
    // Add visualization methods
    async createChart(data, title, type) {
        return this.visualizationTool.createChart(data, title, type);
    }
    async visualize(data) {
        return this.createChart(data, "Joule Finance Data", "line");
    }
}
exports.XProfessionalPostTool = XProfessionalPostTool;
//# sourceMappingURL=xPostTool.js.map