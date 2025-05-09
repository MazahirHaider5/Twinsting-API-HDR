import express from "express";
import requireAuth from "../middlewares/requireAuth";
import { createNewOrGetExistingConversation, getAllConversationsForAUser, getConversationById } from "../controllers/conversations.controller";



const router = express.Router();
router.post("/createOrGetExisConv", createNewOrGetExistingConversation)
router.get("/getAllUserConversations/:userId", getAllConversationsForAUser)
router.get("/getConversationById/:conversationId", getConversationById)

export default router;
