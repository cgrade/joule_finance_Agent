import { MarketData } from "../tools/jouleFinanceDataTool.js";
import { Canvas } from "canvas";

// Chart types enum
export enum ChartType {
  AssetDistribution = "asset_distribution",
  AprsComparison = "aprs_comparison",
  TvlTrend = "tvl_trend",
  RiskAdjustedReturn = "risk_adjusted_return"
}

// Base Chart interface
export interface Chart {
  // Properties
  title: string;
  width: number;
  height: number;
  data: MarketData;
  
  // Methods
  draw(): Promise<Canvas>;
  save(filename?: string): Promise<string>;
  getBase64(): Promise<string>;
} 