import { ChartType, Chart } from "./types.js";
import { MarketData } from "../tools/jouleFinanceDataTool.js";
export declare class ChartFactory {
    static createChart(type: ChartType, data: MarketData): Chart;
}
