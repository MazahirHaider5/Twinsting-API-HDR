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
exports.getLoggedInArtistDetails = exports.getArtistOrders = exports.getAllArtists = exports.artistAvailability = exports.artistSkills = exports.artistBasicInformation = exports.becomeArtist = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const artist_model_1 = __importDefault(require("../models/artist.model"));
const logger_1 = __importDefault(require("../config/logger"));
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const cloudinary_1 = require("../utils/cloudinary");
const order_model_1 = __importDefault(require("../models/order.model"));
const becomeArtist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Unauthorized, user not found"
        });
        return;
    }
    try {
        const user = yield user_model_1.default.findByIdAndUpdate(userId, { role: "artist" }, { new: true });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        // Check if the artist exists, if not create a new artist record
        let artist = yield artist_model_1.default.findOne({ user: userId });
        if (!artist) {
            artist = new artist_model_1.default({ user: userId }); // Create a new artist record
            yield artist.save(); // Save the new artist record
        }
        res.status(200).json({
            success: true,
            message: "User role updated to artist",
            artist, // Return the whole artist object
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error occurred", error
        });
    }
    ;
});
exports.becomeArtist = becomeArtist;
const artistBasicInformation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return (0, responseHelper_1.default)(res, 401, false, "Unauthorized, user not found");
    }
    const { fullname, username, artistLocation, aboutArtist } = req.body;
    const updatedFields = {};
    if (!fullname || !username || !artistLocation || !aboutArtist) {
        return (0, responseHelper_1.default)(res, 400, false, "All fields are required.");
    }
    updatedFields.fullname = fullname;
    updatedFields.username = username;
    updatedFields.artistLocation = artistLocation;
    updatedFields.aboutArtist = aboutArtist;
    // Check if a profile image was uploaded
    if (req.file) {
        console.log("Uploaded profile image:", req.file); // Log the uploaded file data
        const allowedFormats = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedFormats.includes(req.file.mimetype)) {
            return (0, responseHelper_1.default)(res, 400, false, "Invalid file format. Only JPEG and PNG are allowed.");
        }
        try {
            console.log("Attempting to upload profile image to Cloudinary...");
            const cloudinaryResult = yield (0, cloudinary_1.uploadToCloudinary)(req.file.path, "profile_images");
            console.log("Cloudinary upload result:", cloudinaryResult); // Log the Cloudinary result
            updatedFields.profileImage = cloudinaryResult.secure_url; // Update the profile image URL
        }
        catch (uploadError) {
            logger_1.default.error("Cloudinary upload error:", uploadError);
            return (0, responseHelper_1.default)(res, 500, false, "Failed to upload image");
        }
    }
    try {
        const artist = yield artist_model_1.default.findOneAndUpdate({ user: userId }, updatedFields, { new: true, upsert: true });
        if (!artist) {
            return (0, responseHelper_1.default)(res, 404, false, "Artist not found");
        }
        return (0, responseHelper_1.default)(res, 200, true, "Artist details saved successfully", artist);
    }
    catch (error) {
        logger_1.default.error("Error saving artist details:", error);
        return (0, responseHelper_1.default)(res, 500, false, "Server error");
    }
});
exports.artistBasicInformation = artistBasicInformation;
const artistSkills = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Unauthorized, user not found",
        });
        return;
    }
    const { skills } = req.body;
    if (!skills || !Array.isArray(skills)) {
        res.status(400).json({
            success: false,
            message: "Skills must be provided as array."
        });
        return;
    }
    try {
        const artist = yield artist_model_1.default.findOneAndUpdate({ user: userId }, { $set: { skills } }, { new: true });
        if (!artist) {
            res.status(404).json({
                success: false,
                message: "Artist not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Artist skills updated",
            artist,
        });
    }
    catch (error) {
        console.error("Error updating artist skills: ", error);
        res.status(500).json({
            success: false,
            message: "Server error: ", error
        });
    }
});
exports.artistSkills = artistSkills;
const artistAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Unauthorized, user not found",
        });
        return;
    }
    const { availability } = req.body;
    // Validate the availability object
    if (!availability || typeof availability !== 'object') {
        res.status(400).json({
            success: false,
            message: "Availability must be provided as an object.",
        });
        return;
    }
    try {
        const artist = yield artist_model_1.default.findOneAndUpdate({ user: userId }, { $set: { artistAvailability: availability } }, { new: true });
        if (!artist) {
            res.status(404).json({
                success: false,
                message: "Artist not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Artist availability updated",
            artist,
        });
    }
    catch (error) {
        console.error("Error updating artist availability:", error);
        res.status(500).json({
            success: false,
            message: "Server error", error
        });
    }
});
exports.artistAvailability = artistAvailability;
const getAllArtists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const artists = yield artist_model_1.default.find({ role: "artist" }).populate('user', 'fullname username profileImage'); // Adjust fields as necessary
        res.status(200).json({
            success: true,
            message: "Artists retrieved successfully",
            artists,
        });
    }
    catch (error) {
        console.error("Error retrieving artists:", error);
        res.status(500).json({
            success: false,
            message: "Server error", error
        });
    }
});
exports.getAllArtists = getAllArtists;
const getArtistOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // This is the user's ID
    if (!userId) {
        return (0, responseHelper_1.default)(res, 401, false, "Unauthorized, user not found");
    }
    try {
        const artist = yield artist_model_1.default.findOne({ user: userId });
        if (!artist) {
            return (0, responseHelper_1.default)(res, 404, false, "Artist not found");
        }
        console.log("Artist ID for order retrieval:", artist._id); // Log artist ID
        // Fetch orders for the artist based on artist_id
        const orders = yield order_model_1.default.find({ artist_id: userId });
        console.log("Orders found:", orders); // Log orders found
        if (orders.length === 0) {
            return (0, responseHelper_1.default)(res, 200, true, "No orders found for this artist", []);
        }
        res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            orders,
        });
    }
    catch (error) {
        console.error("Error retrieving artist orders:", error);
        res.status(500).json({
            success: false,
            message: "Server error", error
        });
    }
});
exports.getArtistOrders = getArtistOrders;
const getLoggedInArtistDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return (0, responseHelper_1.default)(res, 401, false, "Unauthorized, user not found");
    }
    try {
        // Fetch the artist object with all fields
        const artist = yield artist_model_1.default.findOne({ user: userId }).populate('user', 'fullname username profileImage'); // Adjust fields as necessary
        if (!artist) {
            return (0, responseHelper_1.default)(res, 404, false, "Artist not found");
        }
        return (0, responseHelper_1.default)(res, 200, true, "Artist details retrieved successfully", artist);
    }
    catch (error) {
        console.error("Error retrieving artist details:", error);
        return (0, responseHelper_1.default)(res, 500, false, "Server error");
    }
});
exports.getLoggedInArtistDetails = getLoggedInArtistDetails;
