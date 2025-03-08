import { ChartVisualizationTool } from './visualization';
import { XPostResult } from '../types';
/**
 * Tool for posting professional content to X/Twitter
 */
export declare class XProfessionalPostTool {
    private twitterClient;
    private visualizationTool;
    private developmentMode;
    constructor(visualizationTool: ChartVisualizationTool, devMode?: boolean);
    /**
     * Posts a tweet with optional image visualization
     * @param content Tweet text content
     * @param shouldVisualize Whether to include a data visualization
     * @returns Result of posting operation
     */
    postTweet(content: string, shouldVisualize?: boolean): Promise<XPostResult>;
    /**
     * Posts a real tweet to X/Twitter
     * @param content Tweet text content
     * @param mediaPath Optional path to media file
     * @returns Result of posting operation
     */
    private postRealTweet;
}
export default XProfessionalPostTool;
