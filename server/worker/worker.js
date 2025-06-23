import dotenv from "dotenv";
dotenv.config();

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import ffmpeg from "fluent-ffmpeg";

import { createReadStream, createWriteStream } from "fs";
import { mkdir } from "fs/promises";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESOLUTIONS = [
  { name: "360p", width: 480, height: 360 },
  { name: "480p", width: 640, height: 480 },
  { name: "720p", width: 1280, height: 720 },
  { name: "1080p", width: 1920, height: 1080 },
];

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Default videos folder inside container folder
// const VIDEOS_DIR = path.resolve(__dirname, "videos"); // will create/use a 'videos' folder relative to current file

const VIDEOS_DIR = path.resolve("/app/videos"); // will create/use a 'videos' folder relative to the app folder
async function ensureDirExists(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    console.error("Error creating directory", err);
    throw err;
  }
}

async function downloadFileFromS3(key, baseDir = VIDEOS_DIR) {
  await ensureDirExists(baseDir);

  const Bucket = "video-transcoder-raw-s3";
  const filename = path.basename(key);
  const localFilePath = path.join(baseDir, filename);

  console.log("Downloading S3 file key:", key);
  console.log("Saving file locally to:", localFilePath);

  try {
    const command = new GetObjectCommand({ Bucket, Key: key });
    const result = await s3Client.send(command);

    return new Promise((resolve, reject) => {
      const fileStream = createWriteStream(localFilePath);

      result.Body.once("error", (err) => {
        console.error("Error in S3 stream:", err);
        reject(err);
      });

      fileStream.once("error", (err) => {
        console.error("Error writing file:", err);
        reject(err);
      });

      fileStream.once("finish", () => {
        console.log(`Downloaded ${filename} to ${localFilePath}`);
        resolve(localFilePath);
      });

      result.Body.pipe(fileStream);
    });
  } catch (error) {
    console.error("Error downloading file from S3:", error);
    throw error;
  }
}

async function uploadTranscodedVideo(filePath, resolutionName) {
  const Bucket = process.env.AWS_PRODUCTION_BUCKET_NAME;
  const key = `transcoded/${resolutionName}-${path.basename(filePath)}`;

  try {
    const fileStream = createReadStream(filePath);
    const uploadParams = {
      Bucket: Bucket,
      Key: key,
      Body: fileStream,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    console.log(`Uploaded ${resolutionName} video to S3 as ${key}`);
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
}

async function transcodeVideo(inputPath) {
  await ensureDirExists(VIDEOS_DIR);

  const results = await Promise.all(
    RESOLUTIONS.map((resolution) => {
      return new Promise((resolve, reject) => {
        const outputPath = path.join(
          VIDEOS_DIR,
          `${resolution.name}-video.mp4`
        );
        const s3Key = `transcoded/${resolution.name}-${path.basename(
          outputPath
        )}`;

        ffmpeg(inputPath)
          .output(outputPath)
          .videoCodec("libx264")
          .audioCodec("aac")
          .size(`${resolution.width}x${resolution.height}`)
          .format("mp4")
          .on("end", async () => {
            try {
              console.log(`Transcoding complete: ${outputPath}`);
              await uploadTranscodedVideo(outputPath, resolution.name);
              resolve({ resolution: resolution.name, outputPath, s3Key });
            } catch (err) {
              reject(err);
            }
          })
          .on("error", (err) => {
            console.error(
              `Error transcoding video to ${resolution.name}:`,
              err
            );
            reject(err);
          })
          .run();
      });
    })
  );

  console.log("All videos transcoded and uploaded:", results);
  return results;
}

export { downloadFileFromS3, transcodeVideo, uploadTranscodedVideo };
