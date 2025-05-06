"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messages_controller_1 = require("../controllers/messages.controller");
const router = express_1.default.Router();
router.post("/sendMessage", messages_controller_1.sendMessage);
router.get("/getMessagesInChat/:conversationId", messages_controller_1.getMessagesInChat);
router.put("/read/:conversationId", messages_controller_1.markMessagesAsRead);
exports.default = router;
