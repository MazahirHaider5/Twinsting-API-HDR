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
exports.updateOrder = exports.getArtistOrders = exports.getAllOrders = exports.capturePayPalPayment = exports.createPayPalCheckout = exports.stripeWebhook = exports.createStripeCheckout = exports.updateOrderStatus = exports.getUserOrders = exports.getOrderDetails = exports.createOrder = void 0;
const order_model_1 = __importDefault(require("../models/order.model"));
const service_model_1 = __importDefault(require("../models/service.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const logger_1 = __importDefault(require("../config/logger"));
const stripe_1 = __importDefault(require("../config/stripe"));
const paymentUtils_1 = require("../utils/paymentUtils");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Create a new order
 */
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { serviceId, pricingType, deliveryDate, location } = req.body;
        const userId = req.user.id; // This is the user making the order
        const service = yield service_model_1.default.findById(serviceId);
        if (!service) {
            return (0, responseHelper_1.default)(res, 404, false, "Service not found");
        } // Check if pricing exists for the selected type
        const artistId = service.artist_id;
        const validPricingTypes = ["starter", "standard", "advance"];
        if (!validPricingTypes.includes(pricingType)) {
            return (0, responseHelper_1.default)(res, 400, false, "Invalid pricing type. Must be 'starter', 'standard', or 'advance'");
        }
        if (!service.pricing || !service.pricing[pricingType]) {
            return (0, responseHelper_1.default)(res, 400, false, `${pricingType} pricing plan not found for this service`);
        }
        const pricing = service.pricing[pricingType];
        const orderTitle = `${service.title} - ${pricing.name}`;
        // Create the order with user ID and booking date time
        const newOrder = new order_model_1.default({
            service_id: serviceId,
            order_title: orderTitle,
            location,
            delivery_date: new Date(deliveryDate),
            amount: pricing.price,
            status: "active",
            user_id: userId,
            artist_id: artistId, // Set this to the artist's ID from the service
            booking_date_time: new Date()
        });
        yield newOrder.save();
        yield service_model_1.default.findByIdAndUpdate(serviceId, { $push: { orders: newOrder._id } });
        (0, responseHelper_1.default)(res, 201, true, "Order created successfully", newOrder);
    }
    catch (error) {
        console.error("Error creating order:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.createOrder = createOrder;
/**
 * Get order details
 */
const getOrderDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { orderId } = req.params;
        // Populate both service and artist details
        const order = yield order_model_1.default.findById(orderId)
            .populate("service_id")
            .populate("artist_id", "name profilePicture email location");
        if (!order) {
            return (0, responseHelper_1.default)(res, 404, false, "Order not found");
        }
        (0, responseHelper_1.default)(res, 200, true, "Order details retrieved successfully", order);
    }
    catch (error) {
        logger_1.default.error("Error fetching order details:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.getOrderDetails = getOrderDetails;
/**
 * Get all orders for the current user
 */
const getUserOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        console.log("Authenticated User ID:", req.user.id); // Log the user ID
        const orders = yield order_model_1.default.find({ user_id: req.user.id }).populate("service_id");
        if (orders.length === 0) {
            return (0, responseHelper_1.default)(res, 200, true, "No orders found for this user", []);
        }
        // Fetch user details
        const user = yield user_model_1.default.findById(req.user.id);
        const ordersWithUserDetails = orders.map((order) => (Object.assign(Object.assign({}, order.toObject()), { user: user })));
        (0, responseHelper_1.default)(res, 200, true, "User orders retrieved successfully", ordersWithUserDetails);
    }
    catch (error) {
        logger_1.default.error("Error fetching user orders:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.getUserOrders = getUserOrders;
/**
 * Update order status
 */
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { orderId } = req.params;
        console.log("Order ID:", orderId);
        console.log("Valid ObjectId:", mongoose_1.default.Types.ObjectId.isValid(orderId));
        // const { status } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(orderId)) {
            return (0, responseHelper_1.default)(res, 400, false, "Invalid Order ID");
        }
        const updatedOrder = yield order_model_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(orderId), { status: "completed" }, { new: true });
        if (!updatedOrder) {
            return (0, responseHelper_1.default)(res, 404, false, "Order not found");
        }
        (0, responseHelper_1.default)(res, 200, true, "Order status updated successfully", updatedOrder);
    }
    catch (error) {
        logger_1.default.error("Error updating order status:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.updateOrderStatus = updateOrderStatus;
/**
 * Create Stripe payment intent for an order
 */
const createStripeCheckout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { orderId } = req.params;
        // Get order details
        const order = (yield order_model_1.default.findById(orderId));
        if (!order) {
            return (0, responseHelper_1.default)(res, 404, false, "Order not found");
        }
        // Check if order is already paid
        if (order.is_paid) {
            return (0, responseHelper_1.default)(res, 400, false, "Order is already paid");
        }
        // Create a payment intent with Stripe
        const paymentIntent = yield (0, paymentUtils_1.createStripePaymentIntent)(order.amount, "usd", {
            orderId: ((_a = order._id) === null || _a === void 0 ? void 0 : _a.toString()) || orderId
        });
        (0, responseHelper_1.default)(res, 200, true, "Stripe payment intent created", {
            clientSecret: paymentIntent.client_secret,
            amount: order.amount
        });
    }
    catch (error) {
        logger_1.default.error("Error creating Stripe checkout:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.createStripeCheckout = createStripeCheckout;
const stripeWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const signature = req.headers["stripe-signature"];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        let event;
        try {
            // Use the raw body for signature verification
            const rawBody = req.rawBody || req.body;
            event = stripe_1.default.webhooks.constructEvent(rawBody, signature, endpointSecret);
        }
        catch (err) {
            logger_1.default.error(`Webhook signature verification failed: ${err}`);
            return (0, responseHelper_1.default)(res, 400, false, `Webhook signature verification failed`);
        }
        // Handle the event
        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;
            // Update the order
            if (paymentIntent.metadata && paymentIntent.metadata.orderId) {
                const orderId = paymentIntent.metadata.orderId;
                yield order_model_1.default.findByIdAndUpdate(orderId, { is_paid: true }, { new: true });
                logger_1.default.info(`Payment succeeded for order ${orderId}`);
            }
        }
        (0, responseHelper_1.default)(res, 200, true, "Webhook received");
    }
    catch (error) {
        logger_1.default.error("Error processing Stripe webhook:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.stripeWebhook = stripeWebhook;
/**
 * Create PayPal order for checkout
 */
const createPayPalCheckout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { orderId } = req.params;
        // Get order details
        const order = (yield order_model_1.default.findById(orderId).populate("service_id"));
        if (!order) {
            return (0, responseHelper_1.default)(res, 404, false, "Order not found");
        }
        // Check if order is already paid
        if (order.is_paid) {
            return (0, responseHelper_1.default)(res, 400, false, "Order is already paid");
        }
        // Create a PayPal order
        const paypalOrder = yield (0, paymentUtils_1.createPayPalOrder)(order.amount, "USD", `Payment for order ${order.order_number}`);
        // Save PayPal order ID to local database or session if needed
        (0, responseHelper_1.default)(res, 200, true, "PayPal order created", {
            // orderId: paypalOrder.id,
            amount: order.amount
        });
    }
    catch (error) {
        logger_1.default.error("Error creating PayPal checkout:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.createPayPalCheckout = createPayPalCheckout;
/**
 * Capture PayPal payment
 */
const capturePayPalPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { orderId } = req.params;
        const { paypalOrderId } = req.body;
        // Get order details
        const order = (yield order_model_1.default.findById(orderId));
        if (!order) {
            return (0, responseHelper_1.default)(res, 404, false, "Order not found");
        }
        // Check if order is already paid
        if (order.is_paid) {
            return (0, responseHelper_1.default)(res, 400, false, "Order is already paid");
        }
        // Capture the PayPal payment
        const captureData = yield (0, paymentUtils_1.capturePayPalPayment)(paypalOrderId);
        // If payment was successful, update the order
        // if (captureData.status === 'COMPLETED') {
        //   await Order.findByIdAndUpdate(
        //     orderId,
        //     { is_paid: true },
        //     { new: true }
        //   );
        //   sendResponse(res, 200, true, "Payment completed successfully", captureData);
        // } else {
        //   sendResponse(res, 400, false, "Payment not completed", captureData);
        // }
    }
    catch (error) {
        logger_1.default.error("Error capturing PayPal payment:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.capturePayPalPayment = capturePayPalPayment;
/**
 * Get all orders (admin only)
 */
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        // Check if user is admin
        const user = yield user_model_1.default.findById(req.user.id);
        if (!user || user.role !== "admin") {
            return (0, responseHelper_1.default)(res, 403, false, "Access denied. Admin only.");
        }
        const orders = yield order_model_1.default.find().populate("service_id");
        (0, responseHelper_1.default)(res, 200, true, "All orders retrieved successfully", orders);
    }
    catch (error) {
        logger_1.default.error("Error fetching all orders:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.getAllOrders = getAllOrders;
/**
 * Get orders for a specific artist
 */
const getArtistOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const artistId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // This is the artist's user ID
    if (!artistId) {
        return (0, responseHelper_1.default)(res, 401, false, "Unauthorized, user not found");
    }
    console.log("artisttttttttttttttttttttt id:", artistId);
    try {
        const orders = yield order_model_1.default.find({ artist_id: artistId })
            .populate("user_id", "name email username profilePicture phoneNumber")
            .exec();
        res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            orders
        });
    }
    catch (error) {
        console.error("Error retrieving artist orders:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error
        });
    }
});
exports.getArtistOrders = getArtistOrders;
/**
 * Update order details
 */
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { orderId } = req.params; // Get the order ID from the request parameters
        const { pricingType, deliveryDate, location } = req.body; // Get the new details from the request body
        // Find the order by ID
        const order = yield order_model_1.default.findById(orderId);
        if (!order) {
            return (0, responseHelper_1.default)(res, 404, false, "Order not found");
        }
        // Validate pricingType if it's being updated
        if (pricingType) {
            const service = yield service_model_1.default.findById(order.service_id);
            if (!service) {
                return (0, responseHelper_1.default)(res, 404, false, "Service not found");
            }
            const validPricingTypes = ["starter", "standard", "advance"];
            if (!validPricingTypes.includes(pricingType)) {
                return (0, responseHelper_1.default)(res, 400, false, "Invalid pricing type. Must be 'starter', 'standard', or 'advance'");
            }
            // Check if pricing exists for the selected type
            if (!service.pricing || !service.pricing[pricingType]) {
                return (0, responseHelper_1.default)(res, 400, false, `${pricingType} pricing plan not found for this service`);
            }
            const pricing = service.pricing[pricingType];
            order.amount = pricing.price; // Update the order amount based on the new pricing
        }
        // Update the order details
        order.delivery_date = deliveryDate ? new Date(deliveryDate) : order.delivery_date;
        order.location = location ? location : order.location;
        yield order.save(); // Save the updated order
        (0, responseHelper_1.default)(res, 200, true, "Order updated successfully", order);
    }
    catch (error) {
        logger_1.default.error("Error updating order:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.updateOrder = updateOrder;
