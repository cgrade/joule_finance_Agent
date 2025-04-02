import { MarketData } from "../tools/jouleFinanceDataTool.js";
import { Canvas } from "canvas";
export declare enum ChartType {
    AssetDistribution = "asset_distribution",
    AprsComparison = "aprs_comparison",
    TvlTrend = "tvl_trend",
    RiskAdjustedReturn = "risk_adjusted_return"
}
export interface Chart {
    title: string;
    width: number;
    height: number;
    data: MarketData;
    draw(): Promise<Canvas>;
    save(filename?: string): Promise<string>;
    getBase64(): Promise<string>;
}
