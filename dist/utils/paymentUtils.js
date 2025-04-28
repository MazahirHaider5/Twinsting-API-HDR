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
exports.capturePayPalPayment = exports.createPayPalOrder = exports.confirmStripePayment = exports.createStripePaymentIntent = void 0;
const stripe_1 = __importDefault(require("../config/stripe"));
const axios_1 = __importDefault(require("axios"));
const paypal_1 = require("../config/paypal");
const logger_1 = __importDefault(require("../config/logger"));
// Create Stripe payment intent
const createStripePaymentIntent = (amount_1, ...args_1) => __awaiter(void 0, [amount_1, ...args_1], void 0, function* (amount, currency = 'usd', metadata = {}) {
    try {
        const paymentIntent = yield stripe_1.default.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata,
            payment_method_types: ['card'],
        });
        return paymentIntent;
    }
    catch (error) {
        logger_1.default.error('Error creating Stripe payment intent:', error);
        throw new Error('Failed to create payment with Stripe');
    }
});
exports.createStripePaymentIntent = createStripePaymentIntent;
// Confirm Stripe payment
const confirmStripePayment = (paymentIntentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentIntent = yield stripe_1.default.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent;
    }
    catch (error) {
        logger_1.default.error('Error confirming Stripe payment:', error);
        throw new Error('Failed to confirm Stripe payment');
    }
});
exports.confirmStripePayment = confirmStripePayment;
// Create PayPal order
const createPayPalOrder = (amount_1, ...args_1) => __awaiter(void 0, [amount_1, ...args_1], void 0, function* (amount, currency = 'USD', description) {
    try {
        const accessToken = yield (0, paypal_1.getPayPalAccessToken)();
        const response = yield (0, axios_1.default)({
            method: 'post',
            url: `${paypal_1.PAYPAL_BASE_URL}/v2/checkout/orders`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            data: {
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: currency,
                            value: amount.toFixed(2),
                        },
                        description,
                    },
                ],
            },
        });
        return response.data;
    }
    catch (error) {
        logger_1.default.error('Error creating PayPal order:', error);
        throw new Error('Failed to create PayPal order');
    }
});
exports.createPayPalOrder = createPayPalOrder;
// Capture PayPal payment
const capturePayPalPayment = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = yield (0, paypal_1.getPayPalAccessToken)();
        const response = yield (0, axios_1.default)({
            method: 'post',
            url: `${paypal_1.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        return response.data;
    }
    catch (error) {
        logger_1.default.error('Error capturing PayPal payment:', error);
        throw new Error('Failed to capture PayPal payment');
    }
});
exports.capturePayPalPayment = capturePayPalPayment;
