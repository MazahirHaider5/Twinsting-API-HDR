import User from "../models/user.model";
import { Request, Response } from "express";
import logger from "../config/logger";
import { generateToken } from "../utils/jwt";
import { comparePassword } from "../utils/bcrypt";
import sendResponse from "../utils/responseHelper";
import { generateOtp, otpExpiry } from "../utils/otp";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      sendResponse(res, 400, false, "Email and password are required");
      return;
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendResponse(res, 400, false, "User already exists with this email");
      return;
    }
    const newUser = new User({ name, email, password });
    await newUser.save();
    
    // Generate token for the new user
    const token = generateToken(newUser);
    
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
    sendResponse(res, 201, true, "User registered successfully", { user: filteredUser });
  } catch (error) {
    logger.error("Error creating user:", error);
    sendResponse(res, 500, false, "Error creating user");
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      sendResponse(res, 400, false, "Email and password are required");
      return;
    }
    const user = await User.findOne({ email });
    if (!user) {
      sendResponse(res, 404, false, "User not found");
      return;
    }
    if (user.isBlocked) {
      sendResponse(res, 403, false, "Your account has been blocked. Contact support.");
      return;
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      sendResponse(res, 403, false, "Invalid credentials");
      return;
    }
    const token = generateToken(user);
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
    sendResponse(res, 200, true, "Sign-in successful", { user: filteredUser });
  } catch (error) {
    logger.error("Error signing in:", error);
    sendResponse(res, 500, false, "Error signing in");
  }
};

export const socialLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, profilePicture, provider } = req.body;
    console.log("These are credentials from frontend", email, name, profilePicture, provider);
    
    if (!email || !provider) {
      sendResponse(res, 400, false, "Missing required fields");
      return;
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, profilePicture, provider, isVerified: true });
      await user.save();
    }
    const token = generateToken(user);
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
    sendResponse(res, 200, true, "User logged in", { user: userData });
  } catch (error) {
    logger.error("Error during social login:", error);
    sendResponse(res, 500, false, "Error during social login");
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      sendResponse(res, 400, false, "Email is required");
      return;
    }
    const user = await User.findOne({ email });
    if (!user) {
      sendResponse(res, 200, true, "Password reset OTP has been sent");
      return;
    }
    const otp = generateOtp();
    const Expiry = otpExpiry();
    user.otp = otp;
    user.otpExpiry = Expiry;
    await user.save();
    sendResponse(res, 200, true, "A password reset OTP has been sent");
  } catch (error) {
    logger.error("Error requesting password reset:", error);
    sendResponse(res, 500, false, "Error processing password reset request");
  }
};
