import videoRoutes from "./routes/videoRoutes.js";
import DownloadRoutes from "./routes/videoRoutes.js";
import cookieParser from "cookie-parser";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
const app = express();

// Middleware Setup
// app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/videos", videoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/download", DownloadRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Video Processing API");
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
