import express from "express";
import authRoutes from "./auth.routes"; 
import userRoutes from "./user.routes";  
import complaintRoutes from "./complaint.routes";


const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/complaint", complaintRoutes);


export default router;
