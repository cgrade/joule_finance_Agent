import { BaseChart } from "./BaseChart.js";
import { MarketData } from "../tools/jouleFinanceDataTool.js";
import { Canvas } from "canvas";
export declare class TvlTrendChart extends BaseChart {
    constructor(data: MarketData);
    draw(): Promise<Canvas>;
}
