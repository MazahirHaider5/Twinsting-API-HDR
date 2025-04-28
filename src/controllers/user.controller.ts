import { Request, Response } from "express";
import User from "../models/user.model";
import logger from "../config/logger";
import sendResponse from "../utils/responseHelper";
import { uploadToCloudinary } from "../utils/cloudinary";

export const basicInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, 401, false, "Unauthorized access");
      return;
    }

    const { name, username, location, profileDescription } = req.body;
    const updatedFields: Partial<Record<string, any>> = {};

    if (name) updatedFields.companyName = name;
    if (location) updatedFields.location = location;
    if (username) updatedFields.username = username;
    if (profileDescription) updatedFields.profile_description = profileDescription;

    // Check if a file was uploaded
    if (req.file) {
      console.log("Uploaded file:", req.file); // Log the uploaded file data
      const allowedFormats = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedFormats.includes(req.file.mimetype)) {
        sendResponse(res, 400, false, "Invalid file format. Only JPEG and PNG are allowed.");
        return;
      }
      
      try {
        console.log("Attempting to upload to Cloudinary...");
        const cloudinaryResult = await uploadToCloudinary(req.file.path, "profile_pictures");
        console.log("Cloudinary upload result:", cloudinaryResult); // Log the Cloudinary result
        updatedFields.profilePicture = cloudinaryResult.secure_url; // Update the profile picture URL
      } catch (uploadError) {
        logger.error("Cloudinary upload error:", uploadError);
        sendResponse(res, 500, false, "Failed to upload image");
        return;
      }
    }

    // Update user profile
    const userId = req.user.id;
    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, { new: true });

    if (!updatedUser) {
      sendResponse(res, 404, false, "User not found");
      return;
    }

    sendResponse(res, 200, true, "Profile updated successfully", updatedUser);
  } catch (error) {
    logger.error("Error updating profile:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};


export const selectInterest = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, 401, false, "Unauthorized access");
      return;
    }

    const { interest } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(userId, { interest }, { new: true });

    if (!updatedUser) {
      sendResponse(res, 404, false, "User not found");
      return;
    }

    sendResponse(res, 200, true, "Interest updated successfully", updatedUser);
  } catch (error) {
    logger.error("Error updating interests:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

export const addSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, 401, false, "Unauthorized access");
      return;
    }

    const { skills } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(userId, { skills }, { new: true });

    if (!updatedUser) {
      sendResponse(res, 404, false, "User not found");
      return;
    }

    sendResponse(res, 200, true, "Skills updated successfully", updatedUser);
  } catch (error) {
    logger.error("Error updating skills:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

export const availability = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, 401, false, "Unauthorized access");
      return;
    }

    const { availability } = req.body;
    const userId = req.user.id;

    // Ensure valid availability object
    const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const isValidAvailability = Object.keys(availability).every(
      (day) =>
        validDays.includes(day) &&
        typeof availability[day].from === "string" &&
        typeof availability[day].to === "string"
    );

    if (!isValidAvailability) {
      sendResponse(res, 400, false, "Invalid availability format");
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { availability }, { new: true });

    if (!updatedUser) {
      sendResponse(res, 404, false, "User not found");
      return;
    }

    sendResponse(res, 200, true, "Availability updated successfully", updatedUser);
  } catch (error) {
    logger.error("Error updating availability:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};
