import express from "express";
import createMulterUploader from "../middlewares/multer";
import { addSkills, availability, basicInfo, selectInterest } from "../controllers/user.controller";
import requireAuth from "../middlewares/requireAuth";

const router = express.Router();

// Allow image uploads (JPG, PNG), 2MB limit
const upload = createMulterUploader(["image/jpeg", "image/png"], "profile_pictures", 2 * 1024 * 1024);

router.patch("/basic-info", upload.single("profilePicture"),requireAuth, basicInfo);
router.patch("/select-interest", requireAuth, selectInterest);
router.patch("/add-skills", requireAuth, addSkills);  
router.patch("/add-availability", requireAuth, availability);
export default router;
