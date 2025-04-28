"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawBodyParser = void 0;
/**
 * Middleware to preserve raw body for Stripe webhooks
 * This is necessary because Stripe requires the raw request body for webhook signature verification
 */
const rawBodyParser = (req, res, next) => {
    if (req.originalUrl === '/api/order/webhook/stripe' && req.headers['stripe-signature']) {
        let data = '';
        req.setEncoding('utf8');
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            req.rawBody = data;
            next();
        });
    }
    else {
        next();
    }
};
exports.rawBodyParser = rawBodyParser;
