import { BaseMessage } from "@langchain/core/messages";
/**
 * LangGraph state annotation for the Poster agent system
 */
export declare const StateAnnotation: import("@langchain/langgraph").AnnotationRoot<{
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
    lastPostTime: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
    metrics: import("@langchain/langgraph").BinaryOperatorAggregate<{
        tvl?: number;
        apy?: number;
    }, {
        tvl?: number;
        apy?: number;
    }>;
}>;
export default StateAnnotation;
