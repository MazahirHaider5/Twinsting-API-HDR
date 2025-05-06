import mongoose, { Document, Schema, Model } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Message: Model<IMessage> = mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
