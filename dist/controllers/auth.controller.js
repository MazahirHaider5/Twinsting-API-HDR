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
exports.forgotPassword = exports.socialLogin = exports.signin = exports.signup = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const logger_1 = __importDefault(require("../config/logger"));
const jwt_1 = require("../utils/jwt");
const bcrypt_1 = require("../utils/bcrypt");
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const otp_1 = require("../utils/otp");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        if (!email || !password) {
            (0, responseHelper_1.default)(res, 400, false, "Email and password are required");
            return;
        }
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            (0, responseHelper_1.default)(res, 400, false, "User already exists with this email");
            return;
        }
        const newUser = new user_model_1.default({ name, email, password });
        yield newUser.save();
        // Generate token for the new user
        const token = (0, jwt_1.generateToken)(newUser);
        // Create a filtered user object
        const filteredUser = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            isVerified: newUser.isVerified,
            subscriptionType: newUser.subscriptionType,
            profilePicture: newUser.profilePicture,
            token
        };
        // Send response with user details and token
        (0, responseHelper_1.default)(res, 201, true, "User created successfully", { user: filteredUser });
    }
    catch (error) {
        logger_1.default.error("Error creating user:", error);
        (0, responseHelper_1.default)(res, 500, false, "Error creating user");
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            (0, responseHelper_1.default)(res, 400, false, "Email and password are required");
            return;
        }
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            (0, responseHelper_1.default)(res, 404, false, "User not found");
            return;
        }
        if (user.isBlocked) {
            (0, responseHelper_1.default)(res, 403, false, "Your account has been blocked. Contact support.");
            return;
        }
        const isPasswordValid = yield (0, bcrypt_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            (0, responseHelper_1.default)(res, 403, false, "Invalid credentials");
            return;
        }
        const token = (0, jwt_1.generateToken)(user);
        const filteredUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            subscriptionType: user.subscriptionType,
            profilePicture: user.profilePicture,
            token
        };
        (0, responseHelper_1.default)(res, 200, true, "Sign-in successful", { user: filteredUser });
    }
    catch (error) {
        logger_1.default.error("Error signing in:", error);
        (0, responseHelper_1.default)(res, 500, false, "Error signing in");
    }
});
exports.signin = signin;
const socialLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, profilePicture, provider } = req.body;
        if (!email || !provider) {
            (0, responseHelper_1.default)(res, 400, false, "Missing required fields");
            return;
        }
        let user = yield user_model_1.default.findOne({ email });
        if (!user) {
            user = new user_model_1.default({ name, email, profilePicture, provider, isVerified: true });
            yield user.save();
        }
        const token = (0, jwt_1.generateToken)(user);
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            subscriptionType: user.subscriptionType,
            profilePicture: user.profilePicture,
            token
        };
        (0, responseHelper_1.default)(res, 200, true, "User logged in", { user: userData });
    }
    catch (error) {
        logger_1.default.error("Error during social login:", error);
        (0, responseHelper_1.default)(res, 500, false, "Error during social login");
    }
});
exports.socialLogin = socialLogin;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            (0, responseHelper_1.default)(res, 400, false, "Email is required");
            return;
        }
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            (0, responseHelper_1.default)(res, 200, true, "Password reset OTP has been sent");
            return;
        }
        const otp = (0, otp_1.generateOtp)();
        const Expiry = (0, otp_1.otpExpiry)();
        user.otp = otp;
        user.otpExpiry = Expiry;
        yield user.save();
        (0, responseHelper_1.default)(res, 200, true, "A password reset OTP has been sent");
    }
    catch (error) {
        logger_1.default.error("Error requesting password reset:", error);
        (0, responseHelper_1.default)(res, 500, false, "Error processing password reset request");
    }
});
exports.forgotPassword = forgotPassword;
