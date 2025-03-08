import { PosterState } from "../state/types";
import { JouleFinanceDataTool } from "../tools/jouleFinance";
/**
 * Creates a data reader agent that fetches Joule Finance metrics
 */
export declare const createReaderAgent: (jouleFinanceReader: JouleFinanceDataTool) => (state: PosterState) => Promise<Partial<PosterState>>;
export default createReaderAgent;
