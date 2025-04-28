import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import sendResponse from "../utils/responseHelper";
import logger from "../config/logger";

interface JwtPayload {
  id: string;
  email: string;
  role: "user" | "artist" | "personalAssistant" | "admin";
}

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
    artist? :JwtPayload
  }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return sendResponse(res, 401, false, "Unauthorized");
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error("Auth Middleware Error:", error);
    sendResponse(res, 401, false, "Invalid or expired token");
  }
};

export default requireAuth;
