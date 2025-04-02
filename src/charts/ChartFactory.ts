import { ChartType, Chart } from "./types.js";
import { MarketData } from "../tools/jouleFinanceDataTool.js";
import { AssetDistributionChart } from "./AssetDistributionChart.js";
import { AprsComparisonChart } from "./AprsComparisonChart.js";
import { TvlTrendChart } from "./TvlTrendChart.js";
import { RiskAdjustedReturnChart } from "./RiskAdjustedReturnChart.js";

export class ChartFactory {
  static createChart(type: ChartType, data: MarketData): Chart {
    switch (type) {
      case ChartType.AssetDistribution:
        return new AssetDistributionChart(data);
      case ChartType.AprsComparison:
        return new AprsComparisonChart(data);
      case ChartType.TvlTrend:
        return new TvlTrendChart(data);
      case ChartType.RiskAdjustedReturn:
        return new RiskAdjustedReturnChart(data);
      default:
        throw new Error(`Unsupported chart type: ${type}`);
    }
  }
} 