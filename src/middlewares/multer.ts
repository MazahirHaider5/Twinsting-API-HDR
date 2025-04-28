import multer from "multer";
import path from "path";
import fs from "fs";

const createMulterUploader = (
  allowedTypes: string[],
  uploadFolder: string,
  maxFileSize: number = 1000 * 1024 * 1024
) => {
  const ensureDirectoryExists = (folderPath: string) => {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true }); // Ensure directory exists
    }
  };

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join("uploads", uploadFolder);
      ensureDirectoryExists(uploadPath); 
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const fileExtension = path.extname(file.originalname);
      const filename = `${Date.now()}${fileExtension}`;
      cb(null, filename);
    },
  });

  const fileFilter = (req: any, file: any, cb: any) => {
    console.log("File received:", file); // Log the file received
    console.log("File size:", file.size); // Log the file size
    const isAllowed = allowedTypes.some((type) =>
      file.mimetype.toLowerCase().includes(type.toLowerCase())
    );

    if (isAllowed) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(", ")}.`
        ),
        false
      );
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxFileSize },
  });
};

export default createMulterUploader;
