"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const createMulterUploader = (allowedTypes, uploadFolder, maxFileSize = 1000 * 1024 * 1024) => {
    const ensureDirectoryExists = (folderPath) => {
        if (!fs_1.default.existsSync(folderPath)) {
            fs_1.default.mkdirSync(folderPath, { recursive: true }); // Ensure directory exists
        }
    };
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path_1.default.join("uploads", uploadFolder);
            ensureDirectoryExists(uploadPath);
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const fileExtension = path_1.default.extname(file.originalname);
            const filename = `${Date.now()}${fileExtension}`;
            cb(null, filename);
        },
    });
    const fileFilter = (req, file, cb) => {
        console.log("File received:", file); // Log the file received
        console.log("File size:", file.size); // Log the file size
        const isAllowed = allowedTypes.some((type) => file.mimetype.toLowerCase().includes(type.toLowerCase()));
        if (isAllowed) {
            cb(null, true);
        }
        else {
            cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(", ")}.`), false);
        }
    };
    return (0, multer_1.default)({
        storage,
        fileFilter,
        limits: { fileSize: maxFileSize },
    });
};
exports.default = createMulterUploader;
