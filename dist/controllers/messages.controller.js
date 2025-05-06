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
exports.markMessagesAsRead = exports.getMessagesInChat = exports.sendMessage = void 0;
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const logger_1 = __importDefault(require("../config/logger"));
const message_model_1 = __importDefault(require("../models/message.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId, sender, text } = req.body;
    if (!conversationId || !sender || !text) {
        (0, responseHelper_1.default)(res, 400, false, "conversationId, sender, and text are required");
        return;
    }
    const newMessage = new message_model_1.default({ conversationId, sender, text });
    try {
        const savedMessage = yield newMessage.save();
        (0, responseHelper_1.default)(res, 200, true, "Message sent successfully", savedMessage);
    }
    catch (error) {
        logger_1.default.error("Error sending message:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.sendMessage = sendMessage;
const getMessagesInChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    if (!conversationId || !mongoose_1.default.Types.ObjectId.isValid(conversationId)) {
        (0, responseHelper_1.default)(res, 400, false, "Valid userId is required");
        return;
    }
    try {
        const messages = yield message_model_1.default.find({
            conversationId
        });
        (0, responseHelper_1.default)(res, 200, true, "Messages fetched for chat successfuly", messages);
    }
    catch (error) {
        logger_1.default.error("Error fetching messages:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.getMessagesInChat = getMessagesInChat;
const markMessagesAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const { conversationId } = req.params;
        if (!userId || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
            (0, responseHelper_1.default)(res, 400, false, "Valid userId is required");
            return;
        }
        if (!conversationId || !mongoose_1.default.Types.ObjectId.isValid(conversationId)) {
            (0, responseHelper_1.default)(res, 400, false, "Valid conversationId is required");
            return;
        }
        const result = yield message_model_1.default.updateMany({
            conversationId,
            sender: { $ne: userId },
            isRead: false
        }, { $set: { isRead: true } });
        (0, responseHelper_1.default)(res, 200, true, "Messages marked as read", { modifiedCount: result.modifiedCount });
    }
    catch (error) {
        console.error("Error marking messages as read:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.markMessagesAsRead = markMessagesAsRead;
