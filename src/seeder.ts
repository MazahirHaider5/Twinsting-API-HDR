import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user.model";
import logger from "./config/logger";
import connectDB from "./config/db";

dotenv.config();

const users = [
  {
    name: "Test User",
    email: "user@mail.com",
    password: "123",
    role: "user"
  },
  {
    name: "Admin User",
    email: "admin@mail.com",
    password: "123",
    role: "admin"
  }
];

const seedUsers = async () => {
  try {
    await connectDB();
    for (const userData of users) {
      try {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`⚠️ Skipping: User ${userData.email} already exists.`);
          continue;
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        await user.save();
        console.log(`✅ User ${userData.email} created successfully.`);
      } catch (err) {
        console.error(`❌ Error processing ${userData.email}:`, err);
        logger.error(`❌ Error processing ${userData.email}:`, err);
      }
    }
  } catch (error) {
    logger.error("❌ Error connecting to the database:", error);
    console.error("❌ Error connecting to the database:", error);
  } finally {
    mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
  }
};

seedUsers();
