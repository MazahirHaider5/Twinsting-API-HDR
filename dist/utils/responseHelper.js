"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, status, success, message, data) => {
    res.status(status).json(Object.assign({ success, message }, (data && { data })));
};
exports.default = sendResponse;
