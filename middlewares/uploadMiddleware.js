const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const createUploadDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const getUploadMiddleware = (uploadDir, fileTypes) => {
  createUploadDirIfNotExists(uploadDir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const originalName = path.basename(file.originalname, ext);
      cb(null, `${originalName}-${Date.now()}${ext}`);
    },
  });

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (fileTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"), false);
      }
    },
  });

  const processImage = async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const outputFilePath = filePath.replace(ext, ".jpg");
    if (ext !== ".jpg") {
      await sharp(filePath)
        .resize(200, 200)
        .jpeg({ quality: 80 })
        .toFile(outputFilePath);
      fs.unlinkSync(filePath);
    }
    return outputFilePath;
  };

  return { upload, processImage };
};

module.exports = getUploadMiddleware;
