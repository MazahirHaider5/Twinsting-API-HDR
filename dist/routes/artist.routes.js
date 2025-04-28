"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("../middlewares/multer"));
const artist_controller_1 = require("../controllers/artist.controller");
const requireAuth_1 = __importDefault(require("../middlewares/requireAuth"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)(["image/jpeg", "image/png"], "profile_pictures", 2 * 1024 * 1024);
router.post("/becomeArtist", requireAuth_1.default, artist_controller_1.becomeArtist);
router.post("/artistBasicInfo", upload.single("profileImage"), requireAuth_1.default, artist_controller_1.artistBasicInformation);
router.post("/artistSkills", requireAuth_1.default, artist_controller_1.artistSkills);
router.post("/artistAvailability", requireAuth_1.default, artist_controller_1.artistAvailability);
router.get("/getAllArtists", requireAuth_1.default, artist_controller_1.getAllArtists);
router.get("/getArtistOrders", requireAuth_1.default, artist_controller_1.getArtistOrders);
router.get("/getLoggedInArtistDetails", requireAuth_1.default, artist_controller_1.getLoggedInArtistDetails);
exports.default = router;
