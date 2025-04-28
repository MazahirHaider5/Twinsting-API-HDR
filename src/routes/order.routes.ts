import express from "express";
import requireAuth from "../middlewares/requireAuth";
import {
  createOrder,
  getOrderDetails,
  getUserOrders,
  updateOrderStatus,
  createStripeCheckout,
  stripeWebhook,
  createPayPalCheckout,
  capturePayPalPayment,
  getAllOrders,
  getArtistOrders,
  updateOrder
} from "../controllers/order.controller";

const router = express.Router();

router.post("/create", requireAuth, createOrder);
router.get("/details/:orderId", requireAuth, getOrderDetails);
router.get("/getUserOrders", requireAuth, getUserOrders);
router.patch("/status/:orderId", requireAuth, updateOrderStatus);
router.get("/all", requireAuth, getAllOrders);

router.get("/getArtistOrders", requireAuth, getArtistOrders);

router.post("/checkout/stripe/:orderId", requireAuth, createStripeCheckout);
router.post("/webhook/stripe", stripeWebhook);

router.post("/checkout/paypal/:orderId", requireAuth, createPayPalCheckout);
router.post("/capture/paypal/:orderId", requireAuth, capturePayPalPayment);

router.patch("/updateOrder/:orderId", requireAuth, updateOrder);

export default router;
