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
exports.updateServiceMedia = exports.updateServiceDescription = exports.updateServicePricing = exports.updateServiceBasicInfo = exports.deleteServiceById = exports.getServiceById = exports.getArtistServices = exports.getAllServices = exports.addReview = exports.breifDiscription = exports.serviceMedia = exports.ServicePricing = exports.createService = void 0;
const service_model_1 = __importDefault(require("../models/service.model"));
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const logger_1 = __importDefault(require("../config/logger"));
const cloudinary_1 = require("../utils/cloudinary");
const createService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { title, category, subcategory, description, searchTags } = req.body;
        const artist_id = req.user.id;
        const newService = new service_model_1.default({
            artist_id,
            title,
            category,
            subcategory,
            description,
            searchTags
        });
        yield newService.save();
        (0, responseHelper_1.default)(res, 201, true, "Service created successfully", newService);
    }
    catch (error) {
        logger_1.default.error("Error creating service:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.createService = createService;
const ServicePricing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { serviceId } = req.params;
        const { starter, standard, advance } = req.body;
        // Validate required fields in each pricing tier
        const requiredFields = ["name", "description", "price", "deliveryTime"];
        const pricingTiers = { starter, standard, advance };
        for (const [tier, data] of Object.entries(pricingTiers)) {
            for (const field of requiredFields) {
                if (!data || data[field] === undefined) {
                    return (0, responseHelper_1.default)(res, 400, false, `${tier} package is missing required field: ${field}`);
                }
            }
        }
        const updatedService = yield service_model_1.default.findByIdAndUpdate(serviceId, { pricing: { starter, standard, advance } }, { new: true, runValidators: true });
        if (!updatedService) {
            return (0, responseHelper_1.default)(res, 404, false, "Service not found");
        }
        return (0, responseHelper_1.default)(res, 200, true, "Pricing updated successfully", updatedService);
    }
    catch (error) {
        logger_1.default.error("Error updating pricing:", error);
        return (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.ServicePricing = ServicePricing;
const serviceMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { serviceId } = req.params;
        const photos = [];
        const videos = [];
        if (req.files) {
            for (const file of req.files) {
                console.log("File received:", file);
                console.log("File MIME type:", file.mimetype);
                console.log("File path for upload:", file.path);
                if (file.mimetype.startsWith("image")) {
                    if (photos.length < 2) {
                        const result = yield (0, cloudinary_1.uploadToCloudinary)(file.path, "service_media");
                        photos.push(result.secure_url);
                    }
                    else {
                        return (0, responseHelper_1.default)(res, 400, false, "You can upload a maximum of 2 images.");
                    }
                }
                else if (file.mimetype.startsWith("video")) {
                    if (videos.length < 5) {
                        const result = yield (0, cloudinary_1.uploadToCloudinary)(file.path, "service_media");
                        videos.push(result.secure_url);
                    }
                    else {
                        return (0, responseHelper_1.default)(res, 400, false, "You can upload a maximum of 5 videos.");
                    }
                }
            }
        }
        const updatedService = yield service_model_1.default.findByIdAndUpdate(serviceId, { $push: { "media.photos": { $each: photos }, "media.videos": { $each: videos } } }, { new: true });
        if (!updatedService) {
            return (0, responseHelper_1.default)(res, 404, false, "Service not found");
        }
        (0, responseHelper_1.default)(res, 200, true, "Media updated successfully", updatedService);
    }
    catch (error) {
        logger_1.default.error("Error updating media:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.serviceMedia = serviceMedia;
const breifDiscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { serviceId } = req.params;
        const { description } = req.body;
        const updatedService = yield service_model_1.default.findByIdAndUpdate(serviceId, { description }, { new: true });
        if (!updatedService) {
            return (0, responseHelper_1.default)(res, 404, false, "Service not found");
        }
        (0, responseHelper_1.default)(res, 200, true, "Description updated successfully", updatedService);
    }
    catch (error) {
        logger_1.default.error("Error updating description:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.breifDiscription = breifDiscription;
const addReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { serviceId } = req.params;
        const { stars, feedback } = req.body;
        const review = {
            user_id: req.user.id,
            stars,
            feedback
        };
        const updatedService = yield service_model_1.default.findByIdAndUpdate(serviceId, { $push: { reviews: review } }, { new: true });
        if (!updatedService) {
            return (0, responseHelper_1.default)(res, 404, false, "Service not found");
        }
        (0, responseHelper_1.default)(res, 200, true, "Review added successfully", updatedService);
    }
    catch (error) {
        logger_1.default.error("Error adding review:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.addReview = addReview;
const getAllServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield service_model_1.default.find();
        (0, responseHelper_1.default)(res, 200, true, "Services retrieved successfully", services);
    }
    catch (error) {
        logger_1.default.error("Error retrieving services:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.getAllServices = getAllServices;
const getArtistServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const artist_id = req.user.id;
        console.log("Authenticated User ID:", artist_id);
        const services = yield service_model_1.default.find({ artist_id });
        if (services.length === 0) {
            return (0, responseHelper_1.default)(res, 200, true, "No services found for this artist", []);
        }
        (0, responseHelper_1.default)(res, 200, true, "Artist services retrieved successfully", services);
    }
    catch (error) {
        logger_1.default.error("Error retrieving artist services:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.getArtistServices = getArtistServices;
const getServiceById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serviceId } = req.params;
        const service = yield service_model_1.default.findById(serviceId).populate("artist_id", "name email profilePicture username location profile_description");
        if (!service) {
            return (0, responseHelper_1.default)(res, 404, false, "Service not found");
        }
        console.log("Populated Service:", service);
        (0, responseHelper_1.default)(res, 200, true, "Service details retrieved successfullyyyyyyyyyyy", service);
    }
    catch (error) {
        logger_1.default.error("Error retrieving service details : ", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal server error");
    }
});
exports.getServiceById = getServiceById;
const deleteServiceById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { serviceId } = req.params;
        const deletedService = yield service_model_1.default.findByIdAndDelete(serviceId);
        if (!deletedService) {
            return (0, responseHelper_1.default)(res, 404, false, "Service not found");
        }
        (0, responseHelper_1.default)(res, 200, true, "Service deleted successfully", deletedService);
    }
    catch (error) {
        logger_1.default.error("Error deleting service:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.deleteServiceById = deleteServiceById;
const updateServiceBasicInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { serviceId } = req.params;
        const { title, category, subcategory, description, searchTags } = req.body;
        const updateService = yield service_model_1.default.findByIdAndUpdate(serviceId, {
            title, category, subcategory, description, searchTags
        }, { new: true });
        if (!updateService) {
            return (0, responseHelper_1.default)(res, 404, false, "Service not found");
        }
        (0, responseHelper_1.default)(res, 200, true, "Service updated successfully", updateService);
    }
    catch (error) {
        logger_1.default.error("Error updating service info:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal server error");
    }
});
exports.updateServiceBasicInfo = updateServiceBasicInfo;
const updateServicePricing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { serviceId } = req.params;
        const { starter, standard, advance } = req.body;
        // Create an object to hold the updates
        const pricingUpdate = {};
        if (starter)
            pricingUpdate.starter = starter;
        if (standard)
            pricingUpdate.standard = standard;
        if (advance)
            pricingUpdate.advance = advance;
        const updatedService = yield service_model_1.default.findByIdAndUpdate(serviceId, { $set: { pricing: Object.assign({}, pricingUpdate) } }, { new: true });
        if (!updatedService) {
            return (0, responseHelper_1.default)(res, 404, false, "Service not found");
        }
        (0, responseHelper_1.default)(res, 200, true, "Pricing updated successfully", updatedService);
    }
    catch (error) {
        logger_1.default.error("Error updating pricing:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.updateServicePricing = updateServicePricing;
const updateServiceDescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { serviceId } = req.params;
        const { serviceDescription } = req.body;
        const updatedService = yield service_model_1.default.findByIdAndUpdate(serviceId, { serviceDescription }, { new: true });
        if (!updatedService) {
            return (0, responseHelper_1.default)(res, 404, false, "Service not found");
        }
        (0, responseHelper_1.default)(res, 200, true, "Service description updated successfully", updatedService);
    }
    catch (error) {
        logger_1.default.error("Error updating service description:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.updateServiceDescription = updateServiceDescription;
const updateServiceMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized access");
        }
        const { serviceId } = req.params;
        const photos = [];
        const videos = [];
        if (req.files) {
            for (const file of req.files) {
                console.log("File received:", file);
                console.log("File MIME type:", file.mimetype);
                console.log("File path for upload:", file.path);
                if (file.mimetype.startsWith("image")) {
                    if (photos.length < 2) {
                        const result = yield (0, cloudinary_1.uploadToCloudinary)(file.path, "service_media");
                        photos.push(result.secure_url);
                    }
                    else {
                        return (0, responseHelper_1.default)(res, 400, false, "You can upload a maximum of 2 images.");
                    }
                }
                else if (file.mimetype.startsWith("video")) {
                    if (videos.length < 5) {
                        const result = yield (0, cloudinary_1.uploadToCloudinary)(file.path, "service_media");
                        videos.push(result.secure_url);
                    }
                    else {
                        return (0, responseHelper_1.default)(res, 400, false, "You can upload a maximum of 5 videos.");
                    }
                }
            }
        }
        const updatedService = yield service_model_1.default.findByIdAndUpdate(serviceId, {
            media: {
                photos: photos.length > 0 ? photos : undefined,
                videos: videos.length > 0 ? videos : undefined
            }
        }, { new: true });
        if (!updatedService) {
            return (0, responseHelper_1.default)(res, 404, false, "Service not found");
        }
        (0, responseHelper_1.default)(res, 200, true, "Media updated successfully", updatedService);
    }
    catch (error) {
        logger_1.default.error("Error updating media:", error);
        (0, responseHelper_1.default)(res, 500, false, "Internal Server Error");
    }
});
exports.updateServiceMedia = updateServiceMedia;
