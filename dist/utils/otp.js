"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpExpiry = exports.generateOtp = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateOtp = () => {
    const otp = crypto_1.default.randomInt(100000, 999999).toString();
    return otp.toString();
};
exports.generateOtp = generateOtp;
const otpExpiry = () => {
    const now = new Date();
    return new Date(now.setMinutes(now.getMinutes() + 5));
};
exports.otpExpiry = otpExpiry;
