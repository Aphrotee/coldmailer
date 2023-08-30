"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function throwError(errorMessage) {
    /* print error message in red and the stop the process with exit status 1 */
    console.error("\x1b[31m%s\x1b[0m", errorMessage);
    process.exit(1);
}
exports.default = throwError;
