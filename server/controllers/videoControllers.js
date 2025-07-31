import fs from "fs";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { downloadFileFromS3, transcodeVideo } from "../worker/worker.js";
import prisma from "../db/db.config.js";
import dotenv from "dotenv";
import cleanFileName from "../utils/CleanFileNamE.js";
dotenv.config();

const Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadFileToS3 = async (req, res) => {
  const file = req.file;
  console.log(file);

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const fileStream = fs.createReadStream(file.path);
    const s3RawKey = `raw/${file.originalname}`;
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3RawKey,
      Body: fileStream,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);
    await Client.send(command);

    const localFilePath = await downloadFileFromS3(s3RawKey);
    const cleanedPath = await cleanFileName(localFilePath);

    const transcodedVideos = await transcodeVideo(cleanedPath);

    const savedVideos = [];

    console.log(transcodedVideos);

    for (const { resolution, s3Key } of transcodedVideos) {
      const video = await prisma.video.create({
        data: {
          originalS3Key: s3RawKey,
          transcodedS3Key: s3Key,
          resolution,
          userId: req.user.userId,
        },
      });
      savedVideos.push(video);

      console.log(savedVideos);
    }

    res.json({
      rawVideoS3Key: s3RawKey,
      transcodedVideos: savedVideos,
    });
  } catch (error) {
    console.error("Upload or processing error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const DownloadVideo = async (req, res) => {
  try {
    const rawKey = decodeURIComponent(req.params.key);

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_PRODUCTION_BUCKET_NAME,
      Key: rawKey,
      ResponseContentDisposition: "attachment",
    });

    const signedUrl = await getSignedUrl(Client, command, {
      expiresIn: 3600,
    });

    return res.redirect(signedUrl);
  } catch (error) {
    console.error(" Signed URL generation error:", error.message);
    return res.status(404).json({ error: "File not found or inaccessible" });
  }
};

export const getAllVideos = async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      where: {
        userId: req.user.userId,
      },
    });

    res.status(200).json(videos);
  } catch (error) {
    console.error(" Signed URL generation error:", error.message);
    return res.status(404).json({ error: "File not found or inaccessible" });
  }
};
