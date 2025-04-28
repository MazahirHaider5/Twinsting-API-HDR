import { Request, Response } from "express";
import Subscription from "../models/subscription.model";

// Create a new subscription
export const createSubscription = async (req: Request, res: Response): Promise<void> => {
    const { subscriptionId, name, price, duration, subscriptionType, subscriptionFor } = req.body;

    try {
        const newSubscription = new Subscription({
            subscriptionId,
            name,
            price,
            duration,
            subscriptionType,
            subscriptionFor,
        });

        await newSubscription.save();
        res.status(201).json({ success: true, message: "Subscription created", subscription: newSubscription });
    } catch (error) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

export const getSubscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
        const subscriptions = await Subscription.find();
        res.status(200).json({ success: true, subscriptions });
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

export const updateSubscription = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const subscription = await Subscription.findByIdAndUpdate(id, updates, { new: true });

        if (!subscription) {
            res.status(404).json({ success: false, message: "Subscription not found" });
            return;
        }

        res.status(200).json({ success: true, message: "Subscription updated", subscription });
    } catch (error) {
        console.error("Error updating subscription:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

export const deleteSubscription = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const subscription = await Subscription.findByIdAndDelete(id);

        if (!subscription) {
            res.status(404).json({ success: false, message: "Subscription not found" });
            return;
        }

        res.status(200).json({ success: true, message: "Subscription deleted" });
    } catch (error) {
        console.error("Error deleting subscription:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
};
