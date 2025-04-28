"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SubscriptionSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String, required: true },
    subscriptionType: { type: String, required: true },
    subscriptionFor: { type: String, required: true },
}, { timestamps: true });
const Subscription = mongoose_1.default.model("Subscription", SubscriptionSchema);
exports.default = Subscription;
