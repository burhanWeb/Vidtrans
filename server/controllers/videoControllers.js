import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { downloadFileFromS3, transcodeVideo } from "../worker/worker.js";
import prisma from "../db/db.config.js";
import dotenv from "dotenv";
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
    const transcodedVideos = await transcodeVideo(localFilePath);

    const savedVideos = [];

    console.log(transcodedVideos);

    for (const { resolution, s3Key } of transcodedVideos) {
      const video = await prisma.video.create({
        data: {
          originalS3Key: s3RawKey,
          transcodedS3Key: s3Key,
          resolution,
          userId: req.userId,
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
