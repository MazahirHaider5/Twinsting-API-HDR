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
exports.getAllConversationsForAUser = exports.createNewOrGetExistingConversation = void 0;
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const logger_1 = __importDefault(require("../config/logger"));
const mongoose_1 = __importDefault(require("mongoose"));
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
const message_model_1 = __importDefault(require("../models/message.model"));
const createNewOrGetExistingConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { senderId, receiverId } = req.body;
        // if (!req.user) {
        //   sendResponse(res, 401, false, "Unauthorized access");
        //   return;
        // }
        if (!senderId || !receiverId) {
            (0, responseHelper_1.default)(res, 400, false, "senderId and receiverId are required");
            return;
        }
        let conversation = yield conversation_model_1.default.findOne({
            participants: { $all: [senderId, receiverId] }
        });
        if (!conversation) {
            conversation = new conversation_model_1.default({ participants: [senderId, receiverId] });
            yield conversation.save();
        }
        (0, responseHelper_1.default)(res, 200, true, "Conversation retrieved or created successfully", conversation);
    }
    catch (error) {
        logger_1.default.error("Error creating or fetching conversation:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.createNewOrGetExistingConversation = createNewOrGetExistingConversation;
const getAllConversationsForAUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
            (0, responseHelper_1.default)(res, 400, false, "Valid userId is required");
            return;
        }
        // Fetch the user's conversations
        const conversations = yield conversation_model_1.default.find({
            participants: userId
        })
            .populate("participants", "_id username email name profilePicture")
            .lean();
        const conversationIds = conversations.map((c) => c._id);
        const totalConversations = conversations.length;
        // Get last message for each conversation
        const lastMessages = yield message_model_1.default.aggregate([
            { $match: { conversationId: { $in: conversationIds } } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$conversationId",
                    lastMessage: { $first: "$$ROOT" }
                }
            }
        ]);
        // Get unread message count per conversation
        const unreadCounts = yield message_model_1.default.aggregate([
            {
                $match: {
                    conversationId: { $in: conversationIds },
                    sender: { $ne: new mongoose_1.default.Types.ObjectId(userId) },
                    isRead: false
                }
            },
            {
                $group: {
                    _id: "$conversationId",
                    unreadCount: { $sum: 1 }
                }
            }
        ]);
        // Calculate the total number of unread messages across all conversations
        const totalUnreadMessages = unreadCounts.reduce((total, item) => total + item.unreadCount, 0);
        // Combine lastMessage and unreadCount into the conversation response
        const enrichedConversations = conversations.map((convo) => {
            const lastMessageObj = lastMessages.find((m) => { var _a; return m._id.toString() === ((_a = convo._id) === null || _a === void 0 ? void 0 : _a.toString()); });
            const unreadCountObj = unreadCounts.find((u) => { var _a; return u._id.toString() === ((_a = convo._id) === null || _a === void 0 ? void 0 : _a.toString()); });
            // Get the receiver (the participant who is NOT the current user)
            const receiver = convo.participants.find((p) => p._id.toString() !== userId);
            const sender = convo.participants.find((p) => p._id.toString() !== userId);
            return Object.assign(Object.assign({}, convo), { lastMessage: (lastMessageObj === null || lastMessageObj === void 0 ? void 0 : lastMessageObj.lastMessage) || null, unreadCount: (unreadCountObj === null || unreadCountObj === void 0 ? void 0 : unreadCountObj.unreadCount) || 0, receiver,
                sender });
        });
        // Send the response including the total unread messages
        (0, responseHelper_1.default)(res, 200, true, "Conversations fetched successfully", {
            conversations: enrichedConversations,
            totalUnreadMessages,
            totalConversations,
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching conversations:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.getAllConversationsForAUser = getAllConversationsForAUser;
