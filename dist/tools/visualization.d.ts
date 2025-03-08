import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
/**
 * Tool for generating chart visualizations
 */
export declare class ChartVisualizationTool extends StructuredTool {
    name: string;
    description: string;
    schema: z.ZodObject<{
        chart_type: z.ZodEnum<["line", "bar", "pie", "doughnut"]>;
        title: z.ZodString;
        data: z.ZodUnion<[z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodNumber, "many">]>;
        labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        colors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        width: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        height: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        data: Record<string, number> | number[];
        chart_type: "line" | "bar" | "pie" | "doughnut";
        title: string;
        width: number;
        height: number;
        labels?: string[] | undefined;
        colors?: string[] | undefined;
    }, {
        data: Record<string, number> | number[];
        chart_type: "line" | "bar" | "pie" | "doughnut";
        title: string;
        labels?: string[] | undefined;
        colors?: string[] | undefined;
        width?: number | undefined;
        height?: number | undefined;
    }>;
    private outputDir;
    constructor(outputDir?: string);
    _call(args: {
        chart_type: string;
        title: string;
        data: Record<string, number> | number[];
        labels?: string[];
        colors?: string[];
        width?: number;
        height?: number;
    }): Promise<{
        path: string;
        url?: string;
        error?: string;
    }>;
    /**
     * Creates a mock chart image for development purposes
     * @returns Path to the mock chart
     */
    private generateMockChart;
    /**
     * Creates a sample chart image for development purposes
     * @param filepath Path to save the chart image
     */
    private createSampleChartImage;
    /**
     * Ensures the output directory exists
     */
    private ensureOutputDirectory;
}
export default ChartVisualizationTool;
