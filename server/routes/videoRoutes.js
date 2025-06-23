import { uploadFileToS3 } from "../controllers/videoControllers.js";
import { upload } from "../middleware/multerMiddleware.js";
import ProtectedRoute from "../middleware/protectedRoute.js";
import express from "express";

const router = express.Router();

router.post("/upload", ProtectedRoute, upload.single("file"), uploadFileToS3);

export default router;
