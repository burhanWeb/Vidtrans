import {
  uploadFileToS3,
  DownloadVideo,
} from "../controllers/videoControllers.js";
import { upload } from "../middleware/multerMiddleware.js";
import ProtectedRoute from "../middleware/protectedRoute.js";
import express from "express";

const router = express.Router();

router.post("/upload", ProtectedRoute, upload.single("video"), uploadFileToS3);
router.get("/download/:key", DownloadVideo);
export default router;
