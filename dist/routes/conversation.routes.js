"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const conversations_controller_1 = require("../controllers/conversations.controller");
const router = express_1.default.Router();
router.post("/createOrGetExisConv", conversations_controller_1.createNewOrGetExistingConversation);
router.get("/getAllUserConversations/:userId", conversations_controller_1.getAllConversationsForAUser);
exports.default = router;
