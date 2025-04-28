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
exports.availability = exports.addSkills = exports.selectInterest = exports.basicInfo = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const logger_1 = __importDefault(require("../config/logger"));
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const cloudinary_1 = require("../utils/cloudinary");
const basicInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
            return;
        }
        const { name, username, location, profileDescription } = req.body;
        const updatedFields = {};
        if (name)
            updatedFields.companyName = name;
        if (location)
            updatedFields.location = location;
        if (username)
            updatedFields.username = username;
        if (profileDescription)
            updatedFields.profile_description = profileDescription;
        // Check if a file was uploaded
        if (req.file) {
            console.log("Uploaded file:", req.file); // Log the uploaded file data
            const allowedFormats = ["image/jpeg", "image/jpg", "image/png"];
            if (!allowedFormats.includes(req.file.mimetype)) {
                (0, responseHelper_1.default)(res, 400, false, "Invalid file format. Only JPEG and PNG are allowed.");
                return;
            }
            try {
                console.log("Attempting to upload to Cloudinary...");
                const cloudinaryResult = yield (0, cloudinary_1.uploadToCloudinary)(req.file.path, "profile_pictures");
                console.log("Cloudinary upload result:", cloudinaryResult); // Log the Cloudinary result
                updatedFields.profilePicture = cloudinaryResult.secure_url; // Update the profile picture URL
            }
            catch (uploadError) {
                logger_1.default.error("Cloudinary upload error:", uploadError);
                (0, responseHelper_1.default)(res, 500, false, "Failed to upload image");
                return;
            }
        }
        // Update user profile
        const userId = req.user.id;
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, updatedFields, { new: true });
        if (!updatedUser) {
            (0, responseHelper_1.default)(res, 404, false, "User not found");
            return;
        }
        (0, responseHelper_1.default)(res, 200, true, "Profile updated successfully", updatedUser);
    }
    catch (error) {
        logger_1.default.error("Error updating profile:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal server error");
    }
});
exports.basicInfo = basicInfo;
const selectInterest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
            return;
        }
        const { interest } = req.body;
        const userId = req.user.id;
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { interest }, { new: true });
        if (!updatedUser) {
            (0, responseHelper_1.default)(res, 404, false, "User not found");
            return;
        }
        (0, responseHelper_1.default)(res, 200, true, "Interest updated successfully", updatedUser);
    }
    catch (error) {
        logger_1.default.error("Error updating interests:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal server error");
    }
});
exports.selectInterest = selectInterest;
const addSkills = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
            return;
        }
        const { skills } = req.body;
        const userId = req.user.id;
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { skills }, { new: true });
        if (!updatedUser) {
            (0, responseHelper_1.default)(res, 404, false, "User not found");
            return;
        }
        (0, responseHelper_1.default)(res, 200, true, "Skills updated successfully", updatedUser);
    }
    catch (error) {
        logger_1.default.error("Error updating skills:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal server error");
    }
});
exports.addSkills = addSkills;
const availability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
            return;
        }
        const { availability } = req.body;
        const userId = req.user.id;
        // Ensure valid availability object
        const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        const isValidAvailability = Object.keys(availability).every((day) => validDays.includes(day) &&
            typeof availability[day].from === "string" &&
            typeof availability[day].to === "string");
        if (!isValidAvailability) {
            (0, responseHelper_1.default)(res, 400, false, "Invalid availability format");
            return;
        }
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { availability }, { new: true });
        if (!updatedUser) {
            (0, responseHelper_1.default)(res, 404, false, "User not found");
            return;
        }
        (0, responseHelper_1.default)(res, 200, true, "Availability updated successfully", updatedUser);
    }
    catch (error) {
        logger_1.default.error("Error updating availability:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal server error");
    }
});
exports.availability = availability;
