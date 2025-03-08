import { PosterState } from "../state/types";
import { XProfessionalPostTool } from "../tools/socialMedia";
/**
 * Creates a posting agent that posts content to social media
 */
export declare const createPostingAgent: (xPoster: XProfessionalPostTool) => (state: PosterState) => Promise<Partial<PosterState>>;
export default createPostingAgent;
