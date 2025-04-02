import { PosterState } from "../state/types.js";
import { JouleFinanceDataTool } from "../tools/jouleFinance.js";
/**
 * Creates a data reader agent that fetches Joule Finance metrics
 */
export declare const createReaderAgent: (jouleFinanceReader: JouleFinanceDataTool) => (state: PosterState) => Promise<Partial<PosterState>>;
export default createReaderAgent;
