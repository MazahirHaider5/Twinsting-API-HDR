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
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = __importDefault(require("./models/user.model"));
const logger_1 = __importDefault(require("./config/logger"));
const db_1 = __importDefault(require("./config/db"));
dotenv_1.default.config();
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
const seedUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.default)();
        for (const userData of users) {
            try {
                const existingUser = yield user_model_1.default.findOne({ email: userData.email });
                if (existingUser) {
                    console.log(`⚠️ Skipping: User ${userData.email} already exists.`);
                    continue;
                }
                const hashedPassword = yield bcryptjs_1.default.hash(userData.password, 10);
                const user = new user_model_1.default(Object.assign(Object.assign({}, userData), { password: hashedPassword }));
                yield user.save();
                console.log(`✅ User ${userData.email} created successfully.`);
            }
            catch (err) {
                console.error(`❌ Error processing ${userData.email}:`, err);
                logger_1.default.error(`❌ Error processing ${userData.email}:`, err);
            }
        }
    }
    catch (error) {
        logger_1.default.error("❌ Error connecting to the database:", error);
        console.error("❌ Error connecting to the database:", error);
    }
    finally {
        mongoose_1.default.connection.close();
        console.log("🔌 MongoDB connection closed.");
    }
});
seedUsers();
