import { Chart } from "./types.js";
import { MarketData } from "../tools/jouleFinanceDataTool.js";
import { Canvas, CanvasRenderingContext2D } from "canvas";
export declare abstract class BaseChart implements Chart {
    title: string;
    width: number;
    height: number;
    data: MarketData;
    protected canvas: Canvas;
    protected ctx: CanvasRenderingContext2D;
    constructor(data: MarketData, title: string, width?: number, height?: number);
    protected setupCanvas(): void;
    protected drawTitle(): void;
    protected drawFooter(): void;
    abstract draw(): Promise<Canvas>;
    save(filename?: string): Promise<string>;
    getBase64(): Promise<string>;
}
