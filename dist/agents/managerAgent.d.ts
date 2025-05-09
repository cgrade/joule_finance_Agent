import { PosterState } from "../state/types.js";
/**
 * Creates a manager agent that coordinates the workflow
 */
export declare const createManagerAgent: () => (state: PosterState) => Promise<Partial<PosterState>>;
export default createManagerAgent;
