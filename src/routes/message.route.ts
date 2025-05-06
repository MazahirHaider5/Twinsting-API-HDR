import express from "express";
import requireAuth from "../middlewares/requireAuth";
import { getMessagesInChat, markMessagesAsRead, sendMessage } from "../controllers/messages.controller";


const router = express.Router();
router.post("/sendMessage", sendMessage)
router.get("/getMessagesInChat/:conversationId", getMessagesInChat)
router.put("/read/:conversationId", markMessagesAsRead)

export default router;
