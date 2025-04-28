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
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// User Schema Definition
const UserSchema = new mongoose_1.default.Schema({
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    username: { type: String },
    profilePicture: {
        type: String,
        default: "https://static-00.iconduck.com/assets.00/profile-default-icon-2048x2045-u3j7s5nj.png"
    },
    role: {
        type: String,
        enum: ["user", "artist", "personalAssistant", "admin"],
        default: "user"
    },
    phoneNumber: { type: String },
    provider: {
        type: String,
        enum: ["google", "email", "apple", "facebook"],
        default: "email"
    },
    companyName: { type: String },
    location: { type: String },
    profile_description: { type: String },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isTwoFactorEnabled: { type: Boolean, default: false },
    documents: {
        nic: {
            name: { type: String },
            image: { type: String },
            verified: { type: Boolean, default: false }
        },
        passport: {
            name: { type: String },
            image: { type: String },
            verified: { type: Boolean, default: false }
        },
        other: { type: String }
    },
    stripeCustomerId: { type: String },
    subscriptionType: {
        type: String,
        enum: ["free", "basic", "pro", "enterprise"],
        default: "free"
    },
    skills: { type: [String] },
    interest: { type: [String] },
    availability: {
        monday: { from: { type: String }, to: { type: String } },
        tuesday: { from: { type: String }, to: { type: String } },
        wednesday: { from: { type: String }, to: { type: String } },
        thursday: { from: { type: String }, to: { type: String } },
        friday: { from: { type: String }, to: { type: String } },
        saturday: { from: { type: String }, to: { type: String } },
        sunday: { from: { type: String }, to: { type: String } }
    }
}, { timestamps: true });
UserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        this.password = yield bcryptjs_1.default.hash(this.password, 10);
        next();
    });
});
const User = mongoose_1.default.model("User", UserSchema);
exports.default = User;
