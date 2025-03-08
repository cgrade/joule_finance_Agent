"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostingAgent = exports.createWriterAgent = exports.createReaderAgent = exports.createManagerAgent = void 0;
const managerAgent_1 = __importDefault(require("./managerAgent"));
exports.createManagerAgent = managerAgent_1.default;
const readerAgent_1 = __importDefault(require("./readerAgent"));
exports.createReaderAgent = readerAgent_1.default;
const writerAgent_1 = __importDefault(require("./writerAgent"));
exports.createWriterAgent = writerAgent_1.default;
const postingAgent_1 = __importDefault(require("./postingAgent"));
exports.createPostingAgent = postingAgent_1.default;
//# sourceMappingURL=index.js.map