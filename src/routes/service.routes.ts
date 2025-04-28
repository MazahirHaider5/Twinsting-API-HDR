import express from "express";
import createMulterUploader from "../middlewares/multer";
import {
  createService,
  ServicePricing,
  serviceMedia,
  addReview,
  breifDiscription,
  getAllServices,
  getArtistServices,
  getServiceById,
  deleteServiceById,
  updateServiceBasicInfo,
  updateServicePricing,
  updateServiceMedia
} from "../controllers/services.controller";
import requireAuth from "../middlewares/requireAuth";

const router = express.Router();

const upload = createMulterUploader(["image/jpeg", "image/png", "video/mp4"], "service_media", 5 * 1024 * 1024);

router.post("/createService", requireAuth, createService);

router.patch("/pricing/:serviceId", requireAuth, ServicePricing);
router.patch("/description/:serviceId", requireAuth, breifDiscription);

router.patch("/media/:serviceId", requireAuth, upload.array("media", 7), serviceMedia);
router.patch("/addReview/:serviceId", requireAuth, addReview);

router.get("/getAllServices", requireAuth, getAllServices);
router.get("/getArtistServices", requireAuth, getArtistServices);

router.get("/getServiceById/:serviceId", requireAuth, getServiceById);

router.patch("/updateServiceBasicInfo/:serviceId", requireAuth, updateServiceBasicInfo);
router.patch("/updateServicePrice/:serviceId", requireAuth, updateServicePricing);
router.patch("/updateServiceDescription/:serviceId", requireAuth, updateServicePricing);

router.patch("/updateServiceMedia/:serviceId", requireAuth, upload.array("media", 7), updateServiceMedia);

router.delete("/deleteServiceById/:serviceId", requireAuth, deleteServiceById);

express.Router();
export default router;
