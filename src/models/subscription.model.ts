import mongoose, { Document, Schema } from "mongoose";

export interface ISubscription extends Document {
    name: string;
    price: number;
    duration: string; // e.g., "1 month", "1 year"
    subscriptionType: string; // e.g., "gold", "platinum"
    subscriptionFor: string; // e.g., "artist", "user"
}

const SubscriptionSchema: Schema<ISubscription> = new mongoose.Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        duration: { type: String, required: true },
        subscriptionType: { type: String, required: true },
        subscriptionFor: { type: String, required: true },
    },
    { timestamps: true }
);

const Subscription = mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
export default Subscription;
