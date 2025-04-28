"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubscription = exports.updateSubscription = exports.getSubscriptions = exports.createSubscription = void 0;
const subscription_model_1 = __importDefault(require("../models/subscription.model"));
// Create a new subscription
const createSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subscriptionId, name, price, duration, subscriptionType, subscriptionFor } = req.body;
    try {
        const newSubscription = new subscription_model_1.default({
            subscriptionId,
            name,
            price,
            duration,
            subscriptionType,
            subscriptionFor,
        });
        yield newSubscription.save();
        res.status(201).json({ success: true, message: "Subscription created", subscription: newSubscription });
    }
    catch (error) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
});
exports.createSubscription = createSubscription;
const getSubscriptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subscriptions = yield subscription_model_1.default.find();
        res.status(200).json({ success: true, subscriptions });
    }
    catch (error) {
        console.error("Error fetching subscriptions:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
});
exports.getSubscriptions = getSubscriptions;
const updateSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updates = req.body;
    try {
        const subscription = yield subscription_model_1.default.findByIdAndUpdate(id, updates, { new: true });
        if (!subscription) {
            res.status(404).json({ success: false, message: "Subscription not found" });
            return;
        }
        res.status(200).json({ success: true, message: "Subscription updated", subscription });
    }
    catch (error) {
        console.error("Error updating subscription:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
});
exports.updateSubscription = updateSubscription;
const deleteSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const subscription = yield subscription_model_1.default.findByIdAndDelete(id);
        if (!subscription) {
            res.status(404).json({ success: false, message: "Subscription not found" });
            return;
        }
        res.status(200).json({ success: true, message: "Subscription deleted" });
    }
    catch (error) {
        console.error("Error deleting subscription:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
});
exports.deleteSubscription = deleteSubscription;
