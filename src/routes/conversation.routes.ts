import express from "express";
import requireAuth from "../middlewares/requireAuth";
import { createNewOrGetExistingConversation, getAllConversationsForAUser } from "../controllers/conversations.controller";



const router = express.Router();
router.post("/createOrGetExisConv", createNewOrGetExistingConversation)
router.get("/getAllUserConversations/:userId", getAllConversationsForAUser)

export default router;
