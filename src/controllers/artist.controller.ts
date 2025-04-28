import { Request, Response } from "express";
import User from "../models/user.model";
import Artist from "../models/artist.model";
import logger from "../config/logger";
import sendResponse from "../utils/responseHelper";
import { uploadToCloudinary } from "../utils/cloudinary";
import Order from "../models/order.model";


export const becomeArtist = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Unauthorized, user not found"
        });
        return;
    }
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            {role: "artist"},
            {new: true}
        );
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        // Check if the artist exists, if not create a new artist record
        let artist = await Artist.findOne({ user: userId });
        if (!artist) {
            artist = new Artist({ user: userId }); // Create a new artist record
            await artist.save(); // Save the new artist record
        }
        
        res.status(200).json({
            success: true,
            message: "User role updated to artist",
            artist, // Return the whole artist object
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error occurred", error
        });
    };
}

export const artistBasicInformation = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        return sendResponse(res, 401, false, "Unauthorized, user not found");
    }

    const { fullname, username, artistLocation, aboutArtist } = req.body;
    const updatedFields: Partial<Record<string, any>> = {};

    if (!fullname || !username || !artistLocation || !aboutArtist) {
        return sendResponse(res, 400, false, "All fields are required.");
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
            return sendResponse(res, 400, false, "Invalid file format. Only JPEG and PNG are allowed.");
        }

        try {
            console.log("Attempting to upload profile image to Cloudinary...");
            const cloudinaryResult = await uploadToCloudinary(req.file.path, "profile_images");
            console.log("Cloudinary upload result:", cloudinaryResult); // Log the Cloudinary result
            updatedFields.profileImage = cloudinaryResult.secure_url; // Update the profile image URL
        } catch (uploadError) {
            logger.error("Cloudinary upload error:", uploadError);
            return sendResponse(res, 500, false, "Failed to upload image");
        }
    }

    try {
        const artist = await Artist.findOneAndUpdate({ user: userId }, updatedFields, { new: true, upsert: true });

        if (!artist) {
            return sendResponse(res, 404, false, "Artist not found");
        }

        return sendResponse(res, 200, true, "Artist details saved successfully", artist);
    } catch (error) {
        logger.error("Error saving artist details:", error);
        return sendResponse(res, 500, false, "Server error");
    }
};

export const artistSkills = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Unauthorized, user not found",
        });
        return;
    }
    const {skills} = req.body;
    
    if (!skills || !Array.isArray(skills)) {
        res.status(400).json({
            success: false,
            message: "Skills must be provided as array."
        });
        return;
    }
    try {
        const artist = await Artist.findOneAndUpdate(
            {user: userId},
            {$set: {skills}},
            {new: true}
        );
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
    } catch (error) {
        console.error("Error updating artist skills: ", error);
        res.status(500).json({
            success: false,
            message: "Server error: ", error
        });
    }
};

export const artistAvailability = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

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
        const artist = await Artist.findOneAndUpdate(
            { user: userId },
            { $set: { artistAvailability: availability } },
            { new: true }
        );

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
    } catch (error) {
        console.error("Error updating artist availability:", error);
        res.status(500).json({
            success: false,
            message: "Server error", error
        });
    }
};

export const getAllArtists = async (req: Request, res: Response): Promise<void> => {
    try {
        const artists = await Artist.find({ role: "artist" }).populate('user', 'fullname username profileImage'); // Adjust fields as necessary
        res.status(200).json({
            success: true,
            message: "Artists retrieved successfully",
            artists,
        });
    } catch (error) {
        console.error("Error retrieving artists:", error);
        res.status(500).json({
            success: false,
            message: "Server error", error
        });
    }
};

export const getArtistOrders = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id; // This is the user's ID

    if (!userId) {
        return sendResponse(res, 401, false, "Unauthorized, user not found");
    }

    try {
        const artist = await Artist.findOne({ user: userId });
        if (!artist) {
            return sendResponse(res, 404, false, "Artist not found");
        }

        console.log("Artist ID for order retrieval:", artist._id); // Log artist ID

        // Fetch orders for the artist based on artist_id
        const orders = await Order.find({ artist_id: userId }); 
        console.log("Orders found:", orders); // Log orders found

        if (orders.length === 0) {
            return sendResponse(res, 200, true, "No orders found for this artist", []);
        }

        res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            orders,
        });
    } catch (error) {
        console.error("Error retrieving artist orders:", error);
        res.status(500).json({
            success: false,
            message: "Server error", error
        });
    }
};

export const getLoggedInArtistDetails = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        return sendResponse(res, 401, false, "Unauthorized, user not found");
    }

    try {
        // Fetch the artist object with all fields
        const artist = await Artist.findOne({ user: userId }).populate('user', 'fullname username profileImage'); // Adjust fields as necessary

        if (!artist) {
            return sendResponse(res, 404, false, "Artist not found");
        }

        return sendResponse(res, 200, true, "Artist details retrieved successfully", artist);
    } catch (error) {
        console.error("Error retrieving artist details:", error);
        return sendResponse(res, 500, false, "Server error");
    }
};



