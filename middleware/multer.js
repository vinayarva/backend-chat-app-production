import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

// Export as array handler for multiple files
export const uploadMultiple = upload.array("files", 10); // max 5 files

export default upload;
