import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";
import { rateLimit } from "./middlewares/rateLimit";
import { rawBodyParser } from "./middlewares/rawBodyParser";
import logger from "./config/logger";
import mongoose from "mongoose";
import connectDB from "./config/db";
import path from "path";
import routes from "./routes/index";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || process.env.ALLOWED_ORIGINS!.includes(origin)) {
        callback(null, true);
      } else {
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
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || process.env.ALLOWED_ORIGINS!.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(rawBodyParser);
app.use(express.json());
app.use(rateLimit);

// === Routes ===
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.get("/test", (req, res) => {
  res.status(200).json({ message: "Server working" });
});
app.use("/", routes);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

// === DB and Server Start ===
connectDB();

httpServer.listen(process.env.PORT!, () => {
  try {
    console.log(`Server running on port ${process.env.PORT!}`);
  } catch (error) {
    logger.error("Error starting server:", error);
  }
});

// === Graceful Shutdown ===
const gracefulShutdown = () => {
  httpServer.close(async () => {
    logger.info("Server shutting down...");
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Rejection:", error);
  process.exit(1);
});
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
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
