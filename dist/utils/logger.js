"use strict";
/**
 * Simple logger utility for Move Agent Kit
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (message, ...args) => {
        console.log(`[INFO] ${message}`, ...args);
    },
    warn: (message, ...args) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.error(`[ERROR] ${message}`, ...args);
    },
    debug: (message, ...args) => {
        if (process.env.DEBUG === 'true') {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    }
};
//# sourceMappingURL=logger.js.map