import { Request, Response } from "express";
import Order, { IOrder } from "../models/order.model";
import Service from "../models/service.model";
import User from "../models/user.model";
import sendResponse from "../utils/responseHelper";
import logger from "../config/logger";
import stripe from "../config/stripe";
import {
  createStripePaymentIntent,
  createPayPalOrder,
  capturePayPalPayment as capturePayPalOrder
} from "../utils/paymentUtils";
import mongoose from "mongoose";

type PricingType = "starter" | "standard" | "advance";

/**
 * Create a new order
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { serviceId, pricingType, deliveryDate, location } = req.body;

    const userId = req.user.id; // This is the user making the order

    const service = await Service.findById(serviceId);
    if (!service) {
      return sendResponse(res, 404, false, "Service not found");
    } // Check if pricing exists for the selected type

    const artistId = service.artist_id;

    const validPricingTypes: PricingType[] = ["starter", "standard", "advance"];
    if (!validPricingTypes.includes(pricingType as PricingType)) {
      return sendResponse(res, 400, false, "Invalid pricing type. Must be 'starter', 'standard', or 'advance'");
    }

    if (!service.pricing || !service.pricing[pricingType as PricingType]) {
      return sendResponse(res, 400, false, `${pricingType} pricing plan not found for this service`);
    }

    const pricing = service.pricing[pricingType as PricingType];
    const orderTitle = `${service.title} - ${pricing.name}`;

    // Create the order with user ID and booking date time
    const newOrder = new Order({
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

    await newOrder.save();

    await Service.findByIdAndUpdate(serviceId, { $push: { orders: newOrder._id } });

    sendResponse(res, 201, true, "Order created successfully", newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

/**
 * Get order details
 */
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { orderId } = req.params;

    // Populate both service and artist details
    const order = await Order.findById(orderId)
      .populate("service_id")
      .populate("artist_id", "name profilePicture email location");

    if (!order) {
      return sendResponse(res, 404, false, "Order not found");
    }

    sendResponse(res, 200, true, "Order details retrieved successfully", order);
  } catch (error) {
    logger.error("Error fetching order details:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

/**
 * Get all orders for the current user
 */
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    console.log("Authenticated User ID:", req.user.id); // Log the user ID

    const orders = await Order.find({ user_id: req.user.id }).populate("service_id");

    if (orders.length === 0) {
      return sendResponse(res, 200, true, "No orders found for this user", []);
    }

    // Fetch user details
    const user = await User.findById(req.user.id);

    const ordersWithUserDetails = orders.map((order) => ({
      ...order.toObject(),
      user: user
    }));

    sendResponse(res, 200, true, "User orders retrieved successfully", ordersWithUserDetails);
  } catch (error) {
    logger.error("Error fetching user orders:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { orderId } = req.params;
    console.log("Order ID:", orderId);
    console.log("Valid ObjectId:", mongoose.Types.ObjectId.isValid(orderId));

    // const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return sendResponse(res, 400, false, "Invalid Order ID");
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      new mongoose.Types.ObjectId(orderId),
      { status: "completed" },
      { new: true }
    );

    if (!updatedOrder) {
      return sendResponse(res, 404, false, "Order not found");
    }

    sendResponse(res, 200, true, "Order status updated successfully", updatedOrder);
  } catch (error) {
    logger.error("Error updating order status:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

/**
 * Create Stripe payment intent for an order
 */
export const createStripeCheckout = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { orderId } = req.params;

    // Get order details
    const order = (await Order.findById(orderId)) as IOrder | null;
    if (!order) {
      return sendResponse(res, 404, false, "Order not found");
    }

    // Check if order is already paid
    if (order.is_paid) {
      return sendResponse(res, 400, false, "Order is already paid");
    }

    // Create a payment intent with Stripe
    const paymentIntent = await createStripePaymentIntent(order.amount, "usd", {
      orderId: order._id?.toString() || orderId
    });

    sendResponse(res, 200, true, "Stripe payment intent created", {
      clientSecret: paymentIntent.client_secret,
      amount: order.amount
    });
  } catch (error) {
    logger.error("Error creating Stripe checkout:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const stripeWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event;

    try {
      // Use the raw body for signature verification
      const rawBody = (req as any).rawBody || req.body;

      event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    } catch (err) {
      logger.error(`Webhook signature verification failed: ${err}`);
      return sendResponse(res, 400, false, `Webhook signature verification failed`);
    }

    // Handle the event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as {
        id: string;
        metadata?: {
          orderId?: string;
        };
      };

      // Update the order
      if (paymentIntent.metadata && paymentIntent.metadata.orderId) {
        const orderId = paymentIntent.metadata.orderId;

        await Order.findByIdAndUpdate(orderId, { is_paid: true }, { new: true });

        logger.info(`Payment succeeded for order ${orderId}`);
      }
    }

    sendResponse(res, 200, true, "Webhook received");
  } catch (error) {
    logger.error("Error processing Stripe webhook:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

/**
 * Create PayPal order for checkout
 */
export const createPayPalCheckout = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { orderId } = req.params;

    // Get order details
    const order = (await Order.findById(orderId).populate("service_id")) as IOrder | null;
    if (!order) {
      return sendResponse(res, 404, false, "Order not found");
    }

    // Check if order is already paid
    if (order.is_paid) {
      return sendResponse(res, 400, false, "Order is already paid");
    }

    // Create a PayPal order
    const paypalOrder = await createPayPalOrder(order.amount, "USD", `Payment for order ${order.order_number}`);

    // Save PayPal order ID to local database or session if needed

    sendResponse(res, 200, true, "PayPal order created", {
      // orderId: paypalOrder.id,
      amount: order.amount
    });
  } catch (error) {
    logger.error("Error creating PayPal checkout:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

/**
 * Capture PayPal payment
 */
export const capturePayPalPayment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { orderId } = req.params;
    const { paypalOrderId } = req.body;

    // Get order details
    const order = (await Order.findById(orderId)) as IOrder | null;
    if (!order) {
      return sendResponse(res, 404, false, "Order not found");
    }

    // Check if order is already paid
    if (order.is_paid) {
      return sendResponse(res, 400, false, "Order is already paid");
    }

    // Capture the PayPal payment
    const captureData = await capturePayPalOrder(paypalOrderId);

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
  } catch (error) {
    logger.error("Error capturing PayPal payment:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return sendResponse(res, 403, false, "Access denied. Admin only.");
    }

    const orders = await Order.find().populate("service_id");
    sendResponse(res, 200, true, "All orders retrieved successfully", orders);
  } catch (error) {
    logger.error("Error fetching all orders:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

/**
 * Get orders for a specific artist
 */
export const getArtistOrders = async (req: Request, res: Response): Promise<void> => {
  const artistId = req.user?.id; // This is the artist's user ID

  if (!artistId) {
    return sendResponse(res, 401, false, "Unauthorized, user not found");
  }
  console.log("artisttttttttttttttttttttt id:", artistId);
  try {
    const orders = await Order.find({ artist_id: artistId })
      .populate("user_id", "name email username profilePicture phoneNumber")
      .exec();
    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      orders
    });
  } catch (error) {
    console.error("Error retrieving artist orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error
    });
  }
};

/**
 * Update order details
 */
export const updateOrder = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { orderId } = req.params; // Get the order ID from the request parameters
    const { pricingType, deliveryDate, location } = req.body; // Get the new details from the request body

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return sendResponse(res, 404, false, "Order not found");
    }

    // Validate pricingType if it's being updated
    if (pricingType) {
      const service = await Service.findById(order.service_id);
      if (!service) {
        return sendResponse(res, 404, false, "Service not found");
      }

      const validPricingTypes: PricingType[] = ["starter", "standard", "advance"];
      if (!validPricingTypes.includes(pricingType as PricingType)) {
        return sendResponse(res, 400, false, "Invalid pricing type. Must be 'starter', 'standard', or 'advance'");
      }

      // Check if pricing exists for the selected type
      if (!service.pricing || !service.pricing[pricingType as PricingType]) {
        return sendResponse(res, 400, false, `${pricingType} pricing plan not found for this service`);
      }

      const pricing = service.pricing[pricingType as PricingType];
      order.amount = pricing.price; // Update the order amount based on the new pricing
    }

    // Update the order details
    order.delivery_date = deliveryDate ? new Date(deliveryDate) : order.delivery_date;
    order.location = location ? location : order.location;

    await order.save(); // Save the updated order

    sendResponse(res, 200, true, "Order updated successfully", order);
  } catch (error) {
    logger.error("Error updating order:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};
