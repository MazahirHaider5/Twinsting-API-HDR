"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("../middlewares/multer"));
const user_controller_1 = require("../controllers/user.controller");
const requireAuth_1 = __importDefault(require("../middlewares/requireAuth"));
const router = express_1.default.Router();
// Allow image uploads (JPG, PNG), 2MB limit
const upload = (0, multer_1.default)(["image/jpeg", "image/png"], "profile_pictures", 2 * 1024 * 1024);
router.patch("/basic-info", upload.single("profilePicture"), requireAuth_1.default, user_controller_1.basicInfo);
router.patch("/select-interest", requireAuth_1.default, user_controller_1.selectInterest);
router.patch("/add-skills", requireAuth_1.default, user_controller_1.addSkills);
router.patch("/add-availability", requireAuth_1.default, user_controller_1.availability);
exports.default = router;
