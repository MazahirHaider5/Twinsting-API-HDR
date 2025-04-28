import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Define Availability Interface
interface IAvailability {
  from?: string;
  to?: string;
}

// Define Documents Interface
interface IDocuments {
  nic?: {
    name?: string;
    image?: string;
    verified?: boolean;
  };
  passport?: {
    name?: string;
    image?: string;
    verified?: boolean;
  };
  other?: string;
}

// Main User Interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  password: string;
  username?: string;
  profilePicture?: string;
  role: "user" | "artist" | "personalAssistant" | "admin";
  phoneNumber?: string;
  provider: "google" | "email" | "apple" | "facebook";
  companyName?: string;
  location?: string;
  profile_description?: string;
  isVerified?: boolean;
  otp?: string;
  otpExpiry?: Date;
  isActive?: boolean;
  isBlocked?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isTwoFactorEnabled?: boolean;
  documents?: IDocuments;
  stripeCustomerId?: string;
  subscriptionType: "free" | "basic" | "pro" | "enterprise";
  skills?: string[];
  interest?: string[];
  availability?: {
    monday?: IAvailability;
    tuesday?: IAvailability;
    wednesday?: IAvailability;
    thursday?: IAvailability;
    friday?: IAvailability;
    saturday?: IAvailability;
    sunday?: IAvailability;
  };
}

// User Schema Definition
const UserSchema: Schema<IUser> = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
