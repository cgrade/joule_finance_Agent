import { ChartType, Chart } from "./types";
import { MarketData } from "../tools/jouleFinanceDataTool";
import { AssetDistributionChart } from "./AssetDistributionChart";
import { AprsComparisonChart } from "./AprsComparisonChart";
import { TvlTrendChart } from "./TvlTrendChart";
import { RiskAdjustedReturnChart } from "./RiskAdjustedReturnChart";

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