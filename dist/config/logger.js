"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logFilePath = path_1.default.join(__dirname, "../logs/error.log");
const logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.json(),
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({
            filename: logFilePath,
            level: "error",
            maxsize: 2 * 1024 * 1024,
            maxFiles: 1,
            tailable: true
        })
    ]
});
exports.default = logger;
