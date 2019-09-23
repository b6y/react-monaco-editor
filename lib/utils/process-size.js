"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function processSize(size) {
    return !/^\d+$/.test(size) ? size : size + "px";
}
exports.processSize = processSize;
//# sourceMappingURL=process-size.js.map