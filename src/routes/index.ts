import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import serviceRoutes from "./service.routes";
import orderRoutes from "./order.routes";
import artistRoutes from "./artist.routes";
import subscriptionRoutes from "./subscription.routes";
import messageRoutes from "./message.route";
import conversationRoutes from "./conversation.routes";


const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/service", serviceRoutes);
router.use("/order", orderRoutes);
router.use("/artist", artistRoutes);
router.use("/subscription",subscriptionRoutes);
router.use("/message",messageRoutes);
router.use("/conversation",conversationRoutes);


export default router;
