import express from "express";
import { uploadMultiple } from "../middleware/multer.js"; 
import { processMultipleDocuments } from "../controllers/handleDocumentUploadAndProcess.js";

const route = express.Router();

route.post("/", uploadMultiple, processMultipleDocuments);

export default route;
