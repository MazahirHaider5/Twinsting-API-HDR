import mongoose, { Document, Schema, Model } from "mongoose";

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ConversationSchema: Schema<IConversation> = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }]
  },
  { timestamps: true }
);

const Conversation: Model<IConversation> = mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
