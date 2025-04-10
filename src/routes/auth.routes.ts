import express from "express";
import {
    login,
    logout,
    requestPasswordResetOtp,
    resendPasswordResetOtp,
    resetPassword,
    verifyPasswordResetOtp,
    toggleTwoFactorAuth,
    verifyTwoFactorLogin
} from "../controllers/auth.controller";
import { userSignup } from "../controllers/auth.controller";
import { googleCallback, loginWithGoogle } from "../controllers/googleAuth.controller";

const router = express.Router();

router.post("/signUp", userSignup);

router.post("/login", login);
router.post("/logout", logout);

router.post("/requestPasswordResetOtp", requestPasswordResetOtp);
router.post("/resendPasswordResetOtp", resendPasswordResetOtp);

router.post("/verifyPasswordResetOtp", verifyPasswordResetOtp);
router.post("/resetPassword", resetPassword);

router.get("/google", loginWithGoogle);
router.get("/google/callback", googleCallback);

router.post('/toggle-2fa', toggleTwoFactorAuth);
router.post('/verify-2fa', verifyTwoFactorLogin);

export default router;
