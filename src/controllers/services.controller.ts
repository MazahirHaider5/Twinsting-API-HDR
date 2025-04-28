import { Request, Response } from "express";
import Service from "../models/service.model";
import sendResponse from "../utils/responseHelper";
import logger from "../config/logger";
import { uploadToCloudinary } from "../utils/cloudinary";

export const createService = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { title, category, subcategory, description, searchTags } = req.body;
    const artist_id = req.user.id;

    const newService = new Service({
      artist_id,
      title,
      category,
      subcategory,
      description,
      searchTags
    });

    await newService.save();
    sendResponse(res, 201, true, "Service created successfully", newService);
  } catch (error) {
    logger.error("Error creating service:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const ServicePricing = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { serviceId } = req.params;
    const { starter, standard, advance } = req.body;

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { pricing: { starter, standard, advance } },
      { new: true }
    );

    if (!updatedService) {
      return sendResponse(res, 404, false, "Service not found");
    }

    sendResponse(res, 200, true, "Pricing updated successfully", updatedService);
  } catch (error) {
    logger.error("Error updating pricing:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const serviceMedia = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { serviceId } = req.params;

    const photos: string[] = [];
    const videos: string[] = [];

    if (req.files) {
      for (const file of req.files as Express.Multer.File[]) {
        console.log("File received:", file);
        console.log("File MIME type:", file.mimetype);
        console.log("File path for upload:", file.path);

        if (file.mimetype.startsWith("image")) {
          if (photos.length < 2) {
            const result = await uploadToCloudinary(file.path, "service_media");
            photos.push(result.secure_url);
          } else {
            return sendResponse(res, 400, false, "You can upload a maximum of 2 images.");
          }
        } else if (file.mimetype.startsWith("video")) {
          if (videos.length < 5) {
            const result = await uploadToCloudinary(file.path, "service_media");
            videos.push(result.secure_url);
          } else {
            return sendResponse(res, 400, false, "You can upload a maximum of 5 videos.");
          }
        }
      }
    }

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { $push: { "media.photos": { $each: photos }, "media.videos": { $each: videos } } },
      { new: true }
    );

    if (!updatedService) {
      return sendResponse(res, 404, false, "Service not found");
    }

    sendResponse(res, 200, true, "Media updated successfully", updatedService);
  } catch (error) {
    logger.error("Error updating media:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const breifDiscription = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { serviceId } = req.params;
    const { description } = req.body;

    const updatedService = await Service.findByIdAndUpdate(serviceId, { description }, { new: true });

    if (!updatedService) {
      return sendResponse(res, 404, false, "Service not found");
    }

    sendResponse(res, 200, true, "Description updated successfully", updatedService);
  } catch (error) {
    logger.error("Error updating description:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const addReview = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { serviceId } = req.params;
    const { stars, feedback } = req.body;

    const review = {
      user_id: req.user.id,
      stars,
      feedback
    };

    const updatedService = await Service.findByIdAndUpdate(serviceId, { $push: { reviews: review } }, { new: true });

    if (!updatedService) {
      return sendResponse(res, 404, false, "Service not found");
    }

    sendResponse(res, 200, true, "Review added successfully", updatedService);
  } catch (error) {
    logger.error("Error adding review:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find();
    sendResponse(res, 200, true, "Services retrieved successfully", services);
  } catch (error) {
    logger.error("Error retrieving services:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const getArtistServices = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const artist_id = req.user.id;
    console.log("Authenticated User ID:", artist_id);

    const services = await Service.find({ artist_id });

    if (services.length === 0) {
      return sendResponse(res, 200, true, "No services found for this artist", []);
    }

    sendResponse(res, 200, true, "Artist services retrieved successfully", services);
  } catch (error) {
    logger.error("Error retrieving artist services:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);
    if (!service) {
      return sendResponse(res, 404, false, "Service not found");
    }
    sendResponse(res, 200, true, "Service details retrieved successfully", service);
  } catch (error) {
    logger.error("Error retrieving service details : ", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

export const deleteServiceById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { serviceId } = req.params;

    const deletedService = await Service.findByIdAndDelete(serviceId);

    if (!deletedService) {
      return sendResponse(res, 404, false, "Service not found");
    }

    sendResponse(res, 200, true, "Service deleted successfully", deletedService);
  } catch (error) {
    logger.error("Error deleting service:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const updateServiceBasicInfo = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access")
    }
    const {serviceId} = req.params;
    const {title, category, subcategory, description, searchTags} = req.body;

    const updateService = await Service.findByIdAndUpdate(
      serviceId,
      {
        title, category, subcategory, description, searchTags
      },
      {new: true}
    );
    if (!updateService) {
      return sendResponse(res, 404, false, "Service not found");
    }
    sendResponse(res, 200, true, "Service updated successfully", updateService);
  } catch (error) {
    logger.error("Error updating service info:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

export const updateServicePricing = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { serviceId } = req.params;
    const { starter, standard, advance } = req.body;

    // Create an object to hold the updates
    const pricingUpdate: any = {};
    if (starter) pricingUpdate.starter = starter;
    if (standard) pricingUpdate.standard = standard;
    if (advance) pricingUpdate.advance = advance;

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { $set: { pricing: { ...pricingUpdate } } },
      { new: true }
    );

    if (!updatedService) {
      return sendResponse(res, 404, false, "Service not found");
    }

    sendResponse(res, 200, true, "Pricing updated successfully", updatedService);
  } catch (error) {
    logger.error("Error updating pricing:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const updateServiceDescription = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { serviceId } = req.params;
    const { serviceDescription } = req.body;

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { serviceDescription },
      { new: true }
    );

    if (!updatedService) {
      return sendResponse(res, 404, false, "Service not found");
    }

    sendResponse(res, 200, true, "Service description updated successfully", updatedService);
  } catch (error) {
    logger.error("Error updating service description:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const updateServiceMedia = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized access");
    }

    const { serviceId } = req.params;
    const photos: string[] = [];
    const videos: string[] = [];

    if (req.files) {
      for (const file of req.files as Express.Multer.File[]) {
        console.log("File received:", file);
        console.log("File MIME type:", file.mimetype);
        console.log("File path for upload:", file.path);

        if (file.mimetype.startsWith("image")) {
          if (photos.length < 2) {
            const result = await uploadToCloudinary(file.path, "service_media");
            photos.push(result.secure_url);
          } else {
            return sendResponse(res, 400, false, "You can upload a maximum of 2 images.");
          }
        } else if (file.mimetype.startsWith("video")) {
          if (videos.length < 5) {
            const result = await uploadToCloudinary(file.path, "service_media");
            videos.push(result.secure_url);
          } else {
            return sendResponse(res, 400, false, "You can upload a maximum of 5 videos.");
          }
        }
      }
    }

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { 
        media: {
          photos: photos.length > 0 ? photos : undefined,
          videos: videos.length > 0 ? videos : undefined
        }
      },
      { new: true }
    );

    if (!updatedService) {
      return sendResponse(res, 404, false, "Service not found");
    }

    sendResponse(res, 200, true, "Media updated successfully", updatedService);
  } catch (error) {
    logger.error("Error updating media:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};