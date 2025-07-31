import {
  uploadFileToS3,
  DownloadVideo,
  getAllVideos,
} from "../controllers/videoControllers.js";
import { upload } from "../middleware/multerMiddleware.js";
import ProtectedRoute from "../middleware/protectedRoute.js";
import express from "express";

const router = express.Router();

router.post("/upload", ProtectedRoute, upload.single("video"), uploadFileToS3);
router.get("/download/:key", DownloadVideo);
router.get("/allvideos", ProtectedRoute, getAllVideos);
export default router;
