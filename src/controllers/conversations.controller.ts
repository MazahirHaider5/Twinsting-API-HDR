import { Request, Response } from "express";
import sendResponse from "../utils/responseHelper";
import logger from "../config/logger";
import mongoose from "mongoose";
import Conversation, { IConversation } from "../models/conversation.model";
import Message from "../models/message.model";

export const createNewOrGetExistingConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { senderId, receiverId } = req.body;

    // if (!req.user) {
    //   sendResponse(res, 401, false, "Unauthorized access");
    //   return;
    // }

    if (!senderId || !receiverId) {
      sendResponse(res, 400, false, "senderId and receiverId are required");
      return;
    }

    let conversation: IConversation | null = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = new Conversation({ participants: [senderId, receiverId] });
      await conversation.save();
    }

    sendResponse(res, 200, true, "Conversation retrieved or created successfully", conversation);
  } catch (error) {
    logger.error("Error creating or fetching conversation:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const getAllConversationsForAUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      sendResponse(res, 400, false, "Valid userId is required");
      return;
    }

    // Fetch the user's conversations
    const conversations: IConversation[] = await Conversation.find({
      participants: userId
    })
      .populate("participants", "_id username email name profilePicture")
      .lean();

    const conversationIds = conversations.map((c) => c._id);
    const totalConversations = conversations.length;

    // Get last message for each conversation
    const lastMessages = await Message.aggregate([
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
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          conversationId: { $in: conversationIds },
          sender: { $ne: new mongoose.Types.ObjectId(userId) },
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
      const lastMessageObj = lastMessages.find((m) => m._id.toString() === convo._id?.toString());
      const unreadCountObj = unreadCounts.find((u) => u._id.toString() === convo._id?.toString());

         // Get the receiver (the participant who is NOT the current user)
         const receiver = convo.participants.find(
          (p) => p._id.toString() !== userId
        );
         const sender = convo.participants.find(
          (p) => p._id.toString() !== userId
        );

      return {
        ...convo,
        lastMessage: lastMessageObj?.lastMessage || null,
        unreadCount: unreadCountObj?.unreadCount || 0,
        receiver,
        sender
      };
    });

    // Send the response including the total unread messages
    sendResponse(res, 200, true, "Conversations fetched successfully", {
      conversations: enrichedConversations,
      totalUnreadMessages,
      totalConversations,
      
    });
  } catch (error) {
    logger.error("Error fetching conversations:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};
