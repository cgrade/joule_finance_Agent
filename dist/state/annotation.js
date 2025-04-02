import { Annotation } from "@langchain/langgraph";
/**
 * LangGraph state annotation for the Poster agent system
 */
export const StateAnnotation = Annotation.Root({
    // Define messages with proper reducer function
    messages: Annotation({
        reducer: (current, addition) => [...current, ...addition],
        default: () => []
    }),
    // Define lastPostTime with proper reducer function
    lastPostTime: Annotation({
        reducer: (_old, current) => current,
        default: () => new Date()
    }),
    // Define metrics with proper reducer function
    metrics: Annotation({
        reducer: (_old, current) => current,
        default: () => ({})
    })
});
// Export default as well for direct imports
export default StateAnnotation;
