import { JouleFinanceDataTool, XProfessionalPostTool, JouleKnowledgeBase } from "../tools/index.js";
export declare const buildPosterWorkflow: (jouleFinanceTool: JouleFinanceDataTool, xPostTool: XProfessionalPostTool, knowledgeBase?: JouleKnowledgeBase) => {
    invoke: (stateObject: any) => Promise<{
        poster_output: string;
        chart_url: string;
        full_content: string;
    }>;
};
export default buildPosterWorkflow;
