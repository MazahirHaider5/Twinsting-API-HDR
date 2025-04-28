"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
dotenv_1.default.config();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    console.error('STRIPE_SECRET_KEY is not defined in environment variables');
    logger_1.default.error('STRIPE_SECRET_KEY is not defined in environment variables');
    process.exit(1);
}
const stripe = new stripe_1.default(stripeSecretKey, {
    apiVersion: '2025-02-24.acacia',
});
exports.default = stripe;
