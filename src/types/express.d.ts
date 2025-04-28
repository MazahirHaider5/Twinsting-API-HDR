import { Request } from "express";
import { IUser } from "../models/user.model";
import { Document } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user: Document<unknown, {}, IUser> & IUser;
    }
  }
}
