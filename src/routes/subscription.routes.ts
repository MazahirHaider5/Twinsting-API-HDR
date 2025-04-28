import express from "express";
import { createSubscription, deleteSubscription, getSubscriptions, updateSubscription } from "../controllers/subscription.controller";

const router = express.Router();

router.post("/createSubscription", createSubscription);
router.get("/getSubscriptions", getSubscriptions); 
router.patch("/updateSubscription/:id", updateSubscription); 

router.delete("/deleteSubscription/:id", deleteSubscription); 

export default router;
