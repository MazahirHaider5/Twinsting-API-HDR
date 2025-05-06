import { Request, Response } from "express";
import sendResponse from "../utils/responseHelper";
import logger from "../config/logger";
import Message, { IMessage } from "../models/message.model";
import mongoose from "mongoose";

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  const { conversationId, sender, text } = req.body;

  if (!conversationId || !sender || !text) {
    sendResponse(res, 400, false, "conversationId, sender, and text are required");
    return;
  }

  const newMessage: IMessage = new Message({ conversationId, sender, text });

  try {
    const savedMessage = await newMessage.save();
    sendResponse(res, 200, true, "Message sent successfully", savedMessage);
  } catch (error) {
    logger.error("Error sending message:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const getMessagesInChat = async(req:Request, res: Response) => {
  const { conversationId } = req.params;

  if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
    sendResponse(res, 400, false, "Valid userId is required");
    return;
  }
  try {
    const messages = await Message.find({
      conversationId
    });
    sendResponse(res, 200, true, "Messages fetched for chat successfuly", messages);
  } catch (error) {
    logger.error("Error fetching messages:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
}


export const markMessagesAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const { conversationId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      sendResponse(res, 400, false, "Valid userId is required");
      return;
    }

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      sendResponse(res, 400, false, "Valid conversationId is required");
      return;
    }

    const result = await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        isRead: false
      },
      { $set: { isRead: true } }
    );

    sendResponse(res, 200, true, "Messages marked as read", { modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};