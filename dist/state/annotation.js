"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateAnnotation = void 0;
const langraph_1 = require("langraph");
/**
 * LangGraph state annotation for the Poster agent system
 */
exports.StateAnnotation = langraph_1.Annotation.Root({
    // Define messages with proper reducer function
    messages: (0, langraph_1.Annotation)({
        reducer: (current, addition) => [...current, ...addition],
        default: () => []
    }),
    // Define lastPostTime with proper reducer function
    lastPostTime: (0, langraph_1.Annotation)({
        reducer: (_old, current) => current,
        default: () => new Date()
    }),
    // Define metrics with proper reducer function
    metrics: (0, langraph_1.Annotation)({
        reducer: (_old, current) => current,
        default: () => ({})
    })
});
// Export default as well for direct imports
exports.default = exports.StateAnnotation;
//# sourceMappingURL=annotation.js.map