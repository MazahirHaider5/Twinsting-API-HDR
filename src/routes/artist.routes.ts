import express from "express";
import createMulterUploader from "../middlewares/multer";
import { artistAvailability, artistBasicInformation, artistSkills, becomeArtist, getAllArtists, getArtistById, getArtistOrders, getLoggedInArtistDetails } from "../controllers/artist.controller";
import requireAuth from "../middlewares/requireAuth";

const router = express.Router();

const upload = createMulterUploader(["image/jpeg", "image/png"], "profile_pictures", 2 * 1024 * 1024);

router.post("/becomeArtist", requireAuth, becomeArtist);
router.post("/artistBasicInfo",upload.single("profileImage"), requireAuth, artistBasicInformation);
router.post("/artistSkills", requireAuth, artistSkills);
router.post("/artistAvailability", requireAuth, artistAvailability);

router.get("/getAllArtists", getAllArtists);
router.get("/getArtistById/:artistId", getArtistById);

router.get("/getArtistOrders", requireAuth, getArtistOrders);

router.get("/getLoggedInArtistDetails", requireAuth, getLoggedInArtistDetails);

export default router;