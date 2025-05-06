"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const rateLimit_1 = require("./middlewares/rateLimit");
const rawBodyParser_1 = require("./middlewares/rawBodyParser");
const logger_1 = __importDefault(require("./config/logger"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = __importDefault(require("./config/db"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./routes/index"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
// Socket.IO setup
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || process.env.ALLOWED_ORIGINS.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true
    }
});
// === Socket.IO Events ===
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("sendMessage", ({ conversationId, sender, text }) => {
        // Emit to all clients (can be changed to emit to specific users)
        io.emit("receiveMessage", { conversationId, sender, text });
    });
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});
// === Middlewares ===
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || process.env.ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)("combined", { stream: { write: (message) => logger_1.default.info(message.trim()) } }));
app.use(rawBodyParser_1.rawBodyParser);
app.use(express_1.default.json());
app.use(rateLimit_1.rateLimit);
// === Routes ===
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.get("/test", (req, res) => {
    res.status(200).json({ message: "Server working" });
});
app.use("/", index_1.default);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});
// === DB and Server Start ===
(0, db_1.default)();
httpServer.listen(process.env.PORT, () => {
    try {
        console.log(`Server running on port ${process.env.PORT}`);
    }
    catch (error) {
        logger_1.default.error("Error starting server:", error);
    }
});
// === Graceful Shutdown ===
const gracefulShutdown = () => {
    httpServer.close(() => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.info("Server shutting down...");
        yield mongoose_1.default.disconnect();
        logger_1.default.info("Disconnected from MongoDB");
        process.exit(0);
    }));
};
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
process.on("unhandledRejection", (error) => {
    logger_1.default.error("Unhandled Rejection:", error);
    process.exit(1);
});
process.on("uncaughtException", (error) => {
    logger_1.default.error("Uncaught Exception:", error);
    process.exit(1);
});
// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import compression from "compression";
// import morgan from "morgan";
// import dotenv from "dotenv";
// import { rateLimit } from "./middlewares/rateLimit";
// import { rawBodyParser } from "./middlewares/rawBodyParser";
// import logger from "./config/logger";
// import mongoose from "mongoose";
// import connectDB from "./config/db";
// import path from "path";
// import routes from "./routes/index";
// dotenv.config();
// const app = express();
// // Middlewares
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || process.env.ALLOWED_ORIGINS!.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
//     allowedHeaders: ["Content-Type", "Authorization"]
//   })
// );
// app.use(helmet());
// app.use(compression());
// app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));
// // Raw body parser for Stripe webhooks
// app.use(rawBodyParser);
// app.use(express.json());
// app.use(rateLimit);
// // Routes
// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// app.get("/test", (req, res) => {
//   res.status(200).json({ message: "Server working" });
// });
// app.use("/", routes);
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found."
//   });
// });
// // Server
// connectDB();
// const server = app.listen(process.env.PORT!, () => {
//   try {
//     console.log(`Server running on port ${process.env.PORT!}`);
//   } catch (error) {
//     logger.error("Error starting server:", error);
//   }
// });
// const gracefulShutdown = () => {
//   server.close(async () => {
//     logger.info("Server shutting down...");
//     await mongoose.disconnect();
//     logger.info("Disconnected from MongoDB");
//     process.exit(0);
//   });
// };
// process.on("SIGTERM", gracefulShutdown);
// process.on("SIGINT", gracefulShutdown);
// process.on("unhandledRejection", (error) => {
//   logger.error("Unhandled Rejection:", error);
//   process.exit(1);
// });
// process.on("uncaughtException", (error) => {
//   logger.error("Uncaught Exception:", error);
//   process.exit(1);
// });
