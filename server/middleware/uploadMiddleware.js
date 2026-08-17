const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create upload middleware based on folder
const createUpload = (folderName) => {
  const uploadDir = path.join(__dirname, `../uploads/${folderName}`);

  // Create folder if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
      const uniqueName =
        `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
        path.extname(file.originalname);

      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;

    const extName = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      return cb(null, true);
    }

    cb(
      new Error(
        "Only JPG, JPEG, PNG, PDF, DOC and DOCX files are allowed."
      )
    );
  };

  return multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter,
  });
};

// Profile photo upload
const profileUpload = createUpload("profile");

// Weekly report attachment upload
const reportUpload = createUpload("reports");

// Teacher signature upload
const signatureUpload = createUpload("signatures");

// Manager signature upload
const managerSignatureUpload = createUpload("manager-signatures");
module.exports = {
  profileUpload,
  reportUpload,
  signatureUpload,
  managerSignatureUpload,
};