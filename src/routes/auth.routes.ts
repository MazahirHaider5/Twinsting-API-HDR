import express from "express";
import { signup, signin, socialLogin, forgotPassword } from "../controllers/auth.controller";

const router = express.Router();

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/social-login", socialLogin);
router.post("/forgot-password", forgotPassword);

export default router;
